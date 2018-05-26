import { Observable } from 'rxjs';
import { Transaction as EthereumTransaction } from 'web3/types';
import Web3 from 'web3';
import { Transaction, Erc20Resolver } from './types';
export declare const createDecoder: () => any;
export declare const getToFromDecodedInput: (input: any) => string;
/**
 * Does a simple cache, you can turn it off and do your own caching (e.g. redis)
 *
 * @param web3
 *
 */
export declare const createErc20Resolver: (web3: Web3, cacheResult?: boolean) => Erc20Resolver;
export declare const createTokenTransferMapper: (web3: Web3, decoder: any, erc20Resolver: Erc20Resolver) => (transaction: EthereumTransaction) => Observable<Transaction>;
