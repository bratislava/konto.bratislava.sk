import pgPromise, { IDatabase } from 'pg-promise'

import getBaConfigInstance from '../../config/ba-config.instance'

const pgp = pgPromise()
let bloomreachContactDatabase: IDatabase<unknown> | undefined

export const getBloomreachContactDatabase = (): IDatabase<unknown> => {
  if (!bloomreachContactDatabase) {
    bloomreachContactDatabase = pgp(getBaConfigInstance().bloomreachContactDatabase)
  }

  return bloomreachContactDatabase
}

export const bloomreachContactDatabaseProvider = {
  provide: 'BLOOMREACH_CONTACT_DB',
  useFactory: getBloomreachContactDatabase,
}
