const INJECTMANY = require('../inject-many.js');

jest.useFakeTimers();

const nextLoop = () => new Promise((resolve) => setImmediate(resolve));

describe('check', () => {
	test('expect zero inputs', () => {
		expect(() => INJECTMANY.check({
			input: [ {} ],
			output: [ {name: 'test'} ],
			inject: () => {},
			interval: 123
		})).toThrow('No inputs can be specified');
	});

	test('expect at least one output', () => {
		expect(() => INJECTMANY.check({
			input: [],
			output: [],
			inject: () => {},
			interval: 123
		})).toThrow('At least one output must be specified');
	});

	test('all output must have names', () => {
		expect(() => INJECTMANY.check({
			input: [],
			output: [{name: 'test'}, {}],
			inject: () => {},
			interval: 123
		})).toThrow('All outputs must have the property name');
	});

	test('expect inject function', () => {
		expect(() => INJECTMANY.check({
			input: [],
			output: [ {name: 'test'} ],
			interval: 42
		})).toThrow('Inject function must be specified');
	});

	test('expect interval', () => {
		expect(() => INJECTMANY.check({
			input: [],
			output: [ {name: 'test'} ],
			inject: () => {}
		})).toThrow('Interval must be specified');
	});

	test('defaults', () => {
		const opts = {
			input: [],
			output: [ {name: 'test'} ],
			inject: () => {},
			interval: 123
		};
		INJECTMANY.check(opts);
		expect(opts.logLevelInject).toEqual('warn');
	});
});

describe('factory', () => {
	test('call inject function on timer interval', () => {
		const inject = jest.fn(() => ({}));
		const interval = 1000;
		INJECTMANY.factory({inject, interval}, [], [{}]);
		expect(inject.mock.calls.length).toBe(0);
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(2);
	});

	test('emit return value', async () => {
		const v1 = {};
		const v2 = {};
		const inject = jest.fn(() => Promise.resolve({
			'test1': v1,
			'test2': v2
		}));
		const interval = 1000;
		const output = {
			'test1': {},
			'test2': {}
		};
		INJECTMANY.factory({inject, interval}, [], output);
		jest.advanceTimersByTime(interval);
		await nextLoop();
		expect(output.test1.value).toBe(v1);
		expect(output.test2.value).toBe(v2);
	});

	test('ignore unknown keys', async () => {
		const v1 = {};
		const v2 = {};
		const inject = jest.fn(() => Promise.resolve({
			'test1': v1,
			'test2': v2
		}));
		const interval = 1000;
		const output = {
			'test1': {}
		};
		INJECTMANY.factory({inject, interval}, [], output);
		jest.advanceTimersByTime(interval);
		await nextLoop();
		expect(output.test1.value).toBe(v1);
	});

	test('stop interval after calling destroy', () => {
		const inject = jest.fn(() => ({}));
		const interval = 1000;
		const destroy = INJECTMANY.factory({inject, interval}, [], [{}]);
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
		destroy();
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
	});

	test('ignore thrown errors', () => {
		const inject = jest.fn(() => { throw new Error(); });
		const interval = 1000;
		INJECTMANY.factory({inject, interval, logLevelInject: null}, [], {}, {});
		jest.advanceTimersByTime(interval);
	});

	test('report thrown errors', () => {
		const err = new Error();
		const inject = jest.fn(() => { throw err; });
		const interval = 1000;
		const error = jest.fn();
		INJECTMANY.factory({inject, interval, logLevelInject: 'error'}, [], {}, {error});
		jest.advanceTimersByTime(interval);
		expect(error.mock.calls[0][0]).toBe(err);
		expect(error.mock.calls[0][1]).toEqual('ab9f3a0a26807d67d0bb2abd987fd378');
	});
});
