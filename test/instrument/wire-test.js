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

	var assert, refute, fail;

	assert = buster.assert;
	refute = buster.refute;
	fail = buster.assertions.fail;

	define('probe/instrument/wire-test', function (require) {

		var instrumentWire, when;

		instrumentWire = require('probe/instrument/wire');
		when = require('when');

		buster.testCase('probe/instrument/wire', {
			'should instrument component methods with default probes': function (done) {
				var destroyed, resolver, options, plugin, proxy, target, wire, probe;

				destroyed = when.defer();
				resolver = when.defer();
				options = {};

				target = {
					method1: noop,
					method2: noop
				};

				proxy = {
					target: target,
					path: 'testComponent'
				};

				probe = this.spy();

				wire = {
					resolveRef: this.stub().returns(probe)
				};

				resolver.then(
					function () {
						assert.defined(target.method1._advisor);
						assert.defined(target.method2._advisor);
					},
					fail
				).then(done, done);

				plugin = instrumentWire.wire$plugin({}, destroyed, options);
				plugin.ready(resolver.resolver, proxy, wire);
			},

			'should instrument component methods with configured probes': function (done) {
				var destroyed, resolver, options, plugin, proxy, target, wire, probe;

				destroyed = when.defer();
				resolver = when.defer();
				options = {
					probes: {
						testProbe: /.*/
					}
				};

				target = {
					method1: noop,
					method2: noop
				};

				proxy = {
					target: target,
					path: 'testComponent'
				};

				probe = this.spy();

				wire = {
					resolveRef: this.stub().returns(probe)
				};

				resolver.then(
					function () {
						assert.calledTwice(probe);
					},
					fail
				).then(done, done);

				plugin = instrumentWire.wire$plugin({}, destroyed, options);
				plugin.ready(resolver.resolver, proxy, wire);
			}

		});

	});

	function noop() {}

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
