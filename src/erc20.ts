

import { of, from, Observable } from 'rxjs'
import { map, catchError, onErrorResumeNext } from 'rxjs/operators'
import { Transaction as EthereumTransaction } from 'web3/types';

import Web3 from 'web3'

import InputDataDecoder from 'ethereum-input-data-decoder'

import { parseTokenTransferValue } from './utils'
import { TokenTransfer, Transaction, Erc20Resolver, Erc20Token } from './types'
import { erc20ABI as abi } from './erc20_abi'

const ETH_SYMBOL = 'ETH'


export const createDecoder = (): InputDataDecoder => {
    const decoder = new InputDataDecoder(abi);    
    return decoder
}

export const getToFromDecodedInput = (input: any): string => {
        
    if ( input && input.name === 'transfer' && 
            Array.isArray(input.types) && 
            input.types.length > 0 &&
            input.types[0] === 'address' && 
            Array.isArray(input.inputs) &&
            input.inputs.length > 0 ) {
        
        return `0x${input.inputs[0]}`
    }

    return null
}                               

/**
 * Does a simple cache, you can turn it off and do your own caching (e.g. redis)
 * 
 * @param web3 
 * 
 */
export const createErc20Resolver = (web3: Web3, cacheResult: boolean = true): Erc20Resolver => {

    const cache: { [key: string]: Promise<Erc20Token> } = {}

    return {
        resolveToken(contract: string): Promise<Erc20Token> {
            const contractInstance = new web3.eth.Contract(abi, contract);        
            if ( cache[contract] ) {
                return cache[contract]
            }
            return new Promise( (resolve, reject) => {
                console.log('saving erc20 data info...');
                ( async () => {
                    try {
                        const symbol = await contractInstance.methods.symbol().call()
                        const decimalPlaces = await contractInstance.methods.decimals().call()
                        const erc20Data: Erc20Token = { symbol, contract, decimal: decimalPlaces }
                     	
                        if ( cacheResult && erc20Data ) {   
                            cache[contract] = Promise.resolve(erc20Data)
                        }
                        resolve(erc20Data)
                    } catch (e) {
                        console.log(e)
                        resolve(null)
                    }
                })();        
            })
        }
    }
}
const createTransactionObservable = (web3, transaction: EthereumTransaction): Observable<Transaction> => {
    return of({
        blockNumber: transaction.blockNumber,
        blockHash: transaction.blockHash,
        hash: transaction.hash,
        to: transaction.to, 
        from: transaction.from, 
        symbol: `${ETH_SYMBOL}`, 
        value: web3.utils.fromWei(transaction.value, 'ether') 
    })
}
export const createTokenTransferMapper = (web3: Web3, decoder: InputDataDecoder, erc20Resolver: Erc20Resolver) => {
    
    return ( transaction: EthereumTransaction ): Observable<Transaction> => {
       
        const { input } = transaction
        if ( input && input !== '0x' ) {
            let decodedInput = null;            
            try {
                decodedInput = decoder.decodeData(input)
            } catch ( err ) {
                console.error("Error on decode ", err)
            }
            if ( decodedInput != null ) {
                const toFromInput = getToFromDecodedInput(decodedInput)
                if ( toFromInput ) {
                    //to is the contract
                    return  of({
                        blockNumber: transaction.blockNumber,
                        blockHash: transaction.blockHash,
                        value: transaction.value,
                        hash: transaction.hash,
                        to: transaction.to,  //this is the contract
                        contract: transaction.to, 
                        from: transaction.from, 
                        symbol: '',
                        token_transfer: {
                            to: toFromInput,
                            from: transaction.from,
                            contract: transaction.to                                        
                        }
                    })                                                                                                        
                }
            }                        
        }
        return createTransactionObservable(web3, transaction)
    }
}
