const EventEmitter = require('events');
const MAP = require('../map.js');

const nextLoop = () => new Promise((resolve) => setImmediate(resolve));

describe('check', () => {
	test('expect one input', () => {
		expect(() => MAP.check({
			input: [],
			output: [ {} ],
			map: () => {}
		})).toThrow('One input must be specified');
	});

	test('expect one output', () => {
		expect(() => MAP.check({
			input: [ {} ],
			output: [],
			map: () => {}
		})).toThrow('One output must be specified');
	});

	test('expect map function', () => {
		expect(() => MAP.check({
			input: [ {} ],
			output: [ {} ]
		})).toThrow('Map function must be specified');
	});

	test('defaults', () => {
		const opts = {
			input: [ {} ],
			output: [ {} ],
			map: () => {}
		};
		MAP.check(opts);
		expect(opts.logLevelMap).toEqual('warn');
	});
});

describe('factory', () => {
	test('send input data to function', () => {
		const input = new EventEmitter();
		const output = {};
		const map = jest.fn();
		MAP.factory({map}, [input], [output]);
		const VALUE = {};
		input.emit('update', VALUE);
		expect(map.mock.calls[0][0]).toBe(VALUE);
	});

	test('set output with return value of map function', async () => {
		const input = new EventEmitter();
		const output = {};
		const VALUE = {};
		const map = jest.fn(() => Promise.resolve(VALUE));
		MAP.factory({map}, [input], [output]);
		input.emit('update', VALUE);
		await nextLoop();
		expect(output.value).toBe(VALUE);
	});

	test('ignore thrown errors', () => {
		const input = new EventEmitter();
		const output = {};
		const map = jest.fn(() => { throw new Error(); });
		MAP.factory({map, logLevelMap: null}, [input], [output], {});
		input.emit('update');
		expect(output.value).toBeUndefined();
	});

	test('report thrown errors', () => {
		const input = new EventEmitter();
		const output = {};
		const err = new Error();
		const map = jest.fn(() => { throw err; });
		const error = jest.fn();
		MAP.factory({map, logLevelMap: 'error'}, [input], [output], {error});
		input.emit('update');
		expect(error.mock.calls[0][0]).toBe(err);
		expect(error.mock.calls[0][1]).toEqual('3af3bbc53a549a7769659c9809e6c8d0');
	});
});
