'use strict'

const {
  DEFAULT_FUNCTIONS,
  DEFAULT_PROPERTIES,
  DEFAULT_VARIABLES,
  DEFAULT_IGNORED_VALUES,
  DEFAULT_I18N_FUNCTIONS,
  DEFAULT_I18N_OBJECTS,
} = require('../utils/constants')

const { isTranslatable } = require('../utils/is-translatable')

/**
 * Locale names.
 *
 * Examples:
 * en
 * ru
 * de
 * en-US
 * en-GB
 * pt-BR
 * zh-CN
 * am-is
 */
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[a-z]{2,4})?$/i

/**
 * Merges default values with user additions/removals.
 *
 * Result:
 *
 * defaults
 * + add
 * - remove
 *
 * Backward compatibility:
 *
 * functions: ['foo', 'bar']
 *
 * completely replaces defaults.
 */
function mergeOptionValues(defaults, config) {
  if (Array.isArray(config)) {
    return config
  }

  const add = Array.isArray(config?.add) ? config.add : []

  const remove = new Set(
    Array.isArray(config?.remove) ? config.remove : [],
  )

  return [
    ...new Set([
      ...defaults.filter((item) => !remove.has(item)),
      ...add,
    ]),
  ]
}

/**
 * Gets the object property name.
 *
 * {
 *   title: 'Hello'
 * }
 *
 * -> "title"
 */
function getPropertyName(node) {
  if (!node || node.type !== 'Property') {
    return null
  }

  if (node.key.type === 'Identifier') {
    return node.key.name
  }

  if (node.key.type === 'Literal') {
    return node.key.value
  }

  return null
}

/**
 * Gets the variable name.
 *
 * const title = 'Save'
 *
 * -> "title"
 */
function getVariableName(node) {
  if (!node || !node.id) {
    return null
  }

  if (node.id.type === 'Identifier') {
    return node.id.name
  }

  return null
}

/**
 * Checks whether the property key represents a locale.
 *
 * 'en'
 * 'ru'
 * en
 * en-US
 * pt-BR
 */
function isLocaleKey(node) {
  if (!node) {
    return false
  }

  let value = null

  if (node.type === 'Identifier') {
    value = node.name
  }

  if (node.type === 'Literal') {
    value = node.value
  }

  if (typeof value !== 'string') {
    return false
  }

  return LOCALE_PATTERN.test(value)
}

/**
 * Checks whether a node belongs to a locale object
 * inside an exported translation object.
 *
 * Example:
 *
 * export default {
 *   'en': {
 *     title: 'Delete user'
 *   }
 * }
 *
 * The strings inside "en" are translation values
 * and should not be reported as raw text.
 */
function isInsideTranslationLocale(node) {
  let current = node.parent

  while (current) {
    if (
      current.type === 'Property' &&
      current.parent &&
      current.parent.type === 'ObjectExpression' &&
      current.parent.parent &&
      current.parent.parent.type === 'ExportDefaultDeclaration' &&
      isLocaleKey(current.key)
    ) {
      return true
    }

    current = current.parent
  }

  return false
}

/**
 * Checks whether the variable name
 * represents a user-facing text field.
 */
function isTextVariable(node, options) {
  const variableName = getVariableName(node)

  if (!variableName) {
    return false
  }

  return options.variables.includes(variableName)
}

/**
 * Checks whether the call is an i18n call.
 *
 * t('...')
 * $t('...')
 * i18n.t('...')
 * i18n.$t('...')
 */
function isI18nCall(node, options) {
  if (!node || node.type !== 'CallExpression') {
    return false
  }

  const callee = node.callee

  /**
   * t('...')
   * $t('...')
   */
  if (callee.type === 'Identifier') {
    return options.i18nFunctions.includes(callee.name)
  }

  /**
   * i18n.t('...')
   * i18n.$t('...')
   */
  if (callee.type !== 'MemberExpression') {
    return false
  }

  if (
    callee.object.type !== 'Identifier' ||
    !options.i18nObjects.includes(callee.object.name)
  ) {
    return false
  }

  if (callee.property.type === 'Identifier') {
    return options.i18nFunctions.includes(callee.property.name)
  }

  if (callee.property.type === 'Literal') {
    return options.i18nFunctions.includes(callee.property.value)
  }

  return false
}

/**
 * Checks:
 *
 * t('...')
 * $t('...')
 * i18n.t('...')
 */
function isI18nArgument(node, options) {
  const parent = node.parent

  if (!parent || parent.type !== 'CallExpression') {
    return false
  }

  return isI18nCall(parent, options)
}

/**
 * Checks whether the call uses a configured user-facing function.
 *
 * toast('...')
 * notify('...')
 */
function isConfiguredFunctionCall(node, options) {
  if (!node || node.type !== 'CallExpression') {
    return false
  }

  if (node.callee.type !== 'Identifier') {
    return false
  }

  return options.functions.includes(node.callee.name)
}

/**
 * Checks functions:
 *
 * toast('...')
 * notify('...')
 * alert('...')
 */
function isFunctionArgument(node, options) {
  const parent = node.parent

  if (!parent || parent.type !== 'CallExpression') {
    return false
  }

  return isConfiguredFunctionCall(parent, options)
}

/**
 * Checks:
 *
 * {
 *   title: '...'
 * }
 */
function isPropertyValue(node, options) {
  const parent = node.parent

  if (!parent || parent.type !== 'Property') {
    return false
  }

  const propertyName = getPropertyName(parent)

  return options.properties.includes(propertyName)
}

/**
 * Checks:
 *
 * const title = '...'
 * const message = '...'
 */
function isVariableValue(node, options) {
  const parent = node.parent

  if (!parent || parent.type !== 'VariableDeclarator') {
    return false
  }

  return isTextVariable(parent, options)
}

/**
 * Checks whether a literal is a direct Vue interpolation expression.
 *
 * {{ 'Hello' }}
 */
function isDirectVueExpression(node) {
  const parent = node.parent

  return Boolean(
    parent && parent.type === 'VExpressionContainer',
  )
}

/**
 * Creates an ESLint error.
 */
function report(context, node, text) {
  context.report({
    node,

    messageId: 'rawText',

    data: {
      text: text.trim(),
    },
  })
}

module.exports = {
  meta: {
    type: 'problem',

    docs: {
      description: 'Disallow raw user-facing text without i18n',
      category: 'Best Practices',
      recommended: false,
    },

    schema: [
      {
        type: 'object',

        properties: {
          /**
           * Functions:
           *
           * functions: {
           *   add: ['showNotification'],
           *   remove: ['alert']
           * }
           */
          functions: {
            anyOf: [
              {
                type: 'array',

                items: {
                  type: 'string',
                },
              },

              {
                type: 'object',

                properties: {
                  add: {
                    type: 'array',

                    items: {
                      type: 'string',
                    },
                  },

                  remove: {
                    type: 'array',

                    items: {
                      type: 'string',
                    },
                  },
                },

                additionalProperties: false,
              },
            ],
          },

          /**
           * Properties:
           *
           * properties: {
           *   add: ['tooltip'],
           *   remove: ['description']
           * }
           */
          properties: {
            anyOf: [
              {
                type: 'array',

                items: {
                  type: 'string',
                },
              },

              {
                type: 'object',

                properties: {
                  add: {
                    type: 'array',

                    items: {
                      type: 'string',
                    },
                  },

                  remove: {
                    type: 'array',

                    items: {
                      type: 'string',
                    },
                  },
                },

                additionalProperties: false,
              },
            ],
          },

          /**
           * Variables:
           *
           * variables: {
           *   add: ['heading'],
           *   remove: ['status']
           * }
           */
          variables: {
            anyOf: [
              {
                type: 'array',

                items: {
                  type: 'string',
                },
              },

              {
                type: 'object',

                properties: {
                  add: {
                    type: 'array',

                    items: {
                      type: 'string',
                    },
                  },

                  remove: {
                    type: 'array',

                    items: {
                      type: 'string',
                    },
                  },
                },

                additionalProperties: false,
              },
            ],
          },

          /**
           * Ignored values:
           *
           * ignoredValues: {
           *   add: ['MY_CONSTANT'],
           *   remove: ['123']
           * }
           */
          ignoredValues: {
            anyOf: [
              {
                type: 'array',

                items: {
                  type: 'string',
                },
              },

              {
                type: 'object',

                properties: {
                  add: {
                    type: 'array',

                    items: {
                      type: 'string',
                    },
                  },

                  remove: {
                    type: 'array',

                    items: {
                      type: 'string',
                    },
                  },
                },

                additionalProperties: false,
              },
            ],
          },

          /**
           * i18n functions.
           */
          i18nFunctions: {
            type: 'array',

            items: {
              type: 'string',
            },
          },

          /**
           * i18n objects.
           */
          i18nObjects: {
            type: 'array',

            items: {
              type: 'string',
            },
          },
        },

        additionalProperties: false,
      },
    ],

    messages: {
      rawText: 'Raw text "{{text}}" should use i18n.',
    },
  },

  create(context) {
    const userOptions = context.options[0] || {}

    const options = {
      functions: mergeOptionValues(
        DEFAULT_FUNCTIONS,
        userOptions.functions,
      ),

      properties: mergeOptionValues(
        DEFAULT_PROPERTIES,
        userOptions.properties,
      ),

      variables: mergeOptionValues(
        DEFAULT_VARIABLES,
        userOptions.variables,
      ),

      ignoredValues: mergeOptionValues(
        DEFAULT_IGNORED_VALUES,
        userOptions.ignoredValues,
      ),

      i18nFunctions:
        userOptions.i18nFunctions || DEFAULT_I18N_FUNCTIONS,

      i18nObjects:
        userOptions.i18nObjects || DEFAULT_I18N_OBJECTS,
    }

    /**
     * ========================================================
     * JavaScript / TypeScript
     * ========================================================
     */
    const scriptVisitor = {
      Literal(node) {
        if (typeof node.value !== 'string') {
          return
        }

        const text = node.value

        if (!isTranslatable(text, options)) {
          return
        }

        /**
         * Translation files:
         *
         * export default {
         *   'en': {
         *     title: 'Delete user'
         *   }
         * }
         */
        if (isInsideTranslationLocale(node)) {
          return
        }

        /**
         * t('...')
         * $t('...')
         * i18n.t('...')
         */
        if (isI18nArgument(node, options)) {
          return
        }

        /**
         * toast('...')
         * notify('...')
         */
        if (isFunctionArgument(node, options)) {
          report(context, node, text)

          return
        }

        /**
         * {
         *   title: '...'
         * }
         */
        if (isPropertyValue(node, options)) {
          report(context, node, text)

          return
        }

        /**
         * const title = '...'
         */
        if (isVariableValue(node, options)) {
          report(context, node, text)
        }
      },
    }

    /**
     * ========================================================
     * Vue template
     * ========================================================
     */
    const templateVisitor = {
      /**
       * <button>
       *   Save
       * </button>
       */
      VText(node) {
        const text = node.value

        if (!isTranslatable(text, options)) {
          return
        }

        report(context, node, text)
      },

      /**
       * title="Delete"
       * placeholder="Enter name"
       */
      VAttribute(node) {
        if (!node.value) {
          return
        }

        if (node.value.type !== 'VLiteral') {
          return
        }

        const text = node.value.value

        if (!isTranslatable(text, options)) {
          return
        }

        const name = node.key.name

        if (options.properties.includes(name)) {
          report(context, node.value, text)
        }
      },

      /**
       * Vue expressions.
       *
       * {{ 'qwe' }}
       * {{ toast('qwe') }}
       * {{ t('page.title') }}
       */
      Literal(node) {
        if (typeof node.value !== 'string') {
          return
        }

        const text = node.value

        if (!isTranslatable(text, options)) {
          return
        }

        /**
         * {{ t('page.title') }}
         * {{ i18n.t('page.title') }}
         */
        if (isI18nArgument(node, options)) {
          return
        }

        /**
         * {{ toast('qwe') }}
         * {{ notify('Something went wrong') }}
         */
        if (isFunctionArgument(node, options)) {
          report(context, node, text)

          return
        }

        /**
         * {{ 'qwe' }}
         */
        if (isDirectVueExpression(node)) {
          report(context, node, text)
        }
      },
    }

    /**
     * ========================================================
     * Parser services
     * ========================================================
     */
    const sourceCode = context.getSourceCode()

    const parserServices = sourceCode.parserServices

    /**
     * Vue:
     *
     * <template>
     *   ...
     * </template>
     *
     * +
     *
     * <script>
     *   ...
     * </script>
     */
    if (
      parserServices &&
      typeof parserServices.defineTemplateBodyVisitor === 'function'
    ) {
      return parserServices.defineTemplateBodyVisitor(
        templateVisitor,
        scriptVisitor,
      )
    }

    /**
     * Regular .js / .ts files.
     */
    return scriptVisitor
  },
}