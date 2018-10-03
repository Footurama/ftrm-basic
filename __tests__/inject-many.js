const INJECTMANY = require('../inject-many.js');

jest.useFakeTimers();

const nextLoop = () => new Promise((resolve) => setImmediate(resolve));

describe('check', () => {
	test('expect zero inputs', () => {
		try {
			INJECTMANY.check({
				input: [ {} ],
				output: [ {name: 'test'} ],
				inject: () => {},
				interval: 123
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('No inputs can be specified');
		}
	});

	test('expect at least one output', () => {
		try {
			INJECTMANY.check({
				input: [],
				output: [],
				inject: () => {},
				interval: 123
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('At least one output must be specified');
		}
	});

	test('all output must have names', () => {
		try {
			INJECTMANY.check({
				input: [],
				output: [{name: 'test'}, {}],
				inject: () => {},
				interval: 123
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('All outputs must have the property name');
		}
	});

	test('expect inject function', () => {
		try {
			INJECTMANY.check({
				input: [],
				output: [ {name: 'test'} ],
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
			INJECTMANY.check({
				input: [],
				output: [ {name: 'test'} ],
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
		const inject = jest.fn();
		const interval = 1000;
		const destroy = INJECTMANY.factory({inject, interval}, [], [{}]);
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
		destroy();
		jest.advanceTimersByTime(interval);
		expect(inject.mock.calls.length).toBe(1);
	});
});
