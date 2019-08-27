function check (opts) {
	if (opts.input.length === 0) throw new Error('At least one input must be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.combine !== 'function') throw new Error('combine must be a function');
}

function factory (opts, input, output) {
	// Make sure input is iterable
	input = input.entries();

	function evaluate () {
		if (!opts.combineExpiredInputs) {
			// Make sure no inputs are expired and have received values
			// i.expired is set to undefined if value has not been set, yet.
			const expired = input.reduce((abort, i) => abort || i.expired || i.expired === undefined, false);
			if (expired) return;
		}
		try {
			output[0].value = opts.combine.apply(null, input.map((i) => i.value));
		} catch (e) {}
	}

	for (let i of input) {
		// Select a candidate everytime an input changed
		i.on('update', evaluate);
	}
}

module.exports = {check, factory};
