import {
  ConsoleInstrumentation,
  ErrorsInstrumentation,
  Faro,
  initializeFaro,
} from '@grafana/faro-web-sdk'
import pino from 'pino'

import { environment } from '@/environment'
import { isBrowser, isProductionDeployment } from '@/frontend/utils/general'

let mutableFaro: Faro | null = null

const sendLogsToFaro = isProductionDeployment()
// logs must be serialized when pushed to faro
const serializeLogs = isProductionDeployment()
const mutableLogger = pino({
  browser: {
    asObject: serializeLogs,
    transmit: sendLogsToFaro
      ? {
          send(_level, logEvent) {
            mutableFaro?.api.pushLog([JSON.stringify(logEvent)])
          },
        }
      : undefined,
  },
})

// no remote logging in local development
if (isBrowser() && environment.nodeEnv === 'production') {
  mutableFaro = initializeFaro({
    url: 'https://faro.bratislava.sk/collect',
    apiKey: environment.faroSecret,
    instrumentations: [new ErrorsInstrumentation(), new ConsoleInstrumentation()],
    app: {
      name: 'city-account-next',
      version: '1.0.0',
      // merges together dev and staging, but we don't care
      environment: isProductionDeployment() ? 'production' : 'staging',
    },
  })
}

// done like this to comply with eslint's import/no-mutable-exports
const logger = mutableLogger
export const faro = mutableFaro

export default logger

export const developmentLog = (message: string, data: object = {}, isError?: boolean) => {
  if (environment.nodeEnv === 'development') {
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
