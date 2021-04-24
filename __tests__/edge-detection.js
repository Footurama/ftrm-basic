const {EventEmitter} = require('events');

jest.useFakeTimers();

const {factory, check} = require('../edge-detection.js');

describe('check', () => {
	test('normalize detectors', () => {
		const detector = {match: () => {}, output: true};
		const opts = {
			input: [{}],
			output: [{}],
			detectors: detector
		};
		check(opts);
		expect(opts.detectors[0]).toBe(detector);
	});

	test('rising edge detector', () => {
		const detector = {match: 'rising-edge'};
		const opts = {
			input: [{}],
			output: [{}],
			detectors: [detector]
		};
		check(opts);
		const match = opts.detectors[0].match;
		expect(match(false, true)).toBe(true);
		expect(match(null, true)).toBe(true);
		expect(match(undefined, true)).toBe(true);
		expect(match(0, 1)).toBe(true);
		expect(match(true, true)).toBe(false);
		expect(match(false, false)).toBe(false);
		expect(match(true, false)).toBe(false);
	});

	test('falling edge detector', () => {
		const detector = {match: 'falling-edge'};
		const opts = {
			input: [{}],
			output: [{}],
			detectors: [detector]
		};
		check(opts);
		const match = opts.detectors[0].match;
		expect(match(true, false)).toBe(true);
		expect(match(true, null)).toBe(true);
		expect(match(true, undefined)).toBe(true);
		expect(match(1, 0)).toBe(true);
		expect(match(false, false)).toBe(false);
		expect(match(true, true)).toBe(false);
		expect(match(false, true)).toBe(false);
	});

	test('fail on missing options', () => {
		expect(() => check({input: [], output: [{}], detectors: [{match: () => {}}]})).toThrow('One input required');
		expect(() => check({input: [{}], output: [], detectors: [{match: () => {}}]})).toThrow('One output required');
		expect(() => check({input: [{}], output: [{}], detectors: []})).toThrow('At least one detector must be specified');
		expect(() => check({input: [{}], output: [{}], detectors: [{}]})).toThrow('Every detector must have a match function');
	});
});

describe('factory', () => {
	test('Detect edges', () => {
		const i = new EventEmitter();
		const o = {set: jest.fn()};
		const delay = 123;
		const output = 42;
		const a = {};
		const b = {};
		factory({detectors: [{match: (from, to) => from === a && to === b, delay, output}]}, [i], [o]);
		i.emit('change', a);
		i.emit('change', b);
		jest.advanceTimersByTime(delay);
		expect(o.set.mock.calls[0][0]).toBe(output);
	});

	test('Retrigger detectors', () => {
		const i = new EventEmitter();
		const o = {set: jest.fn()};
		const delay = 123;
		factory({retriggerDetectors: true, detectors: [{match: (from, to) => from === true && to === false, delay}]}, [i], [o]);
		i.emit('change', true);
		i.emit('change', false);
		jest.advanceTimersByTime(delay - 1);
		i.emit('change', true);
		i.emit('change', false);
		jest.advanceTimersByTime(delay);
		expect(o.set.mock.calls.length).toBe(1);
	});

	test('Abort all delayed events on exit', () => {
		const i = new EventEmitter();
		const o = {set: jest.fn()};
		const delay = 123;
		const exit = factory({detectors: [{match: (from, to) => from === true && to === false, delay}]}, [i], [o]);
		i.emit('change', true);
		i.emit('change', false);
		exit();
		jest.advanceTimersByTime(delay);
		expect(o.set.mock.calls.length).toBe(0);
	});

	test('Report errors', () => {
		const i = new EventEmitter();
		const o = {set: jest.fn()};
		const error = jest.fn();
		const err = new Error();
		factory({detectors: [{match: (from, to) => { throw err; }}]}, [i], [o], {error});
		i.emit('change', true);
		i.emit('change', false);
		expect(error.mock.calls[0][0]).toBe(err);
		expect(error.mock.calls[0][1]).toEqual('15575b74a7a640fb98b1dacd5c72fda2');
	});
});
