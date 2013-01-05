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

	define('probes/util/pacify-test', function (require) {

		var pacify, when, hasGetPrototypeOf;

		pacify = require('probes/util/pacify');
		when = require('when');

		hasGetPrototypeOf = (function () {
			function P() {}
			function C() {}
			C.prototype = new P();

			return 'getPrototypeOf' in Object && Object.getPrototypeOf(new C()) === C.prototype;
		}());

		buster.testCase('probes/util/pacify', {
			'should pacify booleans': function () {
				var p = pacify(true);
				assert.same('boolean', p.type);
				assert.same('true', p.value);
				refute(p.name);
				refute(p.proto);
			},
			'should pacify numbers': function () {
				var p = pacify(42);
				assert.same('number', p.type);
				assert.same('42', p.value);
				refute(p.name);
				refute(p.proto);
			},
			'should pacify strings': function () {
				var p = pacify('hello world');
				assert.same('string', p.type);
				assert.same('hello world', p.value);
				refute(p.name);
				refute(p.proto);
			},
			'should pacify functions': function () {
				var p = pacify(function Foo() {});
				assert.same('function', p.type);
				refute(p.value);
				assert.same('Foo', p.name);
				refute(p.proto);
			},
			'should pacify anon functions': function () {
				var p = pacify(function () {});
				assert.same('function', p.type);
				refute(p.value);
				assert.same('', p.name);
				refute(p.proto);
			},
			'should pacify implicit objects': function () {
				var p = pacify({ foo: 'bar' });
				assert.same('object', p.type);
				assert.same('[object Object]', p.value);
				refute(p.name);
				if (hasGetPrototypeOf) {
					assert.same('Object', p.proto);
				}
			},
			'should pacify constructed objects': function () {
				function Foo() {}
				Foo.prototype.toString = function () {
					return 'bar';
				};
				var p = pacify(new Foo());
				assert.same('object', p.type);
				assert.same('bar', p.value);
				refute(p.name);
				if (hasGetPrototypeOf) {
					assert.same('Foo', p.proto);
				}
			},
			'should pacify dates': function () {
				var p = pacify(new Date(1346268322000));
				assert.same('object', p.type);
				assert.same(1346268322000, Date.parse(p.value));
				refute(p.name);
				if (hasGetPrototypeOf) {
					assert.same('Date', p.proto);
				}
			},
			'should pacify regexps': function () {
				var p = pacify(/^hello/i);
				assert.same('object', p.type);
				assert.same('/^hello/i', p.value);
				refute(p.name);
				if (hasGetPrototypeOf) {
					assert.same('RegExp', p.proto);
				}
			},
			'should pacify arrays': function () {
				var p = pacify([42, 'hello', { foo: 'bar'}]);
				assert.same('object', p.type);
				assert.same('42,hello,[object Object]', p.value);
				refute(p.name);
				if (hasGetPrototypeOf) {
					assert.same('Array', p.proto);
				}
			},
			'should pacify null': function () {
				var p = pacify(null);
				assert.same('object', p.type);
				// may be [object Null] or [object Object] depending on the environment
				assert.same(Object.prototype.toString.call(null), p.value);
				refute(p.name);
				refute(p.proto);
			},
			'should pacify undefined': function () {
				var p = pacify(undefined);
				assert.same('undefined', p.type);
				refute(p.value);
				refute(p.name);
				refute(p.proto);
			},
			'should pacify NaN': function () {
				var p = pacify(NaN);
				assert.same('number', p.type);
				assert.same('NaN', p.value);
				refute(p.name);
				refute(p.proto);
			},
			'should pacify Infinity': function () {
				var p = pacify(Number.POSITIVE_INFINITY);
				assert.same('number', p.type);
				assert.same('Infinity', p.value);
				refute(p.name);
				refute(p.proto);
			},
			'should pacify arguments': function () {
				var p = pacify(arguments);
				assert.same('object', p.type);
				// may be [object Arguments] or [object Object] depending on the environment
				assert.same(arguments.toString(), p.value);
				refute(p.name);
				if (hasGetPrototypeOf) {
					assert.same('Object', p.proto);
				}
			},
			'should pacify promises': function () {
				var p = pacify(when());
				assert.same('promise', p.type);
				assert.same('[object Object]', p.value);
				refute(p.name);
				refute(p.proto);
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
