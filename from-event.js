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
	// Make sure output is iterable
	output = output.entries();

	// Listen to all events
	// The output's name is used as event name
	for (let o of output) {
		o.onEvent = (value) => { o.value = value; };
		opts.bus.on(o.name, o.onEvent);
	}

	return () => {
		// Remove listener
		for (let o of output) {
			opts.bus.removeListener(o.name, o.onEvent);
		}
	};
}

module.exports = { check, factory };
