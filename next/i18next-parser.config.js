// Docs: https://github.com/i18next/i18next-parser?tab=readme-ov-file#options
module.exports = {
  locales: ['sk'], // this should be in sync with next-i18next.config.js - TODO get it from one place?
  input: './{components,pages,frontend}/**/*.{tsx,ts}',
  output: './public/locales/$LOCALE/$NAMESPACE.json',
  // if set to true preserves old values in a separate json file
  createOldCatalogs: false,
  sort: true,
  // makes the translation json file flat
  keySeparator: false,
  // Translations in account forms (registration, login...) are thrown away during parsing. This is quick fix, how to keep them.
  keepRemoved: [
    /^(?:account:)?auth\.fields\.[^.]+_(format|required)$/,
    /^account:correspondence_address_change\.fields\.(street_address|locality|postal_code)_(format|required)$/,
  ],
}
