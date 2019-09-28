const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.input.length !== 0) throw new Error('No inputs can be specified');
	if (opts.output.length < 1) throw new Error('At least one output must be specified');
	if (opts.output.reduce((ok, o) => ok && (typeof o.name === 'string'), true) === false) {
		throw new Error('All outputs must have the property name');
	}
	if (!opts.bus || typeof opts.bus.on !== 'function' || typeof opts.bus.removeListener !== 'function') {
		throw new Error('bus must be specified and an EventEmitter');
	}
}

function factory (opts, input, output) {
	// Remove bus object from opts object. Otherwise it will be
	// transmitted to every inspector node. And we don't know
	// whats inside the bus ...
	const bus = opts.bus;
	delete opts.bus;

	// Make sure output is iterable
	output = output.entries();

	// Listen to all events
	// The output's name is used as event name
	for (let o of output) {
		o.onEvent = (value) => { o.value = value; };
		bus.on(o.name, o.onEvent);
	}

	return () => {
		// Remove listener
		for (let o of output) {
			bus.removeListener(o.name, o.onEvent);
		}
	};
}

module.exports = { name, url, check, factory };
