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

(function (define) {
	'use strict';

	/**
	 * probes instrumentation wire.js plugin
	 * Allows instrumenting wire component methods
	 *
	 * @author Brian Cavalier
	 */
	define(function (require) {

		var probe, when, createDefaultProbe, probeNameRx,
			defaultProbeNameTemplate, defaultProbeStep, isNode, alwaysAllow;

		probe = require('../probes');
		when = require('when');

		alwaysAllow = {
			test: function () {
				return true;
			}
		};

		createDefaultProbe = probe;
		defaultProbeNameTemplate = 'wire:{component}:{method}:{type}';
		probeNameRx = /\{[^\}]+\}/g;
		// Not clear what is the best lifecycle step to add probes.
		// If you're specifically interested in collecting probe data
		// during wiring, then 'create' would be a better time
		// than 'ready'.  Could make this configurable via plugin
		// option.
		defaultProbeStep = 'ready';

		/**
		 * Returns true if it is a Node
		 * Adapted from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
		 *
		 * @param it anything
		 * @return {boolean} true if it is a Node
		 */
		isNode = typeof Node === 'object' ?
				function (it) { return it instanceof Node; } :
				function (it) { return it && typeof it === 'object' && typeof it.nodeType === 'number' && typeof it.nodeName === 'string'; };

		return {
			wire$plugin: function (ready, destroyed, options) {
				var probes, probeNameTemplate, probesToAdd, probeStep, plugin;

				/**
				 * Test if a method is allowed to have a probe attached. This
				 * uses the supplied matcher, but also filters out methods on
				 * DOM Nodes, which will break in some browsers.
				 *
				 * @param {Function} matcher returns true if component name is
				 *   allowed to be probed
				 * @param target candidate component for probe
				 * @param {string} path candidate component name for probe
				 * @param {string} method candidate method name for probe
				 * @return {boolean} true if target[method] is allowed to have
				 *   a probe attached
				 */
				function allowProbe(matcher, target, path, method) {
					return !isNode(target) && matcher.test(path + '.' + method);
				}

				/**
				 * Generate a probe name for the supplied component name,
				 * method name, and probe type.
				 *
				 * @param {string} componentName component name
				 * @param {string} methodName method name
				 * @param {string} probeType probe type
				 * @return {string} probe name
				 */
				function createProbeName(componentName, methodName, probeType) {
					var replacements = { component: componentName, method: methodName, type: probeType };
					return probeNameTemplate.replace(probeNameRx, function (token) {
						return replacements[token.slice(1, token.length - 1)] || '';
					});
				}

				/**
				 * Attach configured probes to methods of the proxied component
				 *
				 * @param {Object} resolver resolver to signal the plugin is done
				 * @param {Object} proxy wire proxy for target component
				 * @param {Function} wire wire
				 */
				function addProbes(resolver, proxy, wire) {
					var added, target, path, method, addProbesToMethod;


					function addDefaultProbesToMethod(target, path, method) {
						var added = [];

						if (allowProbe(alwaysAllow, target, path, method)) {
							added.push(addProbe(createDefaultProbe, target, method, createProbeName(path, method, 'default')));
						}

						return added;
					}

					function addConfiguredProbesToMethod(target, path, method) {
						var probeRef, added;

						added = [];

						for (probeRef in probesToAdd) {

							if (allowProbe(probesToAdd[probeRef], target, path, method)) {
								added.push(addProbe(wire.resolveRef(probeRef), target, method, createProbeName(path, method, probeRef)));
							}
						}

						return added;
					}

					added = [];
					target = proxy.target;
					path = proxy.path;

					addProbesToMethod = probesToAdd ? addConfiguredProbesToMethod : addDefaultProbesToMethod;

					// For each method, add each configured probe that matches
					for (method in target) {
						// hasOwnProperty?  If not, then a side effect here is that
						// prototype methods will get promoted to owned methods.
						if (typeof target[method] === 'function') {
							added = added.concat(addProbesToMethod(target, path, method));
						}

					}

					// Once all probes have been added, signal we're done
					when.all(added, resolver.resolve, resolver.reject);

					/**
					 * Helper to add a single probe
					 *
					 * @param {string} probe name of a probe component to add
					 * @param target component to which to add the probe
					 * @param {string} method target method to which to add the
					 *   probe
					 * @param {string} name probe name
					 * @return {Promise} promise that resolves once the probe
					 *   has been added
					 */
					function addProbe(probe, target, method, name) {
						return when(probe, function (probe) {
							probes.push(probe(target, method, name));
						});
					}
				}
				// Collect probes specific to the current context so they
				// can be removed when the context is destroyed.
				probes = [];

				probesToAdd = options.probes;
				probeNameTemplate = options.nameTemplate || defaultProbeNameTemplate;
				probeStep = options.step || defaultProbeStep;

				// Add probes in the configured lifecycle step
				plugin = {};
				plugin[probeStep] = addProbes;

				// Arrange for all probes to be removed when the context is destroyed
				destroyed.then(function () {
					probes.forEach(function (probe) {
						probe.remove();
					});
				});

				return plugin;

			}
		};

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
