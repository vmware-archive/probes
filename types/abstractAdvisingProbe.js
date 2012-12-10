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

(function (define) {
	"use strict";

	var undef;

	/**
	 * Support for probes that utilize AOP
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var abstractProbe, manifold, meld, when;

		abstractProbe = require('./abstractProbe');
		manifold = require('../manifold');
		meld = require('meld');
		when = require('when');

		return function (probeImpl, target, method, name) {
			var probe, advised;

			probe = abstractProbe(probeImpl, name);

			/**
			 * Attach the probe to the target to start collecting metrics
			 *
			 * @returns probe for API chaining
			 */
			function attach() {
				var orig, prop;

				if (advised) {
					// already applied
					return;
				}

				orig = target[method];
				advised = meld.around(target, method, function (joinpoint) {
					try {
						return probeImpl.advice.apply(this, arguments);
					}
					finally {
						probeImpl.publish();
					}
				});

				// copy other properties on to advised function
				for (prop in orig) {
					if (orig.hasOwnProperty(prop)) {
						target[method][prop] = orig[prop];
					}
				}
				if (orig.hasOwnProperty('prototype')) {
					// prototype is special, causes issues with wire if not updated
					target[method].prototype = orig.prototype;
				}

				return probe;
			}

			/**
			 * Detach the probe from the target to stop collecting metrics
			 *
			 * @returns probe for API chaining
			 */
			function detach() {
				if (!advised) {
					// not applied
					return;
				}

				advised.remove();
				if (probeImpl.detach) {
					probeImpl.detach();
				}
				if (name) {
					manifold.remove(name);
				}

				return probe;
			}

			probe.attach = attach;
			probe.detach = detach;

			// we may want to not auto attach in the future
			attach();

			return probe;
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
