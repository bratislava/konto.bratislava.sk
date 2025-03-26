import { Global, Module } from '@nestjs/common'

import getBaConfigInstance from './ba-config.instance'
import BaConfigService from './ba-config.service'

@Global()
@Module({
  providers: [
    {
      provide: BaConfigService,
      useValue: getBaConfigInstance(),
    },
  ],
  exports: [BaConfigService],
})
export default class BaConfigModule {}
