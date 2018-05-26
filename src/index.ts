
import Web3 from 'web3'
import { Block } from 'web3/types';

import { interval, Observable, Observer, from, of, Subject } from 'rxjs'
import { 
    distinctUntilChanged, 
    concatMap, 
    map, 
    startWith, 
    flatMap,
    filter,
    retry,
    catchError
} from 'rxjs/operators'

import { createDecoder, createTokenTransferMapper } from './erc20'
import { expandLatestBlock, latestBlockMatches } from './utils'
import { EthereumTransctionStreamOption, Erc20Resolver, LatestBlock, Transaction } from './types';



export const DEFAULT_TRANSACTION_STREAM_OPTION: EthereumTransctionStreamOption = Object.freeze({
    getBlockRetryCount: 2,
    getLatestBlockInterval: 15000,
    lastKnownBlockNumberStart: 0
})

/**
 * Create a latest block
 * 
 * @param interval$ 
 */
const createLatestBlockStream = (interval$: Observable<number>, web3: Web3, options: EthereumTransctionStreamOption): Observable<LatestBlock> => {

    let lastKnown = options.lastKnownBlockNumberStart

    return Observable.create( (observer: Observer<LatestBlock>) => {

        interval$.subscribe( () => {
            web3.eth.getBlock('latest', false, (err: Error, result: Block) => {
                if ( err ) {
                    console.log('error retrieving latest block ', err)
                } else {
                    let newLastKnown = result.number
                    observer.next({ lastKnown, latest: result.number })
                    lastKnown = result.number 
                }
            })
        })        
    })
}

/**
 * 
 * @param web3 Web3 instance
 * @param lastKnown The value lastKnown to initially use, defaults to 0
 */
export const createBlockNumberStream = (web3: Web3, options: EthereumTransctionStreamOption): Observable<number> => {
    
    const interval$ = interval(options.getLatestBlockInterval).pipe( startWith(0) ) //ensure we immediately start
    
    return createLatestBlockStream(interval$, web3, options)
        .pipe(
            distinctUntilChanged(latestBlockMatches),
            map( expandLatestBlock ),
            concatMap( (blockNumbers: number[]) => from(blockNumbers) )
        )
                            
}

/**
 * 
 * Returns an Observable of Transaction that can be used for notification.
 * 
 * @param web3 
 * @param erc20Resolver 
 * @param options 
 */
export const createEthereumTransactionStream = (
    web3: Web3, 
    erc20Resolver: Erc20Resolver, 
    options: EthereumTransctionStreamOption = DEFAULT_TRANSACTION_STREAM_OPTION 
): Observable<Transaction> => {
    
    const blockNumber$ = createBlockNumberStream(web3, options)
    const tokenTransferMapper = createTokenTransferMapper(web3, createDecoder(), erc20Resolver)

    const transactions$ = blockNumber$.pipe(
        flatMap( (blockNumber: number) => {
            return from( web3.eth.getBlock(blockNumber, true) )                    
                        .pipe( 
                            retry(options.getBlockRetryCount), //retry if there is an error
                            catchError( (e) => of('error: ' + e))                            
                        ) 
                    
        }),
        filter( (block: Block ) => {
            return block && block.hash !== null && block.transactions && block.transactions.length > 0
        }),
        concatMap( (block: Block) => {
            return from( block.transactions.filter ( tran => tran.to && tran.from ) )
        }),
        flatMap( tokenTransferMapper )
    )

    return transactions$
}
