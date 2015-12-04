Useful for test your live AWS lambdas and obtain how long they spent depending of the memory and the number of times

INSTALL
=======

    npm install --save-dev mocha-lambda-ui


Important: You need to set your ~/.aws/credentials and `EXPORT AWS_REGION=us-east-1`


FEATURES
========

Creates new UI called `mocha-lambda-ui` based on BDD. Example:

    mocha -t 30000 -R mocha-lambda-reporter -u mocha-lambda-ui -c tests/live/**/*.js;

It should be used with mocha-lambda-reporter to see the invokation time


EXAMPLE
=======

/tests/live/module-function.js

    describe('module-function', function () {

      lambdaConfig(require('./config.json')['module-function']);

      lt('Check response', function () {
        var event = {}; // required
        var context = {}; // optional
        return this.test.lambda(event, context).then(function (actual) {
          var expected = '';
          expect(actual).be.equal(expected);
        });
      });
    });

/tests/live/config.json

    {
      "module-function": {
        "functionName": "dev-ProjectName-l-lModuleFunction-XXXXXXXX",
        "count": 5,
        "memoryArray": [128, 512, 1024, 1536]
      }
    }
