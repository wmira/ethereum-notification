"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const erc20_1 = require("./erc20");
const utils_1 = require("./utils");
exports.DEFAULT_TRANSACTION_STREAM_OPTION = Object.freeze({
    getBlockRetryCount: 2,
    getLatestBlockInterval: 15000,
    lastKnownBlockNumberStart: 0
});
/**
 * Create a latest block
 *
 * @param interval$
 */
const createLatestBlockStream = (interval$, web3, options) => {
    let lastKnown = options.lastKnownBlockNumberStart;
    return rxjs_1.Observable.create((observer) => {
        interval$.subscribe(() => {
            web3.eth.getBlock('latest', false, (err, result) => {
                if (err) {
                    console.log('error retrieving latest block ', err);
                }
                else {
                    let newLastKnown = result.number;
                    observer.next({ lastKnown, latest: result.number });
                    lastKnown = result.number;
                }
            });
        });
    });
};
/**
 *
 * @param web3 Web3 instance
 * @param lastKnown The value lastKnown to initially use, defaults to 0
 */
exports.createBlockNumberStream = (web3, options) => {
    const interval$ = rxjs_1.interval(options.getLatestBlockInterval).pipe(operators_1.startWith(0)); //ensure we immediately start
    return createLatestBlockStream(interval$, web3, options)
        .pipe(operators_1.distinctUntilChanged(utils_1.latestBlockMatches), operators_1.map(utils_1.expandLatestBlock), operators_1.concatMap((blockNumbers) => rxjs_1.from(blockNumbers)));
};
/**
 *
 * Returns an Observable of Transaction that can be used for notification.
 *
 * @param web3
 * @param erc20Store
 * @param options
 */
exports.createEthereumTransactionStream = (web3, erc20Store, options = exports.DEFAULT_TRANSACTION_STREAM_OPTION) => {
    const blockNumber$ = exports.createBlockNumberStream(web3, options);
    const tokenTransferMapper = erc20_1.createTokenTransferMapper(web3, erc20_1.createDecoder(), erc20Store);
    const transactions$ = blockNumber$.pipe(operators_1.flatMap((blockNumber) => {
        return rxjs_1.from(web3.eth.getBlock(blockNumber, true))
            .pipe(operators_1.retry(options.getBlockRetryCount), //retry if there is an error
        operators_1.catchError((e) => rxjs_1.of('error: ' + e)));
    }), operators_1.filter((block) => {
        return block && block.hash !== null && block.transactions && block.transactions.length > 0;
    }), operators_1.concatMap((block) => {
        return rxjs_1.from(block.transactions.filter(tran => tran.to && tran.from));
    }), operators_1.flatMap(tokenTransferMapper));
    return transactions$;
};
//# sourceMappingURL=index.js.map