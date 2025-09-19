module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'prettier',
    ],
    rules: {
      'react/react-in-jsx-scope': 'off', // If you're using a modern React setup
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };
  