function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.includeValue !== 'function') throw new Error('includeValue function must be specified');
	if (typeof opts.calcOutput !== 'function') throw new Error('calcOutput function must be specified');
};

function factory (opts, input, output) {
	let window = [];
	input[0].on('update', (value, timestamp) => {
		// Find out which values to include in the window
		const now = Date.now();
		window.unshift({value, timestamp});
		window = window.filter((record, index) => {
			const age = now - record.timestamp;
			return opts.includeValue(age, index);
		});

		try {
			// Get output value based on values inside the window
			// calcOutput will throw an error if it does not want to emit values
			output[0].value = opts.calcOutput(window.map((i) => i.value));
		} catch (e) {}
	});
}

module.exports = { check, factory };
