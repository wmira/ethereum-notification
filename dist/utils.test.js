"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('utils', () => {
    describe('latestBlockMatches', () => {
        it('returns false when previous is 0', () => {
            const prev = { lastKnown: 0, latest: 1 };
            const next = { lastKnown: 1, latest: 10 };
            expect(utils_1.latestBlockMatches(prev, next)).toBe(false);
        });
        it('returns true when both fields are equal', () => {
            const prev = { lastKnown: 1, latest: 2 };
            const next = { lastKnown: 1, latest: 2 };
            expect(utils_1.latestBlockMatches(prev, next)).toBe(true);
        });
        it('returns false when one of the fields is different', () => {
            const prev = { lastKnown: 1, latest: 2 };
            const next = { lastKnown: 1, latest: 5 };
            expect(utils_1.latestBlockMatches(prev, next)).toBe(false);
        });
    });
    describe('expandLatestBlock', () => {
        it('will not include lastKnown on the expanded array', () => {
            const latestBlock = { lastKnown: 1, latest: 4 };
            const results = utils_1.expandLatestBlock(latestBlock);
            expect(results.length).toBe(3);
            expect(results[0]).toBe(2);
            expect(results[1]).toBe(3);
            expect(results[2]).toBe(4);
        });
        it('will return empty array when lastKnown and latest are the same', () => {
            const latestBlock = { lastKnown: 1, latest: 1 };
            const results = utils_1.expandLatestBlock(latestBlock);
            expect(results.length).toBe(0);
        });
    });
});
//# sourceMappingURL=utils.test.js.map