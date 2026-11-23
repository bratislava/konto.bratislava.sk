import { ConnectionPool } from 'mssql'

import getBaConfigInstance from '../../src/config/ba-config.instance'

export async function connectToNoris(): Promise<ConnectionPool> {
  const { host, port, database, username, password } =
    getBaConfigInstance().noris
  return new ConnectionPool({
    server: host,
    port,
    database,
    user: username,
    password,
    options: { encrypt: false, trustServerCertificate: true },
  }).connect()
}
