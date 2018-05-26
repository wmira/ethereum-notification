import { LatestBlock, Erc20Token } from './types'

export const latestBlockMatches = ( x: LatestBlock, y: LatestBlock ): boolean => {
    if ( x.lastKnown === 0 ) {
        return false
    }
    return x.lastKnown === y.lastKnown && x.latest === y.latest
}

/**
 * If blocks are missed then this ensures that we will be able to check the block for the transaction
 * 
 * @param latestBlock 
 */
export const expandLatestBlock = (latestBlock: LatestBlock): number[] => {
    const { lastKnown, latest } = latestBlock
    
    if ( lastKnown === 0 ) {
        return [ latest ]
    }

    let blocks = []

    for( let i = lastKnown + 1; i <= latest; i ++ ) {
        blocks = blocks.concat([i])
    }

    return blocks

}


export const parseTokenTransferValue = (value: string, erc20: Erc20Token, maxDecimalPlace: number = 4) => {
    
        const rawValue = value       
        const decimalLength = erc20.decimal
    
        let paddedRawValue = rawValue
    
        if ( decimalLength > rawValue.length ) {
            const padSize = decimalLength - rawValue.length
            let pad = ''
            for ( let i =0; i < padSize; i++ ) {
                pad += '0'
            }
            paddedRawValue = `${pad}${paddedRawValue}`
        }
    
        const wholeNumber = paddedRawValue.substring(0, paddedRawValue.length - erc20.decimal)
        const decimalPlace = paddedRawValue.substring( wholeNumber.length ).substring(0, maxDecimalPlace)
        
        return `${wholeNumber || '0'}.${decimalPlace}`
     
}