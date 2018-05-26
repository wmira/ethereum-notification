"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestBlockMatches = (x, y) => {
    if (x.lastKnown === 0) {
        return false;
    }
    return x.lastKnown === y.lastKnown && x.latest === y.latest;
};
/**
 * If blocks are missed then this ensures that we will be able to check the block for the transaction
 *
 * @param latestBlock
 */
exports.expandLatestBlock = (latestBlock) => {
    const { lastKnown, latest } = latestBlock;
    if (lastKnown === 0) {
        return [latest];
    }
    let blocks = [];
    for (let i = lastKnown + 1; i <= latest; i++) {
        blocks = blocks.concat([i]);
    }
    return blocks;
};
exports.parseTokenTransferValue = (value, erc20, maxDecimalPlace = 4) => {
    const rawValue = value;
    const decimalLength = erc20.decimal;
    let paddedRawValue = rawValue;
    if (decimalLength > rawValue.length) {
        const padSize = decimalLength - rawValue.length;
        let pad = '';
        for (let i = 0; i < padSize; i++) {
            pad += '0';
        }
        paddedRawValue = `${pad}${paddedRawValue}`;
    }
    const wholeNumber = paddedRawValue.substring(0, paddedRawValue.length - erc20.decimal);
    const decimalPlace = paddedRawValue.substring(wholeNumber.length).substring(0, maxDecimalPlace);
    return `${parseInt(wholeNumber || '0')}.${decimalPlace}`;
};
//# sourceMappingURL=utils.js.map