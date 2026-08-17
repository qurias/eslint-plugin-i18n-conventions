'use strict'

const { isIgnoredValue } = require('./is-ignored')

function isTranslatable(value, options) {
  const text = String(value).trim()

  /**
   * Empty string.
   */
  if (!text) {
    return false
  }

  /**
   * Technical values.
   */
  if (isIgnoredValue(text, options)) {
    return false
  }

  /**
   * Symbols and numbers.
   *
   * Examples:
   * "№"
   * "123"
   * "---"
   * "..."
   * "100%"
   * "→"
   *
   * If the value does not contain any letter,
   * it is not considered translatable text.
   */
  if (!/\p{L}/u.test(text)) {
    return false
  }

  /**
   * Everything else in the user context
   * is considered text.
   *
   * Language does not matter here.
   */
  return true
}

module.exports = {
  isTranslatable,
}