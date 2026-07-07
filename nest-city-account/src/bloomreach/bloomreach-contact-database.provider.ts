import pgPromise, { IDatabase } from 'pg-promise'

import getBaConfigInstance from '../config/ba-config.instance'

const pgp = pgPromise()
let bloomreachContactDatabase: IDatabase<unknown> | undefined

export const getBloomreachContactDatabase = (): IDatabase<unknown> => {
  if (!bloomreachContactDatabase) {
    const { host, port, name, user, password } = getBaConfigInstance().bloomreachContactDatabase
    bloomreachContactDatabase = pgp({
      host,
      port,
      database: name,
      user,
      password,
    })
  }

  return bloomreachContactDatabase
}

export const bloomreachContactDatabaseProvider = {
  provide: 'BLOOMREACH_CONTACT_DB',
  useFactory: getBloomreachContactDatabase,
}
