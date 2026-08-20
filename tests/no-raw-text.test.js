'use strict'

const { RuleTester } = require('eslint')
const rule = require('../rules/no-raw-text')

/**
 * ============================================================
 * JavaScript
 * ============================================================
 */

const jsRuleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

jsRuleTester.run('no-raw-text', rule, {
  valid: [
    /**
     * Symbols and numbers
     */
    {
      code: `const title = '№'`,
    },

    {
      code: `const title = '123'`,
    },

    {
      code: `const title = '100%'`,
    },

    {
      code: `const title = '---'`,
    },

    {
      code: `const title = '...'`,
    },

    {
      code: `const title = '→'`,
    },

    {
      code: `const title = '()'`,
    },

    /**
     * i18n functions
     */
    {
      code: `const title = t('page.title')`,
    },

    {
      code: `const title = $t('page.title')`,
    },

    {
      code: `const title = i18n.t('page.title')`,
    },

    /**
     * Translation object
     */
    {
      code: `
        export default {
          'en': {
            title: 'Log out of your account',
            message: 'Are you sure you want to log out?',
            authorization: 'Authorization',
          },
        }
      `,
    },

    /**
     * Deep translation object
     */
    {
      code: `
        export default {
          'en': {
            pages: {
              settings: {
                account: {
                  logout: {
                    confirmation: {
                      title: 'Log out of your account',
                      message: 'Are you sure you want to log out?',
                    },
                  },
                },
              },
            },
          },
        }
      `,
    },

    /**
     * Multiple locales
     */
    {
      code: `
        export default {
          'en': {
            user: {
              profile: {
                title: 'User profile',
              },
            },
          },

          'ru': {
            user: {
              profile: {
                title: 'Профиль пользователя',
              },
            },
          },
        }
      `,
    },

    /**
     * Locales with hyphen
     */
    {
      code: `
        export default {
          'en-US': {
            messages: {
              title: 'Delete user',
            },
          },

          'am-is': {
            messages: {
              title: 'Delete user',
            },
          },
        }
      `,
    },

    /**
     * Remove default variable
     */
    {
      code: `
        const title = 'Delete user'
      `,

      options: [
        {
          variables: {
            remove: ['title'],
          },
        },
      ],
    },

    /**
     * Remove default property
     */
    {
      code: `
        const config = {
          label: 'Name',
        }
      `,

      options: [
        {
          properties: {
            remove: ['label'],
          },
        },
      ],
    },

    /**
     * Add custom ignored value
     */
    {
      code: `
        const value = 'MY_TECHNICAL_VALUE'
      `,

      options: [
        {
          variables: {
            add: ['value'],
          },

          ignoredValues: {
            add: ['MY_TECHNICAL_VALUE'],
          },
        },
      ],
    },
  ],

  invalid: [
    /**
     * Default variable
     */
    {
      code: `const title = 'Delete user'`,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Delete user',
          },
        },
      ],
    },

    /**
     * Default variable
     */
    {
      code: `const message = 'Something went wrong'`,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Something went wrong',
          },
        },
      ],
    },

    /**
     * Default property
     */
    {
      code: `
        const config = {
          label: 'Name',
        }
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Name',
          },
        },
      ],
    },

    /**
     * Default property
     */
    {
      code: `
        const config = {
          placeholder: 'Enter your name',
        }
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Enter your name',
          },
        },
      ],
    },

    /**
     * Text with symbols
     */
    {
      code: `const title = 'Error №'`,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Error №',
          },
        },
      ],
    },

    {
      code: `const title = '№ document'`,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: '№ document',
          },
        },
      ],
    },

    /**
     * Ordinary object with locale-like key.
     * It must still be checked.
     */
    {
      code: `
        const config = {
          en: {
            title: 'Delete user',
          },
        }
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Delete user',
          },
        },
      ],
    },

    /**
     * Deep ordinary object.
     * It must still be checked.
     */
    {
      code: `
        const config = {
          en: {
            pages: {
              settings: {
                title: 'Delete user',
              },
            },
          },
        }
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Delete user',
          },
        },
      ],
    },

    /**
     * Add custom variable
     */
    {
      code: `const heading = 'Delete user'`,

      options: [
        {
          variables: {
            add: ['heading'],
          },
        },
      ],

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Delete user',
          },
        },
      ],
    },

    /**
     * Add custom property
     */
    {
      code: `
        const config = {
          tooltip: 'Delete user',
        }
      `,

      options: [
        {
          properties: {
            add: ['tooltip'],
          },
        },
      ],

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Delete user',
          },
        },
      ],
    },

    /**
     * Add custom function
     */
    {
      code: `showNotification('Something went wrong')`,

      options: [
        {
          functions: {
            add: ['showNotification'],
          },
        },
      ],

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Something went wrong',
          },
        },
      ],
    },
  ],
})

/**
 * ============================================================
 * Vue
 * ============================================================
 */

const vueRuleTester = new RuleTester({
  parser: require.resolve('vue-eslint-parser'),

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

vueRuleTester.run('no-raw-text/vue', rule, {
  valid: [
    /**
     * i18n in template
     */
    {
      filename: 'test.vue',

      code: `
        <template>
          <div>{{ $t('page.title') }}</div>
        </template>
      `,
    },

    /**
     * Symbols
     */
    {
      filename: 'test.vue',

      code: `
        <template>
          <div>№</div>
        </template>
      `,
    },

    {
      filename: 'test.vue',

      code: `
        <template>
          <div>→</div>
        </template>
      `,
    },

    /**
     * i18n in script setup
     */
    {
      filename: 'test.vue',

      code: `
        <script setup>
          const title = t('page.title')
        </script>
      `,
    },
  ],

  invalid: [
    /**
     * Raw template text
     */
    {
      filename: 'test.vue',

      code: `
        <template>
          <div>Hello, user!</div>
        </template>
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Hello, user!',
          },
        },
      ],
    },

    /**
     * Text containing a symbol
     */
    {
      filename: 'test.vue',

      code: `
        <template>
          <div>№ document</div>
        </template>
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: '№ document',
          },
        },
      ],
    },

    /**
     * Raw text in another language
     */
    {
      filename: 'test.vue',

      code: `
        <template>
          <button>Benutzer löschen</button>
        </template>
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Benutzer löschen',
          },
        },
      ],
    },

    /**
     * Raw text in script setup
     */
    {
      filename: 'test.vue',

      code: `
        <script setup>
          const title = 'Delete user'
        </script>
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Delete user',
          },
        },
      ],
    },
  ],
})