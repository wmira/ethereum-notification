"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
/**
 * Does a simple cache, you can turn it off and do your own caching (e.g. redis)
 *
 * @param web3
 *
 */
exports.createErc20Resolver = (web3, cacheResult = true) => {
    const cache = {};
    return {
        resolveToken(contract) {
            const contractInstance = new web3.eth.Contract(erc20_abi_1.erc20ABI, contract);
            if (cache[contract]) {
                return cache[contract];
            }
            return new Promise((resolve, reject) => {
                console.log('saving erc20 data info...');
                (() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const symbol = yield contractInstance.methods.symbol().call();
                        const decimalPlaces = yield contractInstance.methods.decimals().call();
                        const erc20Data = { symbol, contract, decimal: decimalPlaces };
                        cache[contract] = Promise.resolve(erc20Data);
                        resolve(erc20Data);
                    }
                    catch (e) {
                        console.log(e);
                        reject('Error occured while retrieving erctoken data');
                    }
                }))();
            });
        }
    };
};
const createTransactionObservable = (web3, transaction) => {
    return rxjs_1.of({
        blockNumber: transaction.blockNumber,
        blockHash: transaction.blockHash,
        hash: transaction.hash,
        to: transaction.to,
        from: transaction.from,
        symbol: `${ETH_SYMBOL}`,
        value: web3.utils.fromWei(transaction.value, 'ether')
    });
};
exports.createTokenTransferMapper = (web3, decoder, erc20Resolver) => {
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
                    return rxjs_1.from(erc20Resolver.resolveToken(transaction.to))
                        .pipe(operators_1.map(erc20Info => {
                        return {
                            blockNumber: transaction.blockNumber,
                            blockHash: transaction.blockHash,
                            value: transaction.value,
                            hash: transaction.hash,
                            to: transaction.to,
                            contract: transaction.to,
                            from: transaction.from,
                            symbol: erc20Info.symbol,
                            token_transfer: {
                                to: toFromInput,
                                from: transaction.from,
                                value: utils_1.parseTokenTransferValue(decodedInput.inputs[1], erc20Info),
                                token: erc20Info
                            }
                            //value: 
                        };
                    }), operators_1.catchError((e) => {
                        console.log('Error when resolving erc20 ', e);
                        return createTransactionObservable(web3, transaction);
                    }));
                }
            }
        }
        return createTransactionObservable(web3, transaction);
    };
};
//# sourceMappingURL=erc20.js.map