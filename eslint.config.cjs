const airbnbBase = require('eslint-config-airbnb-base');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    files: ['**/*.js'], // Применяется ко всем JavaScript-файлам
    languageOptions: {
      ecmaVersion: 'latest', // Использовать последнюю версию ECMAScript
      sourceType: 'module', // Указать, что используется модульный код
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
      },
    },
    plugins: {
      import: importPlugin, // Подключение плагина import
    },
    rules: {
      ...airbnbBase.rules, // Подключение правил airbnb-base
      'no-console': 'off', // Разрешить использование console.log
      'func-names': 'off', // Отключить требование именования функций
      quotes: ['error', 'single'], // Требовать использование одинарных кавычек
      semi: ['error', 'always'], // Требовать точки с запятой
      'no-unused-vars': ['warn'], // Предупреждать о неиспользуемых переменных
      indent: ['error', 2], // Отступы в 2 пробела
      'no-var': 'error', // Запретить использование var
      'linebreak-style': ['error', 'unix'], // Использовать Unix-стиль перевода строк
      'keyword-spacing': ['error', { before: true, after: true }], // Пробелы вокруг ключевых слов
      'no-restricted-globals': 'off', // Отключить запрет на использование глобальных переменных
      'no-alert': 'off', // Разрешить использование alert
      'no-plusplus': 'off', // Разрешить использование ++
      'import/no-extraneous-dependencies': 'off', // Отключить проверку зависимостей из devDependencies
    },
  },
];
