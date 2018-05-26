"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const ethereum_input_data_decoder_1 = __importDefault(require("ethereum-input-data-decoder"));
const utils_1 = require("./utils");
const erc20_abi_1 = require("./erc20_abi");
const ETH_SYMBOL = 'ETH';
exports.createDecoder = () => {
    const decoder = new ethereum_input_data_decoder_1.default(erc20_abi_1.erc20ABI);
    return decoder;
};
exports.getToFromDecodedInput = (input) => {
    if (input && input.name === 'transfer' &&
        Array.isArray(input.types) &&
        input.types.length > 0 &&
        input.types[0] === 'address' &&
        Array.isArray(input.inputs) &&
        input.inputs.length > 0) {
        return `0x${input.inputs[0]}`;
    }
    return null;
};
exports.createTokenTransferMapper = (web3, decoder, erc20Store) => {
    return (transaction) => {
        const { input } = transaction;
        if (input && input !== '0x') {
            let decodedInput = null;
            try {
                decodedInput = decoder.decodeData(input);
            }
            catch (err) {
                console.error("Error on decode ", err);
            }
            if (decodedInput != null) {
                const toFromInput = exports.getToFromDecodedInput(decodedInput);
                if (toFromInput) {
                    //to is the contract
                    return rxjs_1.from(erc20Store.getErc20TokenInfo(transaction.to))
                        .pipe(operators_1.map(erc20Info => {
                        return {
                            to: toFromInput,
                            contract: transaction.to,
                            from: transaction.from,
                            symbol: erc20Info.symbol,
                            value: utils_1.parseTokenTransferValue(decodedInput.inputs[1], erc20Info)
                        };
                    }));
                }
            }
        }
        return rxjs_1.of({ to: transaction.to, from: transaction.from, symbol: `${ETH_SYMBOL}`, value: web3.utils.fromWei(transaction.value, 'ether') });
    };
};
//# sourceMappingURL=erc20.js.map