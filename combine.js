const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.input.length === 0) throw new Error('At least one input must be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.combine !== 'function') throw new Error('combine must be a function');
	if (opts.logLevelCombine === undefined) opts.logLevelCombine = 'warn';
}

function factory (opts, input, output, log) {
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
		} catch (err) {
			if (log[opts.logLevelCombine]) {
				log[opts.logLevelCombine](err, 'de84c6382b412f2f4bf02c9ba525fc31');
			}
		}
	}

	for (let i of input) {
		// Select a candidate everytime an input changed
		i.on('update', evaluate);
	}
}

module.exports = { name, url, check, factory };
