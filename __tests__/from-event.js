const EventEmitter = require('events').EventEmitter;

const FROMEVENT = require('../from-event.js');

describe('check', () => {
	test('expect zero inputs', () => {
		try {
			FROMEVENT.check({
				input: [ {} ],
				output: [ {name: 'test'} ],
				bus: new EventEmitter()
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('No inputs can be specified');
		}
	});

	test('expect at least one output', () => {
		try {
			FROMEVENT.check({
				input: [],
				output: [],
				bus: new EventEmitter()
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('At least one output must be specified');
		}
	});

	test('all output must have names', () => {
		try {
			FROMEVENT.check({
				input: [],
				output: [{name: 'test'}, {}],
				bus: new EventEmitter()
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('All outputs must have the property name');
		}
	});

	test('expect bus', () => {
		try {
			FROMEVENT.check({
				input: [],
				output: [ {name: 'test'} ]
			});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('bus must be specified and an EventEmitter');
		}
	});
});

describe('factory', () => {
	test('listen to events and publish event\'s data', () => {
		const bus = {on: jest.fn()};
		const e1 = {name: 'e1'};
		const e2 = {name: 'e2'};
		const v1 = 1;
		const v2 = 2;
		const output = [e1, e2];
		output.entries = () => output;
		FROMEVENT.factory({bus}, [], output);
		expect(bus.on.mock.calls[0][0]).toBe(e1.name);
		expect(bus.on.mock.calls[1][0]).toBe(e2.name);
		bus.on.mock.calls[0][1](v1);
		bus.on.mock.calls[1][1](v2);
		expect(e1.value).toBe(v1);
		expect(e2.value).toBe(v2);
	});

	test('remove event listener on exit', () => {
		const bus = {on: () => {}, removeListener: jest.fn()};
		const e1 = {name: 'e1'};
		const e2 = {name: 'e2'};
		const output = [e1, e2];
		output.entries = () => output;
		const exit = FROMEVENT.factory({bus}, [], output);
		exit();
		expect(bus.removeListener.mock.calls[0][0]).toEqual(e1.name);
		expect(bus.removeListener.mock.calls[1][0]).toEqual(e2.name);
	});
});
