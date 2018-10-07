# Footurama Package: Basic

This package includes basic building blocks for Footurama.

### ftrm-basic/inject

Inject values into the realm.

Configuration:

 * ```input```: **0**.
 * ```output```: **1**. Target pipe for injected values.
 * ```inject```: Function generating values: ```() => value```. Can be deferred using Promises.
 * ```interval```: Interval between two injections in milliseconds.

Example:

```js
// Inject random numbers every second
module.exports = [require('ftrm-basic/inject'), {
	output: 'output-pipe-with-numbers',
	inject: () => Math.random(),
	interval: 1000
}];
```

### ftrm-basic/inject

Inject values from object into the realm.

Configuration:

 * ```input```: **0**.
 * ```output```: **1..n**. Target pipes for values. Every pipe must have a name.
 * ```inject```: Function generating an object containing values: ```() => values```. Every key corresponds to output pipe name. Can be deferred using Promises.
 * ```interval```: Interval between two injections in milliseconds.

Example:

```js
// Inject random numbers every second
module.exports = [require('ftrm-basic/inject'), {
	output: {
		'rss': 'memused-rss',
		'heapTotal': 'memused-heapTotal',
		'heapUsed': 'memused-heapUsed',
		'external': 'memused-external'
	},
	inject: () => process.memoryUsage(),
	interval: 1000
}];
```

### ftrm-basic/map

Map values from one pipe to another.

Configuration:

 * ```input```: **1**. Values to be mapped
 * ```output```: **1**. Mapped values
 * ```map```: Function to map the input to the output: ```(input) => output```. Can be deferred using Promises.

Example:

```js
// Check whether input is greater or equal to zero
module.exports = [require('ftrm-basic/map'), {
	input: 'input-pipe-with-numbers',
	output: 'output-pipe-with-booleans',
	map: (input) => input >= 0
}];
```

### ftrm-basic/to-writable

Write values from a pipe into a writable stream. *Useful for debug logging to stdout!*

Configuration:

 * ```input```: **1**. Values to be written to the stream.
 * ```output```: **0**.
 * ```stream```: Instance of ```stream.Writable```.
 * ```dontCloseStream```: Don't close the stream on exit. *This is required when writing to process.stdout. This stream cannot be closed.*
 * ```format```: Function to format incoming values to chunks for the stream: ```(value, timestamp, src) => chunk```. ```timestamp``` is the time when value was created. ```src``` is the *tubemail* event locally raised when the value has been received. ```srv.event``` contains the actual event. Useful when working with wild characters in the input pipe.

Example:

```js
// Debug log all pipes to stdout
module.exports = [require('ftrm-basic/to-writable'), {
	input: '#', // Wild character for all pipes
	stream: process.stdout,
	dontCloseStream: true,
	format: (value, ts, src) => `${new Date(ts)}\t${src.event}\t${value.toString()}\n`
}];
```

### ftrm-basic/from-event

Grab values from arbitrary event busses and output them into pipes.

Configuration:

 * ```input```: **0**.
 * ```output```: **1..n**. Outputs to write values to. The output's name will be used to select the event accordingly.
 * ```bus```: Instance of ```EventEmitter```.

Example:

```js
// Eventbus emitting 'random' and 'time' event
const EventEmitter = require('events');
const myEventBus = new EventEmitter();
setInterval(() => myEventBus.emit('time', new Date()), 1000);
setInterval(() => myEventBus.emit('random', Math.random()), 3000);

module.exports = [require('ftrm-basic/from-event'), {
	output: {
		'time': 'some-pipe-for-time',
		'random': 'some-pipe-for-random-numbers'
	},
	bus: myEventBus
}];
```

### ftrm-basic/select

Select one input pipe out of many to forward it to the output pipe.

Configuration:

 * ```input```: **1..n**. Input pipes to select from.
 * ```output```: **1**.
 * ```weight```: Can be either a string or a function.
   * Function: ```(input, index) => score```. Is called for every input. ```input``` holds the input's instance and has the properties ```input.value```, ```input.timestamp``` and ```input.expired```. ```index``` is the respective index in the input array. The input that returned the highest score will be picked for the output. If the function returns ```undefined``` it won't be taken into account.
   * String:
     * ```'prio'```: Takes the first input that has a value that is not ```undefined``` and is not expired.
     * ```'max'```: Takes the input with the highest value that is not expired.
     * ```'min'```: Takes the input with the lowest value that is not expired.

Example:

```js
// Select 'setpoint' from several inputs
module.exports = [require('ftrm-basic/select'), {
	input: [
		// Possible inputs. First has highest priority.
		// 1. Manual override. One recieved value stays valid for one hour.
		{pipe: 'setpoint.override', expire: 60 * 60 * 1000},
		// 2. From schedule. Will be valid for 10 minutes.
		{pipe: 'setpoint.schedule', expire: 10 * 60 * 1000},
		// 3. No pipe attached, but a constant value is given: Default set point.
		{value: 10}
	],
	output: 'setpoint',
	weight: 'prio'
}];
```

### ftrm-basic/sliding-window

Collects input values and combines them according to given configuration.

Configuration:

 * ```input```: **1**. Pipe to read from.
 * ```output```: **1**. Results.
 * ```includeValue```: Function to decide whether to include a certain value in the window or net: ```(age, index) => keep```. ```age``` is the value's age in milliseconds. ```index``` is the position of the value inside the window. The latest value has index ```0```. If ```keep``` is not truthy, the value in question will be removed from the window.
 * ```calcOutput```: A function that calculates the output value: ```(window) => value```. ```window``` is an array of the ```value``` inside the sliding window.
 * ```window```: An array to keep all values. This can be used to preload or store the current window. Defaults to an empty array.

Example:
```js
// Select 'setpoint' from several inputs
module.exports = [require('ftrm-basic/sliding-window'), {
	input: 'raw-data-pipe',
	output: 'averaged-data-pipe',
	includeValue: (age, index) => age < 3600000 // Keep all values of one hour
	calcOutput: (window) => window.reduce((avg, value) => {
		// Will be called for every value inside the window
		avg += value / window.length;
		return avg;
	}, 0)
}];
```

### ftrm-basic/combine

Combine input values to one output value.

Configuration:

 * ```input```: **1..n**. Pipe to read from.
 * ```output```: **1**. Results.
 * ```combine```: A function that is called every time an input has received a new value and all input values are valid (i.e. not expired and known): ```(input0, input1, ...) => output```.

Example:
```js
// Calculate an error
module.exports = [require('ftrm-basic/combine'), {
	input: [
		'desired-value-pipe',
		'actual-value-pipe'
	],
	output: 'error-pipe',
	combine: (desired, actual) => actual - desired
}];
```
