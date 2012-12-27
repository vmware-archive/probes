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

(function (buster, define) {
	'use strict';

	var assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	define('probe/time/timer-test', function (require) {

		var timer = require('probe/time/timer');

		buster.testCase('probe/time/timer', {
			'should measure a duration': function (done) {
				var t = timer();
				setTimeout(function () {
					var duration = t.end();

					// check time range, allowing for timer fudge, lots of fudge
					assert(duration.millis > 0);
					assert(duration.millis < 50);
					done();
				}, 10);
			},
			'should restart a timer by calling start': function (done) {
				var t = timer();
				setTimeout(function () {
					var duration = t.start().end();
					assert.equals(0, duration.millis);
					done();
				}, 10);
			},
			'should return a new duration for each end call': function (done) {
				var t, d1, d2;

				t = timer();
				d1 = t.end();
				setTimeout(function () {
					d2 = t.end();

					refute.same(d1, d2);
					assert(d1.micros < d2.micros);
					done();
				}, 10);
			}
		});


	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
