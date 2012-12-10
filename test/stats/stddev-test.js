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
	"use strict";

	var assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	function trunc(value) {
		return Math.floor(value * 1e6) / 1e6;
	}

	define('probe/stats/stddev-test', function (require) {

		var stddev, mean, counter;

		stddev = require('probe/stats/stddev');
		mean = require('probe/stats/mean');
		counter = require('probe/stats/counter');

		buster.testCase('probe/stats/stddev', {
			'update the standard deviation for each new value': function () {
				var sd = stddev();
				assert.same(NaN, sd(13));
				assert.same(0, sd(13));
				assert.same(5.773502, trunc(sd(23)));
				assert.same(5.188127, trunc(sd(12)));
				assert.same(13.619838, trunc(sd(44)));
				assert.same(18.467990, trunc(sd(55)));
			},
			'allow counter and mean to be injected': function () {
				var m, c, sd;
				c = counter();
				m = mean(c);
				sd = stddev(m, c);

				c.inc();
				m(13);
				assert.same(NaN, sd(13));

				c.inc();
				m(13);
				assert.same(0, sd(13));

				c.inc();
				m(23);
				assert.same(5.773502, trunc(sd(23)));
			},
			'injected stats must be updated manually': function () {
				var m, c, sd;
				c = counter();
				m = mean(c);
				sd = stddev(m, c);

				assert.same(NaN, sd(13));
				assert.same(NaN, sd(13));
			},
			'should restart the stddev at NaN when reset': function () {
				var sd = stddev();

				assert.same(NaN, sd(13));
				assert.same(0, sd(13));
				assert.same(5.773502, trunc(sd(23)));

				sd.reset();

				assert.same(NaN, sd(13));
				assert.same(0, sd(13));
				assert.same(5.773502, trunc(sd(23)));
			},
			'should not update the readOnly stat': function () {
				var sd, ro;

				sd = stddev();
				ro = sd.readOnly();

				assert.same(NaN, sd());
				assert.same(NaN, ro());
				assert.same(NaN, sd(13));
				assert.same(0, sd(13));
				assert.same(5.773502, trunc(sd(23)));
				assert.same(5.773502, trunc(ro(2)));
				ro.reset();
				assert.same(5.773502, trunc(sd()));
				sd.reset();
				assert.same(NaN, sd());
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
