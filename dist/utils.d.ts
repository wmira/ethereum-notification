import { LatestBlock, Erc20Token } from './types';
export declare const latestBlockMatches: (x: LatestBlock, y: LatestBlock) => boolean;
/**
 * If blocks are missed then this ensures that we will be able to check the block for the transaction
 *
 * @param latestBlock
 */
export declare const expandLatestBlock: (latestBlock: LatestBlock) => number[];
export declare const parseTokenTransferValue: (value: string, erc20: Erc20Token, maxDecimalPlace?: number) => string;
