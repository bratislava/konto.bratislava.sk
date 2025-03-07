import { Global, Module } from '@nestjs/common'

import { BaConfig } from './baConfig'
import { BaConfigSingleton } from './config.instance'

@Global()
@Module({
  providers: [
    {
      provide: BaConfig,
      useValue: BaConfigSingleton.getInstance(),
    },
  ],
  exports: [BaConfig],
})
export default class BaConfigModule {}
