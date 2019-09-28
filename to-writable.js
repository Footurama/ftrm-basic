const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length !== 0) throw new Error('No outputs can be specified');
	if (typeof opts.stream !== 'object' || typeof opts.stream.write !== 'function' || typeof opts.stream.end !== 'function') throw new Error('Stream must be specified');
	if (opts.format === undefined) opts.format = (v, ts) => `${new Date(ts).toISOString()}\t${v.toString()}\n`;
}

function factory (opts, input, output) {
	// Remove bus object from opts object. Otherwise it will be
	// transmitted to every inspector node. And we don't know
	// whats inside the bus ...
	const stream = opts.stream;
	delete opts.stream;

	input[0].on('update', (value, timestamp, event) => {
		const line = opts.format(value, timestamp, event);
		stream.write(line);
	});

	if (!opts.dontCloseStream) {
		return () => new Promise((resolve) => stream.end(resolve));
	} else {
		return () => Promise.resolve();
	}
}

module.exports = { name, url, check, factory };
