const GENERIC = require('../generic.js');

describe('check', () => {
	test('positive check', () => {
		GENERIC.check({ factory: () => {} });
	});

	test('expect factory function', () => {
		try {
			GENERIC.check({});
			throw new Error('FAILED!');
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect(e.message).toEqual('Factory function must be specified');
		}
	});
});

describe('factory', () => {
	test('hand over input and output to factory', () => {
		const input = {};
		const output = {};
		const exit = () => {};
		const factory = jest.fn(() => exit);
		expect(GENERIC.factory({factory}, input, output)).toBe(exit);
		expect(factory.mock.calls[0][0]).toBe(input);
		expect(factory.mock.calls[0][1]).toBe(output);
	});
});
