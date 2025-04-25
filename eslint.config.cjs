const airbnbBase = require('eslint-config-airbnb-base');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    files: ['**/*.js'], // Применяется ко всем JavaScript-файлам
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      import: importPlugin, // Подключение плагина import
    },
    rules: {
      ...airbnbBase.rules, // Подключение правил airbnb-base
      'import/no-unresolved': 'error', // Пример правила из плагина import
      'no-console': 'off', // Разрешить использование консоли
      'func-names': 'off', // Отключить требование именования функций
      quotes: ['error', 'single'], // Требовать использование одинарных кавычек
      semi: ['error', 'always'], // Требовать точки с запятой
      'no-unused-vars': ['warn'], // Запретить неиспользуемые переменные
      indent: ['error', 2], // Отступы в 2 пробела
      'no-var': 'error', // Запретить использование var
      'linebreak-style': ['error', 'unix'], // Запретить использование неявного приведения типов
      'keyword-spacing': ['error', { before: true, after: true }], // Пробелы вокруг ключевых слов
      'no-restricted-globals': 'off', // Пробелы вокруг операторов
      'no-alert': 'off', // Разрешить использование alert
      'no-plusplus': 'off', // Разрешить использование ++
      'import/no-extraneous-dependencies': 'off', // Отключить проверку на использование зависимостей из devDependencies
    },
  },
];
