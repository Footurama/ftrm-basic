function check (opts) {
	if (opts.factory === undefined) {
		throw new Error('Factory function must be specified');
	}
}

function factory (opts, input, output) {
	return opts.factory(input, output);
}

module.exports = { check, factory };
