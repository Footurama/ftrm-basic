const WEIGHTS = {
	prio: (input, n) => {
		if (input.expired) return;
		if (input.value === undefined) return;
		return n * (-1);
	},
	max: (input, n) => {
		if (input.expired) return;
		if (input.value === undefined) return;
		return input.value * (+1);
	},
	min: (input, n) => {
		if (input.expired) return;
		if (input.value === undefined) return;
		return input.value * (-1);
	}
};

function check (opts) {
	if (opts.input.length === 0) throw new Error('At least one input must be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.weight === 'string') {
		if (!WEIGHTS[opts.weight]) throw new Error('Unkown weight function: ' + opts.weight);
		opts.weight = WEIGHTS[opts.weight];
	} else if (typeof opts.weight !== 'function') {
		throw new Error('weight must be specified');
	}
}

function factory (opts, input, output) {
	// Make sure input is iterable
	input = input.entries();

	function evaluate () {
		// Search candidate by using the weight function:
		// - Collect score for each input
		// - Get rid of those with undefined score
		// - Order by score
		// - Set output to input with highest score
		const candidate = input
			.map((i, n) => [i, opts.weight(i, n)])
			.filter((x) => x[1] !== undefined)
			.sort((a, b) => {
				if (a[1] < b[1]) return 1;
				if (a[1] > b[1]) return -1;
				return 0;
			})[0];
		// Don't set output if no candidate could be found
		if (!candidate) return;
		output[0].value = candidate[0].value;
	}

	for (let i of input) {
		// Select a candidate everytime an input changed
		i.on('update', evaluate);
		i.on('expire', evaluate);
	}
}

module.exports = { check, factory };
