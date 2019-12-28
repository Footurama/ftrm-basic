const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.factory === undefined) {
		throw new Error('Factory function must be specified');
	}
}

function factory (opts, input, output, log) {
	return opts.factory(input, output, log);
}

module.exports = { name, url, check, factory };
