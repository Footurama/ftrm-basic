const STREAM = require('../to-writable.js');
const EventEmitter = require('events');
const Writable = require('stream').Writable;

describe('check', () => {
	test('expect zero outputs', () => {
		try {
			STREAM.check({
				input: [ {} ],
				output: [ {} ],
				stream: { write: () => {}, end: () => {} }
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('No outputs can be specified');
		}
	});

	test('expect one input', () => {
		try {
			STREAM.check({
				input: [],
				output: [],
				stream: { write: () => {}, end: () => {} }
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('One input must be specified');
		}
	});

	test('expect stream', () => {
		try {
			STREAM.check({
				input: [ {} ],
				output: []
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('Stream must be specified');
		}
	});

	test('set default format command', () => {
		const opts = {
			input: [ {} ],
			output: [],
			stream: { write: () => {}, end: () => {} }
		};
		STREAM.check(opts);
		expect(opts.format('test', 0)).toEqual('1970-01-01T00:00:00.000Z\ttest\n');
	});
});

describe('factory', () => {
	test('write to stream', () => {
		const input = new EventEmitter();
		const stream = new Writable();
		stream._write = jest.fn((chunk, encoding, cb) => cb());
		const format = (value, timestamp) => `${new Date(TS).toISOString()}\t${VALUE}\n`;
		STREAM.factory({stream, format}, [input], []);
		const VALUE = 'test';
		const TS = 1234567890;
		input.emit('update', VALUE, TS);
		expect(stream._write.mock.calls[0][0].toString()).toEqual(`${new Date(TS).toISOString()}\t${VALUE}\n`);
	});

	test('end stream on destroy', async () => {
		const input = new EventEmitter();
		const stream = new Writable();
		stream._write = jest.fn((chunk, encoding, cb) => cb());
		stream._final = jest.fn((cb) => cb());
		const destroy = STREAM.factory({stream}, [input], []);
		await destroy();
		expect(stream._final.mock.calls.length).toBe(1);
	});
});
