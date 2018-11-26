module.exports = {
  env: {
    node: true,
    mocha: true,
  },
  parserOptions: {
    sourceType: 'script'
  },
  extends: 'eslint:recommended',
  rules: {
    'indent': [2, 2, {SwitchCase: 1 }],
    'brace-style': [2, "stroustrup", {'allowSingleLine': true} ],
    'comma-dangle': [0],
    'complexity': [2, 19],
    'curly': 2,
    'eqeqeq': 2,
    'max-depth': 2,
    'max-statements': [2, 20],
    'new-cap': 2,
    'no-caller': 2,
    'no-cond-assign': 2,
    'no-else-return': 2, // maybe
    'no-unused-vars': [2, { 'args': 'after-used' }],
    'no-use-before-define': 2,
    'quotes': [2, 'single', 'avoid-escape'],
    'semi': [2, 'always', {'omitLastInOneLineBlock': true }],
    'space-before-function-paren': [2, 'never'],
    'strict': 2,
    'wrap-iife': [2, 'inside']
  },
  globals: {
    'Promise': true
  }
};
