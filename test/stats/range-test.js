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

	var assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	define('probe/stats/range-test', function (require) {

		var range = require('probe/stats/range');

		buster.testCase('probe/stats/range', {
			'should update the max and min as appropriate': function () {
				var r = range();

				r(0);
				assert.same(0, r.min());
				assert.same(0, r.max());

				r(-2);
				assert.same(-2, r.min());
				assert.same(0, r.max());

				r(2);
				assert.same(-2, r.min());
				assert.same(2, r.max());

				r(1);
				assert.same(-2, r.min());
				assert.same(2, r.max());

				r(Number.MAX_VALUE);
				assert.same(-2, r.min());
				assert.same(Number.MAX_VALUE, r.max());

				r(Number.POSITIVE_INFINITY);
				assert.same(-2, r.min());
				assert.same(Number.POSITIVE_INFINITY, r.max());

				r(Number.NEGATIVE_INFINITY);
				assert.same(Number.NEGATIVE_INFINITY, r.min());
				assert.same(Number.POSITIVE_INFINITY, r.max());
			},
			'should ignore non-numerics': function () {
				var r = range();

				r(null);
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());

				r(undef);
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());

				r(true);
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());

				r(false);
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());

				r('foo');
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());

				r({});
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());

				r(new Date());
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());

				r(NaN);
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());
			},
			'should not overwrite a value with undefined': function () {
				var r = range();

				r(0);

				r(undefined);
				assert.same(0, r.min());
				assert.same(0, r.max());

				r(NaN);
				assert.same(0, r.min());
				assert.same(0, r.max());
			},
			'should restart range at undefined when reset': function () {
				var r = range();

				r(1);
				r(2);
				assert.same(1, r.min());
				assert.same(2, r.max());

				r.reset();
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());

				r(0);
				assert.same(0, r.min());
				assert.same(0, r.max());
			},
			'should not update the readOnly stat': function () {
				var r, ro;

				r = range();
				ro = r.readOnly();

				r(1);
				r(2);
				assert.same(1, r.min());
				assert.same(2, r.max());
				assert.same(1, ro.min());
				assert.same(2, ro.max());

				ro(0);
				ro(3);
				assert.same(1, r.min());
				assert.same(2, r.max());
				assert.same(1, ro.min());
				assert.same(2, ro.max());

				ro.reset();
				assert.same(1, r.min());
				assert.same(2, r.max());
				assert.same(1, ro.min());
				assert.same(2, ro.max());

				r.reset();
				assert.same(NaN, r.min());
				assert.same(NaN, r.max());
				assert.same(NaN, ro.min());
				assert.same(NaN, ro.max());

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
