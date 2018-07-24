module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/attribute-hyphenation': [
      'error',
      'always'
    ],
    'vue/html-end-tags': 'error',
    'vue/html-quotes': [
      'error',
      'double'
    ],
    'vue/html-indent': [
      'error',
      2
    ]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}