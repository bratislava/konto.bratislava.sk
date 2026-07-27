'use strict'

/**
 * Backfills `is_temporarily_disabled` to `false` for all existing forms.
 *
 * The `isTemporarilyDisabled` attribute was added to the form content type
 * (strapi/src/api/form/content-types/form/schema.json). The attribute has a
 * default of `false`, so Strapi's schema sync already backfills the column when
 * it is created; this migration is an explicit safeguard for any rows that were
 * left with a `NULL` value.
 *
 * https://docs.strapi.io/cms/database-migrations
 */
module.exports = {
  async up(knex) {
    const hasColumn = await knex.schema.hasColumn('forms', 'is_temporarily_disabled')
    if (!hasColumn) {
      return
    }

    await knex('forms')
      .whereNull('is_temporarily_disabled')
      .update({ is_temporarily_disabled: false })
  },

  async down() {
    // No-op: setting the flag to `false` is the safe default state, nothing to revert.
  },
}
