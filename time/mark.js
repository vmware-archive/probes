/*
 * Copyright (c) 2012 VMware, Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function (define, process, window) {
	"use strict";

	var undef;

	/**
	 * High resolution point in time
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var now, mark, offset;

		now = require('./now');

		/**
		 * Uses the highest resolution time available for the platform to
		 * return timestamps in microseconds. In browsers, the value will
		 * often be rounded to the nearest millisecond.  Due to the loss of
		 * precision with large numbers, values are anchored to an arbitrary
		 * point in time that is only consistent within the process.
		 *
		 * @returns function that returns the time in microseconds
		 */

		function initDateTime() {
			var init = now();
			mark = function markDate() {
				return (now() - init) * 1e3;
			};
			offset = function () {
				return init;
			};
		}

		function initPerformanceTime() {
			var now, init;
			now = (window.performance.now || window.performance.webkitNow).bind(window.performance);
			init = window.performance.timing.navigationStart;
			mark = function markPerf() {
				return Math.floor(now() * 1e3);
			};
			offset = function () {
				return init;
			};
		}

		function initProcessTime() {
			var init, o;
			o = now();
			init = process.hrtime();
			mark = function markProc() {
				var now, sec, nano;

				now = process.hrtime();
				sec = now[0] - init[0];
				nano = now[1] - init[1];

				return (sec * 1e6) + Math.floor(nano / 1e3);
			};
			offset = function () {
				// hrtime() is an relative time stamp, return an absolute time stamp instead
				return o;
			};
		}

		if (process && process.hrtime) {
			// high resolution time is new in Node 0.8
			initProcessTime();
		}
		else if (window && window.performance && (window.performance.now || window.performance.webkitNow)) {
			// high resolution time in some browsers (IE 10, Chrome)
			initPerformanceTime();
		}
		else {
			initDateTime();
		}

		mark.offset = offset;

		return mark;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof process === 'undefined' ? undefined : process,
	typeof window === 'undefined' ? undefined : window
	// Boilerplate for AMD and Node
));
