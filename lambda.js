var Promise = require('bluebird');
var AWS = require('aws-sdk');
var lambda = Promise.promisifyAll(new AWS.Lambda(), { suffix: 'MySuffix', region: process.env.AWS_REGION });

var old_functionName;
var old_memory;


function changeLambdaConfig(functionName, memory) {
  var params = {
    FunctionName: functionName,
    MemorySize: memory
  };

  return lambda.updateFunctionConfigurationMySuffix(params);
}


function callLambda(functionName, event, context) {
  var params = {
    FunctionName: functionName,
    ClientContext: new Buffer(JSON.stringify(context)).toString('base64'),
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(event)
  };

  return lambda.invokeMySuffix(params).then(function (data) {
    return Promise.resolve({
      time: (new Buffer(data.LogResult, 'base64')).toString().match('Duration: ([0-9\.]+) ms')[1],
      payload: data.Payload
    });
  });
}


function updateAndCall(functionName, memory, event, context) {

 if (functionName == old_functionName && memory == old_memory) {
   return callLambda(functionName, event, context);
 }

 old_functionName = functionName;
 old_memory = memory;

 return changeLambdaConfig(functionName, memory)
   .then(function () {
     return callLambda(functionName, event, context);
   });
}


module.exports = function (test, functionName) {
  return function (event, context) {
    context = context || {};

    return updateAndCall(functionName, test.lambdaMemory, event, context)
      .then(function (response) {

        // save it for our reporter
        test.lambdaInvokeTime = response.time;
        return Promise.resolve(response.payload);
      });
    }
}
