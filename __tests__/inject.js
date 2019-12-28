const INJECT = require('../inject.js');

jest.useFakeTimers();

const nextLoop = () => new Promise((resolve) => setImmediate(resolve));

describe('check', () => {
	test('expect zero inputs', () => {
		expect(() => INJECT.check({
			input: [ {} ],
			output: [ {} ],
			inject: () => {},
			interval: 42
		})).toThrow('No inputs can be specified');
	});

	test('expect one output', () => {
		expect(() => INJECT.check({
			input: [],
			output: [],
			inject: () => {},
			interval: 42
		})).toThrow('One output must be specified');
	});

	test('expect inject function', () => {
		expect(() => INJECT.check({
			input: [],
			output: [ {} ],
			interval: 42
		})).toThrow('Inject function must be specified');
	});

	test('expect interval', () => {
		expect(() => INJECT.check({
			input: [],
			output: [ {} ],
			inject: () => {}
		})).toThrow('Interval must be specified');
	});

	test('defaults', () => {
		const opts = {
			input: [],
			output: [ {} ],
			inject: () => {},
			interval: 123
		};
		INJECT.check(opts);
		expect(opts.logLevelInject).toEqual('warn');
	});
});

describe('factory', () => {
	test('call inject function on timer interval', () => {
		const inject = jest.fn();
		const interval = 1000;
		INJECT.factory({inject, interval}, [], [{}]);
		expect(inject.mock.calls.length).toBe(0);
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(2);
	});

	test('emit return value', async () => {
		const VALUE = {};
		const inject = jest.fn(() => Promise.resolve(VALUE));
		const interval = 1000;
		const output = {};
		INJECT.factory({inject, interval}, [], [output]);
		jest.advanceTimersByTime(interval);
		await nextLoop();
		expect(output.value).toBe(VALUE);
	});

	test('stop interval after calling destroy', () => {
		const inject = jest.fn();
		const interval = 1000;
		const destroy = INJECT.factory({inject, interval}, [], [{}]);
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
		destroy();
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
	});

	test('ignore thrown errors', () => {
		const inject = jest.fn(() => { throw new Error(); });
		const interval = 1000;
		INJECT.factory({inject, interval, logLevelInject: null}, [], [{}], {});
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
	});

	test('reports thrown errors', () => {
		const err = new Error();
		const inject = jest.fn(() => { throw err; });
		const interval = 1000;
		const error = jest.fn();
		INJECT.factory({inject, interval, logLevelInject: 'error'}, [], [{}], {error});
		jest.advanceTimersByTime(interval);
		expect(error.mock.calls[0][0]).toBe(err);
		expect(error.mock.calls[0][1]).toEqual('9b483aeba990d87a73174b084445c79b');
	});
});
