export interface Transaction {
    blockNumber: number
    blockHash: string
    hash: string
    to: string
    from: string
    value: string
    symbol: string
}

export interface TokenTransfer extends Transaction {
    contract: string
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