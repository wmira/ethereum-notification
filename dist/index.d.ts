import Web3 from 'web3';
import { Observable } from 'rxjs';
import { EthereumTransctionStreamOption, Erc20Store, Transaction } from './types';
export declare const DEFAULT_TRANSACTION_STREAM_OPTION: EthereumTransctionStreamOption;
/**
 *
 * @param web3 Web3 instance
 * @param lastKnown The value lastKnown to initially use, defaults to 0
 */
export declare const createBlockNumberStream: (web3: Web3, options: EthereumTransctionStreamOption) => Observable<number>;
/**
 *
 * Returns an Observable of Transaction that can be used for notification.
 *
 * @param web3
 * @param erc20Store
 * @param options
 */
export declare const createEthereumTransactionStream: (web3: Web3, erc20Store: Erc20Store, options?: EthereumTransctionStreamOption) => Observable<Transaction>;
