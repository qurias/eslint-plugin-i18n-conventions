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
 * Locale names supported by translation files.
 *
 * Examples:
 *  en
 *  ru
 *  de
 *  am
 *  am-is
 *  en-US
 *  en-us
 *  pt-BR
 *  pt-br
 *  zh-CN
 *  zh-cn
 *  zh-Hans
 *  zh-hant
 */
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[a-z]{2,4})?$/i

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
 * Checks whether the property key
 * represents a locale.
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
 *   },
 *
 *   'ru': {
 *     title: 'Удалить пользователя'
 *   }
 * }
 *
 * The strings inside "en" and "ru" are translation values
 * and should not be reported as raw text.
 */
function isInsideTranslationLocale(node) {
  let current = node.parent

  while (current) {
    /**
     * We are looking for:
     *
     * 'en': {
     *   ...
     * }
     *
     * where the locale property belongs directly
     * to the exported object.
     */
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

  const callee = parent.callee

  if (callee.type !== 'Identifier') {
    return false
  }

  return options.functions.includes(callee.name)
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
           * toast('...')
           * notify('...')
           */
          functions: {
            type: 'array',

            items: {
              type: 'string',
            },
          },

          /**
           * Properties:
           *
           * title: '...'
           * message: '...'
           */
          properties: {
            type: 'array',

            items: {
              type: 'string',
            },
          },

          /**
           * Variables:
           *
           * const title = '...'
           * const message = '...'
           */
          variables: {
            type: 'array',

            items: {
              type: 'string',
            },
          },

          /**
           * Ignored values.
           */
          ignoredValues: {
            type: 'array',

            items: {
              type: 'string',
            },
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
      functions: userOptions.functions || DEFAULT_FUNCTIONS,

      properties: userOptions.properties || DEFAULT_PROPERTIES,

      variables: userOptions.variables || DEFAULT_VARIABLES,

      ignoredValues:
        userOptions.ignoredValues || DEFAULT_IGNORED_VALUES,

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
      /**
       * Regular string literals.
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
         * Translation files:
         *
         * export default {
         *   'en': {
         *     title: 'Delete user'
         *   }
         * }
         *
         * These strings are already translation values.
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