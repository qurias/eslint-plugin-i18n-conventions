const { Linter } = require('eslint')
const rule = require('../rules/no-raw-text')

const linter = new Linter()

linter.defineRule('no-raw-text', rule)

const result = linter.verify(
  `
    toast('User created')
  `,
  {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },

    rules: {
      'no-raw-text': 'error',
    },
  },
)

console.log(result)