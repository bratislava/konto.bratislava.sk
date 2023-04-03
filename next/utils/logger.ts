import {
  ConsoleInstrumentation,
  ErrorsInstrumentation,
  Faro,
  initializeFaro,
} from '@grafana/faro-web-sdk'
import { ILogObj, Logger } from 'tslog'

import { isBrowser, isProductionDeployment } from './utils'

let _logger: Logger<ILogObj>
let _faro: Faro

if (isBrowser()) {
  _logger = new Logger({ type: isProductionDeployment() ? 'hidden' : 'pretty' })
  // no remote logging in local development
  if (process.env.NODE_ENV !== 'production') {
    _faro = initializeFaro({
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
    _logger.attachTransport((logObj) => {
      _faro.api.pushLog([JSON.stringify(logObj)])
    })
  }
} else {
  _logger = new Logger({ type: isProductionDeployment() ? 'json' : 'pretty' })
}

// done like this to comply with eslint's import/no-mutable-exports
const logger = _logger
export const faro = _faro

export default logger
