'use strict'

const noRawText = require('./rules/no-raw-text')

module.exports = {
  rules: {
    'no-raw-text': noRawText,
  },

  configs: {
    recommended: {
      plugins: ['i18n-conventions'],

      rules: {
        'i18n-conventions/no-raw-text': 'error',
      },
    },
  },
}