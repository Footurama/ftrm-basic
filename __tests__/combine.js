const EventEmitter = require('events');
const COMBINE = require('../combine.js');

describe('check', () => {
	test('valid input', () => {
		COMBINE.check({
			input: [ {} ],
			output: [ {} ],
			combine: () => {}
		});
	});
	test('expect at least one input', () => {
		try {
			COMBINE.check({
				input: [],
				output: [ {} ],
				combine: () => {}
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('At least one input must be specified');
		}
	});
	test('expect one output', () => {
		try {
			COMBINE.check({
				input: [ {} ],
				output: [],
				combine: () => {}
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('One output must be specified');
		}
	});
	test('expect combine to be specified', () => {
		try {
			COMBINE.check({
				input: [ {} ],
				output: [ {} ]
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('combine must be a function');
		}
	});
});

describe('factroy', () => {
	test('combine inputs', () => {
		const oValue = 12;
		const combine = jest.fn(() => oValue);
		const i0 = new EventEmitter();
		i0.value = 0;
		i0.expired = false;
		const i1 = new EventEmitter();
		i1.value = 1;
		i1.expired = false;
		const input = [i0, i1];
		input.entries = () => input;
		const output = {};
		COMBINE.factory({combine}, input, [output]);
		i1.emit('update');
		expect(combine.mock.calls[0][0]).toBe(i0.value);
		expect(combine.mock.calls[0][1]).toBe(i1.value);
		expect(output.value).toBe(oValue);
	});

	test('don\'t combine inputs if a value expired', () => {
		const combine = jest.fn();
		const i0 = new EventEmitter();
		i0.value = 0;
		i0.expired = true;
		const i1 = new EventEmitter();
		i1.value = 1;
		const input = [i0, i1];
		input.entries = () => input;
		COMBINE.factory({combine}, input, [{}]);
		i1.emit('update');
		expect(combine.mock.calls.length).toBe(0);
	});

	test('combine inputs with expired values if forced', () => {
		const combine = jest.fn();
		const i0 = new EventEmitter();
		i0.value = 0;
		i0.expired = true;
		const i1 = new EventEmitter();
		i1.value = 1;
		const input = [i0, i1];
		input.entries = () => input;
		COMBINE.factory({combine, combineExpiredInputs: true}, input, [{}]);
		i1.emit('update');
		expect(combine.mock.calls.length).toBe(1);
	});

	test('don\'t combine inputs if not all inputs have recieved values', () => {
		const combine = jest.fn();
		const i0 = new EventEmitter();
		i0.value = 0;
		i0.expired = false;
		const i1 = new EventEmitter();
		const input = [i0, i1];
		input.entries = () => input;
		COMBINE.factory({combine}, input, [{}]);
		i0.emit('update');
		expect(combine.mock.calls.length).toBe(0);
	});

	test('ignore thrown errors', () => {
		const combine = jest.fn(() => { throw new Error(); });
		const i0 = new EventEmitter();
		i0.value = 0;
		i0.expired = false;
		const i1 = new EventEmitter();
		i1.value = 1;
		i1.expired = false;
		const input = [i0, i1];
		input.entries = () => input;
		const output = {};
		COMBINE.factory({combine}, input, [output]);
		i1.emit('update');
		expect(output.value).toBeUndefined();
	});
	/* test('call weight function with every input on update and set output', () => {
		const input = [{}, {}].map((value) => {
			const e = new EventEmitter();
			e.value = value;
			return e;
		});
		input.entries = () => input;
		const output = [{}];
		const weight = jest.fn((i, n) => n);
		COMBINE.factory({ weight }, input, output);
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
		COMBINE.factory({ weight }, input, output);
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
		COMBINE.factory({ weight }, input, output);
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
		COMBINE.factory({ weight }, input, output);
		input[0].emit('expire');
		expect(weight.mock.calls.length).toBe(2);
	}); */
});
