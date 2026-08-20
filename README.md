# eslint-plugin-i18n-conventions

ESLint plugin for enforcing project-specific i18n conventions in JavaScript, TypeScript, and Vue 3 projects.

The plugin detects user-facing text that is written directly in source code instead of using i18n. It can be configured to match the conventions and architecture of an existing project.

## Features

- Detects raw user-facing text in JavaScript and TypeScript
- Detects raw text in Vue 3 templates
- Detects raw text in `<script>` and `<script setup>` blocks inside `.vue` files
- Supports custom functions such as `toast()`, `notify()`, and `alert()`
- Supports custom text properties such as `title`, `message`, `label`, and `placeholder`
- Supports custom variable names
- Supports custom i18n functions such as `t()` and `$t()`
- Supports custom i18n objects such as `i18n.t()`
- Allows adding and removing default functions, properties, variables, and ignored values
- Ignores empty strings, technical values, symbols, and numbers
- Supports translation files with locale objects such as `en`, `ru`, `en-US`, `pt-BR`, and `am-is`
- Supports deeply nested translation objects
- Provides a recommended ESLint configuration

## Supported

- JavaScript
- TypeScript
- Vue 3
- `.vue` templates
- `<script>` and `<script setup>` inside `.vue`
- ESLint 8

## Installation

Install the plugin as a development dependency:

```bash
npm install -D eslint-plugin-i18n-conventions
```

## Configuration

### Recommended configuration

For a classic ESLint configuration:

```js
module.exports = {
  extends: [
    'plugin:i18n-conventions/recommended',
  ],
}
```

The recommended configuration enables:

```text
i18n-conventions/no-raw-text
```

with `error` severity.

### Manual configuration

You can also configure the rule manually:

```js
module.exports = {
  plugins: [
    'i18n-conventions',
  ],

  rules: {
    'i18n-conventions/no-raw-text': 'error',
  },
}
```

## Rule: `no-raw-text`

The `no-raw-text` rule detects user-facing text that is written directly in source code and should be handled through i18n.

### Invalid

```js
const title = 'Delete user'
```

```js
const message = 'Something went wrong'
```

```js
const label = 'Name'
```

```js
const placeholder = 'Enter your name'
```

```js
const config = {
  title: 'Delete user',
}
```

```js
toast('Delete user')
```

```js
notify('Something went wrong')
```

### Valid

Text passed through an i18n function is ignored:

```js
const title = t('user.delete')
```

```js
const title = $t('user.delete')
```

```js
const title = i18n.t('user.delete')
```

Technical values and values without letters are ignored:

```js
const value = '123'
```

```js
const value = '100%'
```

```js
const value = '№'
```

```js
const value = '---'
```

```js
const value = '...'
```

```js
const value = '→'
```

## Vue support

The rule checks text directly written in Vue templates.

### Invalid

```vue
<template>
  <button>Delete user</button>
</template>
```

```vue
<template>
  <span>Something went wrong</span>
</template>
```

It also checks configured attributes:

```vue
<template>
  <input placeholder="Enter your name">
</template>
```

### Valid

```vue
<template>
  <button>{{ $t('user.delete') }}</button>
</template>
```

```vue
<template>
  <input :placeholder="$t('user.enterName')">
</template>
```

## JavaScript inside Vue

The rule also checks `<script>` and `<script setup>` blocks.

### Invalid

```vue
<script setup>
const title = 'Delete user'
</script>
```

### Valid

```vue
<script setup>
const title = t('user.delete')
</script>
```

## Translation files

Translation values inside locale objects are not considered raw text.

For example:

```js
export default {
  en: {
    auth: {
      login: 'Login',
      logout: 'Log out',
    },
  },

  ru: {
    auth: {
      login: 'Войти',
      logout: 'Выйти',
    },
  },
}
```

The translation values are ignored because they belong to locale objects.

Deeply nested translation objects are also supported:

```js
export default {
  en: {
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
```

Locale names with language and region variants are supported:

```js
export default {
  en: {},
  ru: {},
  en-US: {},
  en-GB: {},
  pt-BR: {},
  zh-CN: {},
  am-is: {},
}
```

## Configuration options

The rule supports configuration for project-specific i18n conventions.

Default functions, properties, variables, and ignored values can be extended or removed using `add` and `remove`.

```js
module.exports = {
  rules: {
    'i18n-conventions/no-raw-text': [
      'error',
      {
        functions: {
          add: ['showNotification'],
          remove: ['alert'],
        },

        properties: {
          add: ['tooltip'],
          remove: ['description'],
        },

        variables: {
          add: ['heading'],
          remove: ['status'],
        },

        ignoredValues: {
          add: ['MY_TECHNICAL_VALUE'],
          remove: ['123'],
        },

        i18nFunctions: [
          't',
          '$t',
        ],

        i18nObjects: [
          'i18n',
        ],
      },
    ],
  },
}
```

### `functions`

Defines functions whose string arguments should be considered user-facing text.

Default values are preserved unless explicitly removed.

```js
functions: {
  add: ['showNotification'],
  remove: ['alert'],
}
```

This means:

- `showNotification()` is added to the default list;
- `alert()` is removed from the default list.

For example:

```js
showNotification('Something went wrong')
```

will be reported.

### `properties`

Defines object properties whose values should be considered user-facing text.

```js
properties: {
  add: ['tooltip'],
  remove: ['description'],
}
```

For example:

```js
const config = {
  tooltip: 'Delete user',
}
```

### `variables`

Defines variable names whose values should be considered user-facing text.

```js
variables: {
  add: ['heading'],
  remove: ['status'],
}
```

For example:

```js
const heading = 'Delete user'
```

### `ignoredValues`

Defines values that should not be reported by the rule.

```js
ignoredValues: {
  add: ['MY_TECHNICAL_VALUE'],
  remove: ['123'],
}
```

This option can be used for project-specific technical values.

### `i18nFunctions`

Defines functions that represent i18n calls.

```js
i18nFunctions: [
  't',
  '$t',
]
```

For example:

```js
t('user.delete')
$t('user.delete')
```

### `i18nObjects`

Defines objects that represent i18n instances.

```js
i18nObjects: [
  'i18n',
]
```

For example:

```js
i18n.t('user.delete')
i18n.$t('user.delete')
```

## Backward compatibility

For `functions`, `properties`, `variables`, and `ignoredValues`, an array can also be provided instead of an `add`/`remove` object.

```js
module.exports = {
  rules: {
    'i18n-conventions/no-raw-text': [
      'error',
      {
        functions: [
          'toast',
          'notify',
        ],
      },
    ],
  },
}
```

When an array is provided, it completely replaces the corresponding default values.

## Ignored values

The rule automatically ignores:

- empty strings;
- configured technical values;
- strings that contain no letters.

For example:

```js
'123'
'100%'
'№'
'---'
'...'
'→'
'()'
'[]'
'{}'
```

However, a value containing letters is still considered text:

```js
'Error №'
'№ document'
'100% complete'
'(Delete user)'
```

## ESLint script

A typical project configuration can use:

If the project uses `.eslintignore` instead of `.gitignore`, use the corresponding ESLint configuration for that setup.

```json
{
  "scripts": {
    "lint": "eslint . --ext .vue,.js,.ts --ignore-path .gitignore",
    "lint:fix": "eslint . --ext .vue,.js,.ts --fix --ignore-path .gitignore"
  }
}
```

Run the check with:

```bash
npm run lint
```

## Example

Given:

```js
const title = 'Delete user'

const message = t('user.delete')

const value = '123'
```

ESLint reports:

```text
Raw text "Delete user" should use i18n.
```

The following values are ignored:

```js
const message = t('user.delete')
const value = '123'
```

## Why use this plugin?

The plugin is designed for projects with their own i18n conventions.

Instead of treating every string literal as user-facing text, the rule analyzes the context in which a string is used.

It can detect user-facing text in:

- text variables;
- object properties;
- notification and UI functions;
- Vue template text;
- Vue attributes;
- project-specific i18n functions and objects.

The rule can also be adapted to an existing codebase by adding or removing default functions, properties, variables, and ignored values.

This helps detect real localization issues while reducing false positives from technical values, identifiers, numbers, and symbols.

## Requirements

- Node.js
- ESLint 8
- Vue 3 for Vue template support

## License

MIT
