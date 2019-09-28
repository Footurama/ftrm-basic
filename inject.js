const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.input.length !== 0) throw new Error('No inputs can be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.inject !== 'function') throw new Error('Inject function must be specified');
	if (typeof opts.interval !== 'number') throw new Error('Interval must be specified');
}

function factory (opts, input, output) {
	const handle = setInterval(async () => {
		const value = await opts.inject();
		output[0].value = value;
	}, opts.interval);

	return () => clearInterval(handle);
}

module.exports = { name, url, check, factory };
