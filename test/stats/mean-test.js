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

	define('probe/stats/mean-test', function (require) {

		var mean, counter;

		mean = require('probe/stats/mean');
		counter = require('probe/stats/counter');

		buster.testCase('probe/stats/mean', {
			'update the mean for each new value': function () {
				var m = mean();
				assert.same(1, m(1));
				assert.same(2, m(3));
				assert.same(2, m(2));
				assert.same(4, m(10));
				assert.same(0, m(-16));
				assert.same(1 / 6, m(1));
			},
			'allow counter to be injected': function () {
				var m, c;
				c = counter();
				m = mean(c);

				c.inc();
				assert.same(1, m(1));
				c.inc();
				assert.same(2, m(3));
				c.inc();
				assert.same(2, m(2));
				c.inc();
				assert.same(4, m(10));
				c.inc();
				assert.same(0, m(-16));
				c.inc();
				assert.same(1 / 6, m(1));
			},
			'injected counters must be incremented manually': function () {
				var m = mean(counter());
				assert.same(Number.POSITIVE_INFINITY, m(1));
			},
			'not passing a value returns the most recent mean': function () {
				var m = mean();
				assert.same(1, m(1));
				assert.same(1, m());
				assert.same(1, m());
			},
			'should restart from NaN when reset': function () {
				var m = mean();

				assert.same(NaN, m());
				assert.same(1, m(1));
				assert.same(2, m(3));

				m.reset();

				assert.same(NaN, m());
				assert.same(1, m(1));
				assert.same(2, m(3));
			},
			'should not update the readOnly stat': function () {
				var m, ro;

				m = mean();
				ro = m.readOnly();

				assert.same(NaN, m());
				assert.same(NaN, ro());
				assert.same(1, m(1));
				assert.same(1, ro(2));
				ro.reset();
				assert.same(1, m());
				m.reset();
				assert.same(NaN, m());
				assert.same(NaN, ro());

				assert.same(ro, ro.readOnly());
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
