'use strict'

const TECHNICAL_PATTERNS = [
  /**
   * URLs
   *
   * https://example.com
   * http://example.com
   */
  /^https?:\/\//,

  /**
   * Email / telephone
   */
  /^mailto:/,
  /^tel:/,

  /**
   * API paths
   *
   * /api/users
   * /api/users/123
   */
  /^\/api\//,

  /**
   * Regular URL paths
   *
   * /users
   * /settings/profile
   */
  /^\/[a-zA-Z0-9/_-]+$/,

  /**
   * HEX colors
   *
   * #fff
   * #ffffff
   */
  /^#[0-9a-fA-F]{3,8}$/,

  /**
   * Constants
   *
   * POST
   * GET
   * USER_ID
   */
  /^[A-Z][A-Z0-9_-]*$/,

  /**
   * Numbers
   */
  /^\d+$/,

  /**
   * Files
   *
   * image.png
   * user.json
   */
  /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/,

  /**
   * Technical values
   *
   * user/profile
   * user-id
   */
  /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_./-]+$/,

  /**
   * Values in the following format:
   *
   * user:id
   * type:value
   */
  /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/,
]

function isIgnoredValue(value, options) {
  const text = String(value).trim()

  if (!text) {
    return true
  }

  /**
   * Explicit whitelist.
   */
  if (options.ignoredValues.includes(text)) {
    return true
  }

  /**
   * Technical patterns.
   */
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(text))
}

module.exports = {
  isIgnoredValue,
}