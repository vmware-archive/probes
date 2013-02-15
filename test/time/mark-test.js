/*
 * Copyright (c) 2012-2013 VMware, Inc. All Rights Reserved.
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

	define('probes/time/mark-test', function (require) {

		var mark = require('probes/time/mark');

		// NOTE: high resolution time implementations may skew from Date.now(),
		// particularly in a VM. Rebooting will usually do the trick.

		buster.testCase('probes/time/mark', {
			'should increment mark chronologically': function () {
				var t1, t2, t3;
				t1 = mark();
				t2 = mark();
				t3 = mark();
				assert(t1 <= t2);
				assert(t2 <= t3);
				do {
					// keep running until the mark has incremented, common in browsers with ms granularity
					t3 = mark();
				}
				while (t1 === t3);
				assert(t1 < t3);
			},
			'should represent time in microseconds': function (done) {
				var t1, t2, diff;
				t1 = mark();
				setTimeout(function () {
					t2 = mark();
					diff = t2 - t1;
					// check time range, allowing for timer fudge, lots of fudge
					assert(diff > 1000);
					assert(diff < 1000e3);
					done();
				}, 100);
			},
			'should provide date offset removed from timestamps': function () {
				var t, now;
				now = new Date().getTime();
				t = Math.floor(mark() / 1e3);
				assert(now / 2 > t);
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
