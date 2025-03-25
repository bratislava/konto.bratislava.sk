import { Global, Module } from '@nestjs/common'

import BaConfigService from './ba-config.service'
import BaConfigSingleton from './ba-config.singleton'

@Global()
@Module({
  providers: [
    {
      provide: BaConfigService,
      useValue: BaConfigSingleton.getInstance(),
    },
  ],
  exports: [BaConfigService],
})
export default class BaConfigModule {}
