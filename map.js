const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.map !== 'function') throw new Error('Map function must be specified');
	if (opts.logLevelMap === undefined) opts.logLevelMap = 'warn';
};

function factory (opts, input, output, log) {
	// Map values
	input[0].on('update', async (value) => {
		try {
			value = await opts.map(value);
			output[0].value = value;
		} catch (err) {
			if (log[opts.logLevelMap]) {
				log[opts.logLevelMap](err, '3af3bbc53a549a7769659c9809e6c8d0');
			}
		}
	});
}

module.exports = { name, url, check, factory };
