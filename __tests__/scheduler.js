const EventEmitter = require('events');
const SCHEDULER = require('../scheduler.js');

jest.useFakeTimers();

describe('check', () => {
	test('expect one output', () => {
		expect(() => SCHEDULER.check({
			input: [],
			output: [],
			schedule: () => {}
		})).toThrow('One output must be specified');
	});
	test('expect schedule to be specified', () => {
		expect(() => SCHEDULER.check({
			input: [ {} ],
			output: [ {} ]
		})).toThrow('schedule must be a function');
	});
	test('defaults', () => {
		const opts = {
			input: [ {} ],
			output: [ {} ],
			schedule: () => {}
		};
		SCHEDULER.check(opts);
		expect(opts.interval).toBe(60000);
	});
});

describe('factroy', () => {
	test('call schedule on input event', () => {
		// Mock time
		// Unix time is UTC. But we want to mock local time!
		// Thus we modify the timestamp according to the local time offset.
		const unixtime = 1234567890000;
		const offsetToUTC = new Date(unixtime).getTimezoneOffset() * 60 * 1000;
		Date.now = () => unixtime + offsetToUTC;
		// Mock schedule
		const oValue = 12;
		const schedule = jest.fn(() => oValue);
		// Mock inputs
		const i0 = new EventEmitter();
		i0.value = 0;
		const i1 = new EventEmitter();
		i1.value = 1;
		const input = [i0, i1];
		input.entries = () => input;
		// Mock output
		const output = {};
		// Run factory
		SCHEDULER.factory({schedule, interval: 1000}, input, [output]);
		i1.emit('update');
		expect(schedule.mock.calls[0][0]).toMatchObject({
			s: 30,
			m: 31,
			h: 23,
			dayofweek: 5,
			dayofmonth: 13,
			month: 2,
			year: 2009
		});
		expect(schedule.mock.calls[0][1]).toBe(i0.value);
		expect(schedule.mock.calls[0][2]).toBe(i1.value);
		expect(output.value).toBe(oValue);
	});

	test('ignore thrown errors', () => {
		const schedule = jest.fn(() => { throw new Error(); });
		const input = [];
		input.entries = () => input;
		const output = {};
		const interval = 1000;
		SCHEDULER.factory({schedule, interval}, input, [output]);
		jest.advanceTimersByTime(interval);
		expect(schedule.mock.calls.length).toBe(1);
		expect(output.value).toBeUndefined();
	});

	test('abort interval on exit', () => {
		const schedule = jest.fn();
		const input = [];
		input.entries = () => input;
		const output = {};
		const interval = 1000;
		const exit = SCHEDULER.factory({schedule, interval}, input, [output]);
		jest.advanceTimersByTime(interval);
		expect(schedule.mock.calls.length).toBe(1);
		exit();
		jest.advanceTimersByTime(interval);
		expect(schedule.mock.calls.length).toBe(1);
	});
});
