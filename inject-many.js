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
	if (typeof opts.inject !== 'function') throw new Error('Inject function must be specified');
	if (typeof opts.interval !== 'number') throw new Error('Interval must be specified');
	if (opts.logLevelInject === undefined) opts.logLevelInject = 'warn';
}

function factory (opts, input, output, log) {
	const handle = setInterval(async () => {
		try {
			const values = await opts.inject();
			Object.keys(values).forEach((key) => {
				if (output[key]) output[key].value = values[key];
			});
		} catch (err) {
			if (log[opts.logLevelInject]) {
				log[opts.logLevelInject](err, 'ab9f3a0a26807d67d0bb2abd987fd378');
			}
		}
	}, opts.interval);

	return () => clearInterval(handle);
}

module.exports = { name, url, check, factory };
