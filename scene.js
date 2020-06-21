const pkgInfo = require('./package.json');
const fileName = __filename.slice(__dirname.length + 1, -3);
const name = `${pkgInfo.name}/${fileName}`;
const url = pkgInfo.homepage;

function check (opts) {
	if (opts.input.length !== 1) throw new Error('One input must be specified');
	if (opts.output.length < 1) throw new Error('At least one output must be specified');
	if (typeof opts.scenes !== 'object') throw new Error('scenes must be an object');
	Object.values(opts.scenes).forEach((s) => {
		if (typeof s !== 'function') throw new Error('scenes must contain functions');
	});
	opts.input[0].checkpoint = (value) => {
		if (typeof value === 'string') return {scene: value};
		if (!value.scene) throw new Error('Object must have key \'scene\'');
		return value;
	};
	if (opts.logLevel === undefined) opts.logLevel = 'error';
}

const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

function factory (opts, input, output, log) {
	function logErr (msg, id) {
		if (!log[opts.logLevel]) return;
		log[opts.logLevel](msg, id);
	}

	input[0].on('update', (msg) => {
		if (!opts.scenes[msg.scene]) {
			return logErr(new Error(`Unknown scene ${msg.scene}`), 'b55b8dd2fe224996b7f65a2377c15cc5');
		}
		try {
			opts.scenes[msg.scene](msg, output, {delay});
		} catch (err) {
			logErr(err, '5febff0551a541f9a8357bf79afa1c33');
		}
	});
}

module.exports = {name, url, check, factory};
