import { Observable } from 'rxjs';
import { Transaction as EthereumTransaction } from 'web3/types';
import Web3 from 'web3';
import { Erc20Store, Transaction } from './types';
export declare const createDecoder: () => any;
export declare const getToFromDecodedInput: (input: any) => string;
export declare const createTokenTransferMapper: (web3: Web3, decoder: any, erc20Store: Erc20Store) => (transaction: EthereumTransaction) => Observable<Transaction>;
