function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length !== 0) throw new Error('No outputs can be specified');
	if (typeof opts.stream !== 'object' || typeof opts.stream.write !== 'function' || typeof opts.stream.end !== 'function') throw new Error('Stream must be specified');
	if (opts.format === undefined) opts.format = (v, ts) => `${new Date(ts).toISOString()}\t${v.toString()}\n`;
}

function factory (opts, input, output) {
	input[0].on('update', (value, timestamp, event) => {
		const line = opts.format(value, timestamp, event);
		opts.stream.write(line);
	});

	return () => new Promise((resolve) => opts.stream.end(resolve));
}

module.exports = { check, factory };
