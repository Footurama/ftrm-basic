const INJECT = require('../inject.js');

jest.useFakeTimers();

const nextLoop = () => new Promise((resolve) => setImmediate(resolve));

describe('check', () => {
	test('expect zero inputs', () => {
		try {
			INJECT.check({
				input: [ {} ],
				output: [ {} ],
				inject: () => {},
				interval: 42
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('No inputs can be specified');
		}
	});

	test('expect one output', () => {
		try {
			INJECT.check({
				input: [],
				output: [],
				inject: () => {},
				interval: 42
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('One output must be specified');
		}
	});

	test('expect inject function', () => {
		try {
			INJECT.check({
				input: [],
				output: [ {} ],
				interval: 42
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('Inject function must be specified');
		}
	});

	test('expect interval', () => {
		try {
			INJECT.check({
				input: [],
				output: [ {} ],
				inject: () => {}
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('Interval must be specified');
		}
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
});
