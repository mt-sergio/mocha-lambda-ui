/**
 * Module dependencies.
 */

var Mocha = require('mocha');
var Suite = require('mocha/lib/suite');
var Test = require('mocha/lib/test');
var escapeRe = require('escape-string-regexp');
// jaws framework .env file
var dotenv  = require('dotenv').config({ path: './admin.env' });
var lambdaFunction = require('./lambda.js');

/**
 * BDD-style interface:
 *
 *      describe('Array', function() {
 *        describe('#indexOf()', function() {
 *          it('should return -1 when not present', function() {
 *            // ...
 *          });
 *
 *          it('should return the index when present', function() {
 *            // ...
 *          });
 *        });
 *      });
 *
 * @param {Suite} suite Root suite.
 */

module.exports = Mocha.interfaces['mocha-lambda'] = function(suite) {
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha) {
    var common = require('mocha/lib/interfaces/common')(suites, context);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function(title, fn) {
      var suite = Suite.create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
      return suite;
    };

    /**
     * Pending describe.
     */

    context.xdescribe = context.xcontext = context.describe.skip = function(title, fn) {
      var suite = Suite.create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn) {
      var suite = context.describe(title, fn);
      mocha.grep(suite.fullTitle());
      return suite;
    };

    /**
     * [lambda]
     * Configure global variables to be used in all sub-tests
     */

    context.lambdaConfig = function(lambdaConfig) {
      var suite = suites[0];
      suite.myConfig = {};
      suite.myConfig.functionName = lambdaConfig.functionName; /* required */
      suite.myConfig.count = lambdaConfig.count || 1;
      suite.myConfig.memoryArray = lambdaConfig.memoryArray || [128, 512, 1024];
    }

    /**
     * [lambda]
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.lt = function(title, fn) {
      var suite = suites[0];
      if (suite.pending) {
        fn = null;
      }

      for (var i_memoryArray = 0; i_memoryArray < suite.myConfig.memoryArray.length; i_memoryArray++) {
        for (var i_count = 0; i_count < suite.myConfig.count; i_count++) {
          var test = new Test(title, fn);
          test.lambdaMemory = suite.myConfig.memoryArray[i_memoryArray];
          test.lambdaMemoryId = i_memoryArray;
          test.lambdaNumberId = i_count;
          test.lambdaInvokeTime = 0;
          test.file = file;
          // @FIXME I don't know how to do it nicer. I cannot retrieve the current test from context.lambda
          // We should use lambda() instead this.test.lambda() instead
          test.lambda = lambdaFunction(test, suite.myConfig.functionName);
          suite.addTest(test);
        }
      }
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.lt.only = function(title, fn) {
      var test = context.lt(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.it = context.specify = function(title, fn) {
      var suite = suites[0];
      if (suite.pending) {
        fn = null;
      }
      var test = new Test(title, fn);
      test.file = file;
      suite.addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title, fn) {
      var test = context.it(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Pending test case.
     */

    context.xit = context.xspecify = context.it.skip = function(title) {
      context.it(title);
    };
  });
};
