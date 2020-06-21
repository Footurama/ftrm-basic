const EventEmitter = require('events');
const scene = require('../scene.js');

jest.useFakeTimers();

describe('check', () => {
	test('expect one input', () => {
		expect(() => scene.check({
			input: [],
			output: [ {} ],
			scenes: {}
		})).toThrow('One input must be specified');
	});

	test('expect many outputs', () => {
		expect(() => scene.check({
			input: [{}],
			output: [],
			scenes: {}
		})).toThrow('At least one output must be specified');
	});

	test('expect scenes', () => {
		expect(() => scene.check({
			input: [{}],
			output: [{}]
		})).toThrow('scenes must be an object');
		expect(() => scene.check({
			input: [{}],
			output: [{}],
			scenes: {abc: true}
		})).toThrow('scenes must contain functions');
	});

	test('defaults', () => {
		const opts = {
			input: [{}],
			output: [{}],
			scenes: {abc: () => {}}
		};
		scene.check(opts);
		expect(opts.input[0].checkpoint({scene: 'abc'})).toMatchObject({scene: 'abc'});
		expect(opts.input[0].checkpoint('abc')).toMatchObject({scene: 'abc'});
		expect(() => opts.input[0].checkpoint({})).toThrow('Object must have key \'scene\'');
		expect(opts.logLevel).toEqual('error');
	});
});

describe('factory', () => {
	test('execute scene', async () => {
		const input = new EventEmitter();
		const outputs = {o1: {}, o2: {}};
		const scenes = {abc: jest.fn()};
		scene.factory({scenes}, [input], outputs);
		const msg = {scene: 'abc'};
		input.emit('update', msg);
		expect(scenes.abc.mock.calls[0][0]).toBe(msg);
		expect(scenes.abc.mock.calls[0][1]).toBe(outputs);
		const {delay} = scenes.abc.mock.calls[0][2];
		const to = 123;
		const q = delay(to);
		jest.advanceTimersByTime(to);
		await expect(q).resolves.toBeUndefined();
	});

	test('unknown scene', async () => {
		const input = new EventEmitter();
		const error = jest.fn();
		scene.factory({scenes: {}, logLevel: 'error'}, [input], {}, {error});
		input.emit('update', {scene: 'abc'});
		expect(error.mock.calls[0][0].message).toEqual('Unknown scene abc');
		expect(error.mock.calls[0][1]).toEqual('b55b8dd2fe224996b7f65a2377c15cc5');
	});

	test('forward error', async () => {
		const input = new EventEmitter();
		const error = jest.fn();
		const err = new Error();
		scene.factory({
			scenes: {abc: () => { throw err; }},
			logLevel: 'error'
		}, [input], {}, {error});
		input.emit('update', {scene: 'abc'});
		expect(error.mock.calls[0][0]).toBe(err);
		expect(error.mock.calls[0][1]).toEqual('5febff0551a541f9a8357bf79afa1c33');
	});
});
