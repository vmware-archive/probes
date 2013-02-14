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

	define('probes/time/timer-test', function (require) {

		var timer, now, clock;

		timer = require('probes/time/timer');
		now = require('probes/time/now');

		clock = (function () {
			var base = Date.now(), drift = 0;
			return {
				now: function () {
					return base + drift;
				},
				mark: function () {
					return drift * 1000;
				},
				tick: function (ms) {
					drift += ms;
				},
				set: function (ms) {
					base = ms;
					drift = 0;
				}
			};
		}());

		buster.testCase('probes/time/timer', {
			'should measure a duration': function () {
				var t, duration;
				t = timer(clock);
				clock.tick(10);
				duration = t.end();
				assert.same(10, duration.millis);
			},
			'should restart a timer by calling start': function () {
				var t, duration;
				t = timer(clock);
				clock.tick(10);
				duration = t.start().end();
				assert.equals(0, duration.millis);
			},
			'should return a new duration for each end call': function () {
				var t, d1, d2;
				t = timer(clock);
				d1 = t.end();
				clock.tick(10);
				d2 = t.end();
				assert.same(10, d2.millis - d1.millis);
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
