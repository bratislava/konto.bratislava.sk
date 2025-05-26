import { runApp } from './app'
import BaConfigService from './config/ba-config.service'

async function bootstrap() {
  const appInstance = await runApp({})

  const baConfigService = appInstance.get(BaConfigService)

  await appInstance.listen(baConfigService.self.port)
  // eslint-disable-next-line no-console
  console.log(`Nest is running on port: ${baConfigService.self.port}`)
}

// eslint-disable-next-line unicorn/prefer-top-level-await
bootstrap()
