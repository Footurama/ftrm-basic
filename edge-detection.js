const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

const assert = require('assert');

const toBool = (x) => !!x;
const predefinedMatches = {
	'rising-edge': (from, to) => !toBool(from) && toBool(to),
	'falling-edge': (from, to) => toBool(from) && !toBool(to)
};

function check (opts) {
	assert(opts.input.length === 1, 'One input required');
	assert(opts.output.length >= 1, 'At least one output required');
	if (opts.output.length > 1) opts.output.forEach((o) => assert(o.name, 'Every output must have a name'));
	if (!Array.isArray(opts.detectors)) opts.detectors = [opts.detectors];
	assert(opts.detectors.length > 0, 'At least one detector must be specified');
	opts.detectors.forEach((detector) => {
		if (predefinedMatches[detector.match]) detector.match = predefinedMatches[detector.match];
		assert(typeof detector.match === 'function', 'Every detector must have a match function');
	});
}

class DelayedEvents {
	constructor () {
		this.events = new Set();
	}

	add (action, delay) {
		const to = setTimeout(() => {
			this.events.delete(to);
			action();
		}, delay);
		this.events.add(to);
		return to;
	}

	abort (to) {
		if (this.events.delete(to)) {
			clearTimeout(to);
		}
	}

	abortAll () {
		this.events.forEach((to) => clearTimeout(to));
	}
}

function factory (opts, inputs, outputs, log) {
	const delayedEvents = new DelayedEvents();
	let lastValue;

	inputs[0].on('change', (value) => {
		opts.detectors.filter((detector) => {
			try {
				return detector.match(lastValue, value);
			} catch (err) {
				log.error(err, '15575b74a7a640fb98b1dacd5c72fda2');
			}
		}).forEach((detector) => {
			if (opts.retriggerDetectors) delayedEvents.abort(detector.handle);
			if (opts.abortDetectors) delayedEvents.abortAll();
			detector.handle = delayedEvents.add(() => {
				if (outputs.length > 1) {
					Object.entries(detector.output || {}).forEach(([key, value]) => {
						// Ignore unknown outputs
						if (!outputs[key]) return;
						outputs[key].set(value);
					});
				} else {
					outputs[0].set(detector.output);
				}
			}, detector.delay || 0);
		});
		lastValue = value;
	});

	return () => delayedEvents.abortAll();
}

module.exports = { name, url, check, factory };
