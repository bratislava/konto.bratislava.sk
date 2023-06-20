import {
  ConsoleInstrumentation,
  ErrorsInstrumentation,
  Faro,
  initializeFaro,
} from '@grafana/faro-web-sdk'
import { ILogObj, Logger } from 'tslog'

import { isBrowser, isProductionDeployment } from './general'

let mutableLogger: Logger<ILogObj>
let mutableFaro: Faro | null = null

if (isBrowser()) {
  mutableLogger = new Logger({ type: isProductionDeployment() ? 'hidden' : 'pretty' })
  // no remote logging in local development
  if (process.env.NODE_ENV === 'production') {
    mutableFaro = initializeFaro({
      url: 'https://faro.bratislava.sk/collect',
      apiKey: process.env.NEXT_PUBLIC_FARO_SECRET,
      instrumentations: [new ErrorsInstrumentation(), new ConsoleInstrumentation()],
      app: {
        name: 'city-account-next',
        version: '1.0.0',
        // merges together dev and staging, but we don't care
        environment: isProductionDeployment() ? 'production' : 'staging',
      },
    })
    mutableLogger.attachTransport((logObj) => {
      mutableFaro?.api.pushLog([JSON.stringify(logObj)])
    })
  }
} else {
  mutableLogger = new Logger({ type: isProductionDeployment() ? 'json' : 'pretty' })
}

// done like this to comply with eslint's import/no-mutable-exports
const logger = mutableLogger
export const faro = mutableFaro

export default logger

export const developmentLog = (
  message: string,
  data: Record<string, unknown> = {},
  isError?: boolean,
) => {
  if (process.env.NODE_ENV === 'development') {
    let dataString = ''
    Object.entries(data).forEach(([key, value]: [string, unknown]) => {
      dataString += `\n${key}: ${String(value)}`
    })
    if (isError) {
      logger.error(`\n${message}:`, dataString)
    } else {
      logger.info(`\n${message}:`, dataString)
    }
  }
}
