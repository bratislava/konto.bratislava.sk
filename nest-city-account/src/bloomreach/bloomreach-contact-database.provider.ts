import pgPromise from 'pg-promise'

export const bloomreachContactDatabaseProvider = {
  provide: 'BLOOMREACH_CONTACT_DB',
  useFactory: () => {
    const pgp = pgPromise()
    const bloomreachContactDbPort = process.env.BLOOMREACH_CONTACT_DB_PORT
    return pgp({
      host: process.env.BLOOMREACH_CONTACT_DB_HOST,
      port: bloomreachContactDbPort ? Number(bloomreachContactDbPort) : undefined,
      database: process.env.BLOOMREACH_CONTACT_DB_NAME,
      user: process.env.BLOOMREACH_CONTACT_DB_USER,
      password: process.env.BLOOMREACH_CONTACT_DB_PASSWORD,
    })
  },
}
