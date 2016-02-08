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


function callLambda(functionName, qualifier, event, context) {
  var params = {
    FunctionName: functionName,
    ClientContext: new Buffer(JSON.stringify(context)).toString('base64'),
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(event),
    Qualifier: qualifier
  };

  return lambda.invokeMySuffix(params).then(function (data) {
    return Promise.resolve({
      time: (new Buffer(data.LogResult, 'base64')).toString().match('Duration: ([0-9\.]+) ms')[1],
      payload: data.Payload
    });
  });
}


function updateAndCall(functionName, qualifier, memory, event, context) {

 if (functionName == old_functionName && memory == old_memory) {
   return callLambda(functionName, qualifier, event, context);
 }

 old_functionName = functionName;
 old_memory = memory;

 return changeLambdaConfig(functionName, memory)
   .then(function () {
     return callLambda(functionName, qualifier, event, context);
   });
}


module.exports = function (test, functionName, qualifier) {
  return function (event, context) {
    context = context || {};

    return updateAndCall(functionName, qualifier, test.lambdaMemory, event, context)
      .then(function (response) {

        // save it for our reporter
        test.lambdaInvokeTime = response.time;
        return Promise.resolve(response.payload);
      });
    }
};
