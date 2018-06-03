import { Transaction as Web3Transaction } from 'web3/types'

export interface Transaction {
    blockNumber: number
    blockHash: string
    hash: string
    to: string
    from: string
    value: string
    symbol: string
    token_transfer?: TokenTransfer
    token_transfer_value?: TokenTransferValue
    web3Transaction: Web3Transaction
}

export interface TokenTransfer {
    to: string
    from: string
    contract: string
    decoded_input: any
}

export interface TokenTransferValue extends TokenTransfer {
    value: string,
    token: Erc20Token
}

export interface Erc20Token {
    decimal: number
    symbol: string
    contract: string
}

export interface Erc20Resolver {
    resolveToken(contract: string): Promise<Erc20Token>
}

export interface EthereumTransctionStreamOption {
    getBlockRetryCount: number
    getLatestBlockInterval: number
    lastKnownBlockNumberStart: number
}

export interface LatestBlock {
    lastKnown: number
    latest: number
}
