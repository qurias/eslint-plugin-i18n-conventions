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

    {
      code: `const title = '{}'`,
    },

    {
      code: `const title = '[]'`,
    },

    {
      code: `
        export default {
          'am-is': {
            title: 'Log out of your account',
            message: 'Are you sure you want to log out?',
          },
        }
      `,
    },

    {
      code: `
        export default {
          'am-is': {
            pages: {
              settings: {
                account: {
                  logout: {
                    title: 'Log out of your account',
                  },
                },
              },
            },
          },
        }
      `,
    },

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

    {
      code: `
        export default {
          'en': {
            auth: {
              logout: {
                title: 'Log out of your account',
                message: 'Are you sure you want to log out?',
              },
            },
          },
        }
      `,
    },

    {
      code: `
        export default {
          'en': {
            pages: {
              settings: {
                sections: {
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
          },
        }
      `,
    },

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

    {
      code: `
        export default {
          'en-US': {
            messages: {
              title: 'Delete user',
            },
          },

          'pt-BR': {
            messages: {
              title: 'Excluir usuário',
            },
          },
        }
      `,
    },
  ],

  invalid: [
    {
      code: `
        const title = 'Delete user'
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

    {
      code: `
        const title = 'Remove user'
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Remove user',
          },
        },
      ],
    },

    {
      code: `
        const message = 'Something went wrong'
      `,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Something went wrong',
          },
        },
      ],
    },

    {
      code: `
        const label = 'Name'
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

    {
      code: `
        const placeholder = 'Enter your name'
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

    {
      code: `
        const title = 'Benutzer löschen'
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

    {
      code: `const title = 'Error'`,

      errors: [
        {
          messageId: 'rawText',

          data: {
            text: 'Error',
          },
        },
      ],
    },

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

  {
    code: `
      const config = {
        en: {
          pages: {
            settings: {
              sections: {
                account: {
                  title: 'Delete user',
                },
              },
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

  {
    code: `
      const config = {
        translations: {
          en: {
            title: 'Delete user',
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

  {
    code: `
      const settings = {
        pages: {
          account: {
            confirmation: {
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
    {
      filename: 'test.vue',

      code: `
        <template>
          <div>
            {{ $t('page.title') }}
          </div>
        </template>
      `,
    },

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
    }
  ],

  invalid: [
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

    {
      filename: 'test.vue',

      code: `
        <template>
          <div>
            Hello, user!
          </div>
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
    
    {
      filename: 'test.vue',

      code: `
        <template>
          <button>
            Benutzer löschen
          </button>
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
  ],
})