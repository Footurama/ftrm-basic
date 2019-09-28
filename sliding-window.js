const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.includeValue !== 'function') throw new Error('includeValue function must be specified');
	if (typeof opts.calcOutput !== 'function') throw new Error('calcOutput function must be specified');
	if (!Array.isArray(opts.window)) opts.window = [];
};

function factory (opts, input, output) {
	// Remove window array from opts object. Otherwise it will be
	// transmitted to every inspector node. And this may be very large ...
	const window = opts.window;
	delete opts.window;

	input[0].on('update', (value, timestamp) => {
		// Prepend new value
		window.unshift({value, timestamp});

		// Find out which values to include in the window
		const now = Date.now();
		const keepItems = window.map((record, index) => {
			const age = now - record.timestamp;
			return opts.includeValue(age, index);
		});
		for (let i = window.length - 1; i >= 0; i--) {
			if (keepItems[i]) continue;
			window.splice(i, 1);
		}

		try {
			// Get output value based on values inside the window
			// calcOutput will throw an error if it does not want to emit values
			output[0].value = opts.calcOutput(window.map((i) => i.value));
		} catch (e) {}
	});
}

module.exports = { name, url, check, factory };
