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

	var toISOString, undef;

	toISOString = Date.prototype.toISOString || (function () {

		function pad(val, count) {
			val = '' + val;
			while (val.length < count) {
				val = '0' + val;
			}
			return val;
		}

		return function () {
			return [
				pad(this.getUTCFullYear(), 4),
				'-',
				pad(this.getUTCMonth(), 4),
				'-',
				pad(this.getUTCDay(), 2),
				'T',
				pad(this.getUTCHours(), 2),
				':',
				pad(this.getUTCMinutes(), 2),
				':',
				pad(this.getUTCSeconds(), 2),
				'.',
				pad(this.getUTCMilliseconds(), 3),
				'Z'
			].join('');
		};
	}());

	/**
	 * Export manifold data to cube
	 *
	 * @author Scott Andrews
	 */
	define(function (require) {

		var manifold, session;

		manifold = require('../manifold');
		session = require('./_session');

		/**
		 * Create an exporter that publishes data as cube events.
		 *
		 * @param {Function} client remote transport for cube formated data
		 * @param {number} interval frequency to collect and publish probe
		 *   values
		 * @param {Function} store the store to fetch and save the session
		 *   identifier
		 * @see http://square.github.com/cube/
		 */
		return function (client, interval, store) {
			var timeout, sessionId;

			sessionId = session(store);

			function publish() {
				var exp, data, time, probe;

				exp = manifold.exports();
				time = toISOString.call(new Date(exp.timestamp));

				data = [];
				for (probe in exp.probes) {
					data.push({
						type: 'probe',
						time: time,
						data:  {
							name: probe,
							userAgent: exp.userAgent,
							session: sessionId,
							data: exp.probes[probe]
						}
					});
				}

				client(data);
			}

			/**
			 * Pause publishing of stats until explicit resumed
			 */
			function pause() {
				if (!timeout) {
					return;
				}
				clearTimeout(timeout);
				timeout = undef;
			}

			/**
			 * Resume publishing of stats on the defined frequency. Publishes
			 * immediately unless asked to delay
			 *
			 * @param {Boolean} [delay=false] if truthy, stats will be
			 *   published on the next interval instead of immediately.
			 */
			function resume(delay) {
				if (timeout) {
					pause();
				}
				timeout = setTimeout(function () {
					timeout = undef;
					resume();
				}, interval);
				if (!delay) {
					publish();
				}
			}

			resume(true);

			return {
				pause: pause,
				resume: resume
			};
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
