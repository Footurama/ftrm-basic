function check (opts) {
	if (opts.output.length !== 1) throw new Error('One output must be specified');
	if (typeof opts.schedule !== 'function') throw new Error('schedule must be a function');
	if (opts.interval === undefined) opts.interval = 60000;
}

function factory (opts, input, output) {
	// Make sure input is iterable
	input = input.entries();

	function schedule () {
		const date = new Date(Date.now());
		const now = {
			s: date.getSeconds(),
			m: date.getMinutes(),
			h: date.getHours(),
			dayofweek: (date.getDay() === 0) ? 7 : date.getDay(),
			dayofmonth: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear(),
			date
		};
		try {
			const args = [now].concat(input.map((i) => i.value));
			output[0].value = opts.schedule.apply(null, args);
		} catch (e) {}
	}

	// Run schedule on update events and defined interval
	for (let i of input) i.on('update', schedule);
	const handle = setInterval(schedule, opts.interval);

	return () => clearInterval(handle);
}

module.exports = {check, factory};
