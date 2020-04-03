const EventEmitter = require('events');
const select = require('../select.js');

describe('check', () => {
	test('valid input', () => {
		select.check({
			input: [ {} ],
			output: [ {} ],
			weight: () => {}
		});
	});
	test('expect at least one input', () => {
		expect(() => select.check({
			input: [],
			output: [ {} ],
			weight: 'prio'
		})).toThrow('At least one input must be specified');
	});
	test('expect one output', () => {
		expect(() => select.check({
			input: [ {} ],
			output: [],
			weight: 'prio'
		})).toThrow('One output must be specified');
	});
	test('expect weigth to be a valid string', () => {
		expect(() => select.check({
			input: [ {} ],
			output: [ {} ],
			weight: 'foo'
		})).toThrow('Unkown weight function: foo');
	});
	test('expect weigth to be specified', () => {
		expect(() => select.check({
			input: [ {} ],
			output: [ {} ]
		})).toThrow('weight must be specified');
	});
	test('weight function: prio', () => {
		const opts = {
			input: [ {} ],
			output: [ {} ],
			weight: 'prio'
		};
		select.check(opts);
		const w = opts.weight;
		expect(w({ expired: true }, 0)).toBeUndefined();
		expect(w({ value: undefined }, 0)).toBeUndefined();
		expect(w({ value: 0 }, 0)).toBeGreaterThan(w({ value: 0 }, 1));
	});
	test('weight function: max', () => {
		const opts = {
			input: [ {} ],
			output: [ {} ],
			weight: 'max'
		};
		select.check(opts);
		const w = opts.weight;
		expect(w({ expired: true }, 0)).toBeUndefined();
		expect(w({ value: undefined }, 0)).toBeUndefined();
		expect(w({ value: 1 }, 0)).toBeGreaterThan(w({ value: 0 }, 1));
	});
	test('weight function: min', () => {
		const opts = {
			input: [ {} ],
			output: [ {} ],
			weight: 'min'
		};
		select.check(opts);
		const w = opts.weight;
		expect(w({ expired: true }, 0)).toBeUndefined();
		expect(w({ value: undefined }, 0)).toBeUndefined();
		expect(w({ value: 1 }, 0)).toBeLessThan(w({ value: 0 }, 1));
	});
});

describe('factroy', () => {
	test('call weight function with every input on update and set output', () => {
		const input = [{}, {}].map((value) => {
			const e = new EventEmitter();
			e.value = value;
			return e;
		});
		input.entries = () => input;
		const output = [{}];
		const weight = jest.fn((i, n) => n);
		select.factory({ weight }, input, output);
		input[0].emit('update');
		expect(weight.mock.calls.length).toBe(2);
		expect(weight.mock.calls[0][0]).toBe(input[0]);
		expect(weight.mock.calls[0][1]).toBe(0);
		expect(weight.mock.calls[1][0]).toBe(input[1]);
		expect(weight.mock.calls[1][1]).toBe(1);
		expect(output[0].value).toBe(input[1].value);
	});
	test('ignore undefined score', () => {
		const input = [{}, {}].map((value) => {
			const e = new EventEmitter();
			e.value = value;
			return e;
		});
		input.entries = () => input;
		const output = [{}];
		const weight = jest.fn((i, n) => n === 1 ? 1 : undefined);
		select.factory({ weight }, input, output);
		input[0].emit('update');
		expect(output[0].value).toBe(input[1].value);
	});
	test('don\'t set output if no score has been returned', () => {
		const input = [{}, {}].map((value) => {
			const e = new EventEmitter();
			e.value = value;
			return e;
		});
		input.entries = () => input;
		const output = [{}];
		const weight = jest.fn((i, n) => undefined);
		select.factory({ weight }, input, output);
		input[0].emit('update');
		expect(output[0].value).toBeUndefined();
	});
	test('call evaluate on expire', () => {
		const input = [{}, {}].map((value) => {
			const e = new EventEmitter();
			e.value = value;
			return e;
		});
		input.entries = () => input;
		const output = [{}];
		const weight = jest.fn();
		select.factory({ weight }, input, output);
		input[0].emit('expire');
		expect(weight.mock.calls.length).toBe(2);
	});
});
