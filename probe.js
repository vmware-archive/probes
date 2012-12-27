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
	'use strict';

	var undef;

	/**
	 * Shortcut to other types of probes
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var defaultProbe, responseTimeGauge, trace, capturing;

		responseTimeGauge = require('./types/responseTimeGauge');
		trace = require('./types/trace');
		capturing = require('./types/capturing');

		defaultProbe = responseTimeGauge;

		/**
		 * Create a default probe. The initial default probe is a responseTimeGague.
		 */
		function probe() {
			return defaultProbe.apply(undef, arguments);
		}

		/**
		 * Change the default probe type.
		 *
		 * @param {Function} probe the factory function for the new default probe
		 */
		function setDefault(probe) {
			defaultProbe = probe;
		}

		probe.responseTimeGauge = responseTimeGauge;
		probe.trace = trace;
		probe.capturing = capturing;

		probe.setDefault = setDefault;

		return probe;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
