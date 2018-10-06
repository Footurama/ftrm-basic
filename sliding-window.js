function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.includeValue !== 'function') throw new Error('includeValue function must be specified');
	if (typeof opts.calcOutput !== 'function') throw new Error('calcOutput function must be specified');
	if (!Array.isArray(opts.window)) opts.window = [];
};

function factory (opts, input, output) {
	input[0].on('update', (value, timestamp) => {
		// Prepend new value
		opts.window.unshift({value, timestamp});

		// Find out which values to include in the window
		const now = Date.now();
		const keepItems = opts.window.map((record, index) => {
			const age = now - record.timestamp;
			return opts.includeValue(age, index);
		});
		for (let i = opts.window.length - 1; i >= 0; i--) {
			if (keepItems[i]) continue;
			opts.window.splice(i, 1);
		}

		try {
			// Get output value based on values inside the window
			// calcOutput will throw an error if it does not want to emit values
			output[0].value = opts.calcOutput(opts.window.map((i) => i.value));
		} catch (e) {}
	});
}

module.exports = { check, factory };
