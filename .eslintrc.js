/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next'],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
  rules: {
    'react/no-unescaped-entities': [
      'error',
      {
        forbid: [
          {
            char: '>',
            alternatives: ['&gt;']
          },
          {
            char: '}',
            alternatives: ['&#125;']
          },
          {
            char: '"',
            alternatives: ['&quot;', '&ldquo;', '&#34;', '&rdquo;']
          },
          {
            char: "'",
            alternatives: ['&apos;', '&lsquo;', '&#39;', '&rsquo;']
          }
        ]
      }
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
