const GENERIC = require('../generic.js');

describe('check', () => {
	test('positive check', () => {
		GENERIC.check({ factory: () => {} });
	});

	test('expect factory function', () => {
		expect(() => GENERIC.check({})).toThrow('Factory function must be specified');
	});
});

describe('factory', () => {
	test('hand over input and output to factory', () => {
		const input = {};
		const output = {};
		const log = {};
		const exit = () => {};
		const factory = jest.fn(() => exit);
		expect(GENERIC.factory({factory}, input, output, log)).toBe(exit);
		expect(factory.mock.calls[0][0]).toBe(input);
		expect(factory.mock.calls[0][1]).toBe(output);
		expect(factory.mock.calls[0][2]).toBe(log);
	});
});
