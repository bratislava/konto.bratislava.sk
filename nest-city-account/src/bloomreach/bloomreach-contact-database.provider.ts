import pgPromise, { IDatabase } from 'pg-promise'

const pgp = pgPromise()
let bloomreachContactDatabase: IDatabase<unknown> | undefined

export const getBloomreachContactDatabase = (): IDatabase<unknown> => {
  if (!bloomreachContactDatabase) {
    const bloomreachContactDbPort = process.env.BLOOMREACH_CONTACT_DB_PORT
    bloomreachContactDatabase = pgp({
      host: process.env.BLOOMREACH_CONTACT_DB_HOST,
      port: bloomreachContactDbPort ? Number(bloomreachContactDbPort) : undefined,
      database: process.env.BLOOMREACH_CONTACT_DB_NAME,
      user: process.env.BLOOMREACH_CONTACT_DB_USER,
      password: process.env.BLOOMREACH_CONTACT_DB_PASSWORD,
    })
  }

  return bloomreachContactDatabase
}

export const bloomreachContactDatabaseProvider = {
  provide: 'BLOOMREACH_CONTACT_DB',
  useFactory: getBloomreachContactDatabase,
}
