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
});
