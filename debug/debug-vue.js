'use strict'

const parser = require('vue-eslint-parser')

const result = parser.parseForESLint(
  `
    <template>
      <div>
        Hello, user!
      </div>
    </template>
  `,
  {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
)

function print(node, level = 0) {
  if (!node || typeof node !== 'object') {
    return
  }

  if (node.type) {
    console.log(
      `${' '.repeat(level * 2)}${node.type}`,
      node.value ? JSON.stringify(node.value) : '',
    )
  }

  if (node.children) {
    node.children.forEach((child) => {
      print(child, level + 1)
    })
  }
}

print(result.ast.templateBody)