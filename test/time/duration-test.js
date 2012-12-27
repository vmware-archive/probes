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

	define('probe/time/duration-test', function (require) {

		var duration = require('probe/time/duration');

		buster.testCase('probe/time/duration', {
			'should represent the different between start and end times in micros': function () {
				var d = duration(0, 1);
				assert.equals(1, d.micros);
			},
			'should transform to millis and seconds from micros': function () {
				var d = duration(1e6, 5e6);
				assert.equals(4000, d.millis);
				assert.equals(4, d.seconds);
			},
			'should round duration to the nearest whole number': function () {
				var d = duration(0, 1234567);
				assert.equals(1234567, d.micros);
				assert.equals(1235, d.millis);
				assert.equals(1, d.seconds);
			},
			'should not contain a start or end value by default': function () {
				var d = duration(1e6, 5e6);
				refute(d.start);
				refute(d.end);
			},
			'should base start and end values on the provided timestamp': function () {
				var now, d;
				now = new Date().getTime();
				d = duration(1e6, 5e6, now);
				assert.equals(now, d.start);
				assert.equals(now, d.end - d.millis);
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
