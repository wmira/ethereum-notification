

import { of, from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Transaction as EthereumTransaction } from 'web3/types';

import Web3 from 'web3'

import InputDataDecoder from 'ethereum-input-data-decoder'

import { parseTokenTransferValue } from './utils'
import { TokenTransfer, Transaction, Erc20Resolver } from './types'
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
                    return from(erc20Resolver.resolveToken(transaction.to))
                        .pipe(
                            map( erc20Info => {
                                return {
                                    blockNumber: transaction.blockNumber,
                                    blockHash: transaction.blockHash,
                                    hash: transaction.hash,
                                    to: toFromInput, 
                                    contract: transaction.to, 
                                    from: transaction.from, 
                                    symbol: erc20Info.symbol,
                                    value: parseTokenTransferValue(decodedInput.inputs[1], erc20Info )
                                }
                            })
                        )                        
                }
            }                        
        }
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
}