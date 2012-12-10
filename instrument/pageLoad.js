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

(function (define, window) {
	"use strict";

	var undef;

	/**
	 * Captures values defined by the Performance Navigation Timing spec.
	 *
	 * `window.performance.navigation` is captured as 'performance/navigation'
	 * `window.performance.timing` is captured as 'performance/timing'
	 *
	 * These values are captured once the page has fully loaded, and are
	 * never updated.
	 *
	 * @see http://www.w3.org/TR/navigation-timing/
	 * @author Scott Andrews
	 */
	define(function (require) {

		var capturing, async, clone, when, installed;

		capturing = require('../types/capturing');
		async = require('../util/async');
		clone = require('../util/clone');
		when = require('when');

		installed = when.defer();

		function install() {
			// allow all onload events to finish
			async(function () {
				capturing(clone, window.performance, 'navigation', 0, 'performance/navigation');
				capturing(clone, window.performance, 'timing', 0, 'performance/timing');

				installed.resolve();
			});
		}

		if (window.performance) {
			if (window.document.readyState === 'complete') {
				install();
			}
			else {
				// load is only fired once, no need to clean up
				window.addEventListener('load', install);
			}
		}

		return installed.promise;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	this
	// Boilerplate for AMD and Node
));
