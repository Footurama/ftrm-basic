const EventEmitter = require('events');

const SLIDINGWINDOW = require('../sliding-window.js');

describe('check', () => {
	test('expect one input', () => {
		try {
			SLIDINGWINDOW.check({
				input: [],
				output: [ {} ],
				includeValue: () => {},
				calcOutput: () => {}
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('One input must be specified');
		}
	});

	test('expect one output', () => {
		try {
			SLIDINGWINDOW.check({
				input: [ {} ],
				output: [],
				includeValue: () => {},
				calcOutput: () => {}
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('One output must be specified');
		}
	});

	test('expect includeValue function', () => {
		try {
			SLIDINGWINDOW.check({
				input: [ {} ],
				output: [ {} ],
				calcOutput: () => {}
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('includeValue function must be specified');
		}
	});

	test('expect calcOutput function', () => {
		try {
			SLIDINGWINDOW.check({
				input: [ {} ],
				output: [ {} ],
				includeValue: () => {}
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('calcOutput function must be specified');
		}
	});

	test('default window to an empty array', () => {
		const opts = {
			input: [ {} ],
			output: [ {} ],
			includeValue: () => {},
			calcOutput: () => {}
		};
		SLIDINGWINDOW.check(opts);
		expect(opts.window).toBeInstanceOf(Array);
	});
});

describe('factory', () => {
	test('pass values to includeValue function', () => {
		const values = [0, 1, 2];
		const timestamps = [0, 1, 2];
		const now = 4;
		const includeValue = jest.fn((age, index) => age >= now - timestamps[0]);
		const input = new EventEmitter();
		SLIDINGWINDOW.factory({window: [], includeValue, calcOutput: () => {}}, [input], [{}]);
		Date.now = jest.fn(() => now);

		input.emit('update', values[0], timestamps[0]);
		expect(includeValue.mock.calls[0][0]).toBe(now - timestamps[0]);
		expect(includeValue.mock.calls[0][1]).toBe(0);

		input.emit('update', values[1], timestamps[1]);
		expect(includeValue.mock.calls[1][0]).toBe(now - timestamps[1]);
		expect(includeValue.mock.calls[1][1]).toBe(0);
		expect(includeValue.mock.calls[2][0]).toBe(now - timestamps[0]);
		expect(includeValue.mock.calls[2][1]).toBe(1);

		input.emit('update', values[2], timestamps[2]);
		expect(includeValue.mock.calls[3][0]).toBe(now - timestamps[2]);
		expect(includeValue.mock.calls[3][1]).toBe(0);
		expect(includeValue.mock.calls[4][0]).toBe(now - timestamps[0]);
		expect(includeValue.mock.calls[4][1]).toBe(1);
	});

	test('pass remaining values to calcOutput function', () => {
		const values = [0, 1];
		const timestamps = [0, 1];
		const includeValue = () => true;
		const outputValue = 123;
		const calcOutput = jest.fn(() => outputValue);
		const input = new EventEmitter();
		const output = {};
		SLIDINGWINDOW.factory({window: [], includeValue, calcOutput}, [input], [output]);
		input.emit('update', values[0], timestamps[0]);
		expect(calcOutput.mock.calls[0][0].length).toBe(1);
		expect(calcOutput.mock.calls[0][0][0]).toBe(values[0]);
		expect(output.value).toBe(outputValue);
		input.emit('update', values[1], timestamps[1]);
		expect(calcOutput.mock.calls[1][0].length).toBe(2);
		expect(calcOutput.mock.calls[1][0][0]).toBe(values[1]);
		expect(calcOutput.mock.calls[1][0][1]).toBe(values[0]);
		expect(output.value).toBe(outputValue);
	});

	test('ignore output on Error', () => {
		const calcOutput = jest.fn(() => { throw new Error(); });
		const input = new EventEmitter();
		const output = {};
		SLIDINGWINDOW.factory({window: [], includeValue: () => true, calcOutput}, [input], [output]);
		input.emit('update', 1, 2);
		expect(calcOutput.mock.calls.length).toBe(1);
		expect(output.value).toBeUndefined();
	});
});
