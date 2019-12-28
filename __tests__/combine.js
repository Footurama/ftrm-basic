const EventEmitter = require('events');
const COMBINE = require('../combine.js');

describe('check', () => {
	test('defaults', () => {
		const opts = {
			input: [ {} ],
			output: [ {} ],
			combine: () => {}
		};
		COMBINE.check(opts);
		expect(opts.logLevelCombine).toEqual('warn');
	});
	test('expect at least one input', () => {
		expect(() => COMBINE.check({
			input: [],
			output: [ {} ],
			combine: () => {}
		})).toThrow('At least one input must be specified');
	});
	test('expect one output', () => {
		expect(() => COMBINE.check({
			input: [ {} ],
			output: [],
			combine: () => {}
		})).toThrow('One output must be specified');
	});
	test('expect combine to be specified', () => {
		expect(() => COMBINE.check({
			input: [ {} ],
			output: [ {} ]
		})).toThrow('combine must be a function');
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
		COMBINE.factory({combine, logLevelCombine: null}, input, [output], {});
		i1.emit('update');
		expect(output.value).toBeUndefined();
	});

	test('report thrown errors', () => {
		const err = new Error();
		const combine = jest.fn(() => { throw err; });
		const i0 = new EventEmitter();
		i0.value = 0;
		i0.expired = false;
		const i1 = new EventEmitter();
		i1.value = 1;
		i1.expired = false;
		const input = [i0, i1];
		input.entries = () => input;
		const output = {};
		const error = jest.fn();
		COMBINE.factory({combine, logLevelCombine: 'error'}, input, [output], {error});
		i1.emit('update');
		expect(error.mock.calls[0][0]).toBe(err);
		expect(error.mock.calls[0][1]).toEqual('de84c6382b412f2f4bf02c9ba525fc31');
	});
});
