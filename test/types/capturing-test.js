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

	define('probes/types/capturing-test', function (require) {

		var capturing, manifold, clone, clock;

		capturing = require('probes/types/capturing');
		manifold = require('probes/manifold');
		clone = require('probes/util/clone');

		function raw(obj) {
			return obj;
		}

		buster.testCase('probes/types/capturing', {
			tearDown: function () {
				manifold.flush();
			},

			'should capture values': function () {
				var probe, host;

				host = { prop: { foo: 'bar' } };

				probe = capturing(clone, host, 'prop');

				assert.equals(host.prop, probe());
				refute.same(host.prop, probe());
			},
			'should publish captured values to the manifold': function (done) {
				var probe, host;

				host = { prop: { foo: 'bar' } };

				probe = capturing(clone, host, 'prop', 0, 'capturing-test');

				setTimeout(function () {
					assert.equals(host.prop, manifold()['capturing-test']);
					refute.same(host.prop, manifold()['capturing-test']);

					done();
				}, 10);
			},
			'should poll for updated values, and stop once detached': {
				setUp: function () {
					clock = this.useFakeTimers();
				},
				tearDown: function () {
					clock.restore();
				},
				'': function () {
					var probe, host, interval;

					host = { count: 0 };
					interval = setInterval(function () {
						host.count += 1;
					}, 1);

					probe = capturing(raw, host, 'count', 1, 'capturing-test');

					clock.tick(1);
					assert.same(1, manifold()['capturing-test']);
					clock.tick(1);
					assert.same(2, manifold()['capturing-test']);
					clock.tick(1);
					assert.same(3, manifold()['capturing-test']);

					probe.detach();

					clock.tick(1);
					assert.same(3, manifold()['capturing-test']);
					clock.tick(1);
					assert.same(3, manifold()['capturing-test']);

					probe.attach();

					assert.same(5, manifold()['capturing-test']);
					clock.tick(1);
					assert.same(6, manifold()['capturing-test']);
					clock.tick(1);
					assert.same(7, manifold()['capturing-test']);

					probe.detach();
					clearInterval(interval);
				}
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
