Useful for test your live AWS lambdas and obtain how long they spent depending of the memory and the number of times

INSTALL
=======

    npm install --save-dev mocha-lambda-ui


FEATURES
========

Creates new UI called `mocha-lambda-reporter` based on Spec. Example:

    mocha -t 30000 -R mocha-lambda-reporter -u mocha-lambda-ui -c tests/live/**/*.js;

It should be used with mocha-lambda-ui to see the invokation time


EXAMPLE
=======

    λ(module-function)
     Check response
    ┌───┬────────┬────────┬────────┬────────┐
    │ ✓ │ 128    │ 512    │ 1024   │ 1536   │
    ├───┼────────┼────────┼────────┼────────┤
    │ 1 │ 438.68 │ 500.06 │ 440.85 │ 387.18 │
    ├───┼────────┼────────┼────────┼────────┤
    │ 2 │ 811.35 │ 458.89 │ 426.82 │ 415.50 │
    ├───┼────────┼────────┼────────┼────────┤
    │ 3 │ 482.55 │ 440.43 │ 777.20 │ 402.40 │
    └───┴────────┴────────┴────────┴────────┘
