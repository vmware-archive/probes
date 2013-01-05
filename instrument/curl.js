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

(function (define, global) {
	'use strict';

	/**
	 * Instrument the curl.js AMD loader. Any module that is a function
	 * will automatically be probed with the ID 'amd:[moduleId]'. In
	 * addition, calls to the AMD define function will also be probed with
	 * the ID 'curl:define'.
	 *
	 * @see https://github.com/cujojs/curl
	 * @author Scott Andrews
	 */
	define(function (require) {

		var probe, curl, executeDefFunc;

		// load the probe first, otherwise we may be instrumenting probes
		probe = require('../probes');
		curl = require('curl/_privileged');

		// advise AMD's define function
		probe(global, 'define', 'curl:define');
		global.define.amd = define.amd;

		// advise AMD modules that are functions
		executeDefFunc = curl.core.executeDefFunc;
		curl.core.executeDefFunc = function (def) {
			var resource, ctx;
			resource = executeDefFunc(def);
			if (typeof resource === 'function') {
				// create a faux context since probe can't handle naked functions
				ctx = {	func: resource };
				probe(ctx, 'func', 'amd:' + def.toAbsId(def.id));
				resource = ctx.func;
			}
			return resource;
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof global === 'object' ? global : this
	// Boilerplate for AMD and Node
));
