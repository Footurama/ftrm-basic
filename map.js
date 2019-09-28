const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.map !== 'function') throw new Error('Map function must be specified');
};

function factory (opts, input, output) {
	// Map values
	input[0].on('update', async (value) => {
		value = await opts.map(value);
		output[0].value = value;
	});
}

module.exports = { name, url, check, factory };
