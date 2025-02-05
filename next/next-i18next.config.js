/** @type {{i18n: import('next').I18NConfig, reloadOnPrerender: boolean}} */
module.exports = {
  i18n: {
    defaultLocale: 'sk',
    locales: ['sk'],
    localeDetection: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
