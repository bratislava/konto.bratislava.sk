import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import getBaConfigInstance from './ba-config.instance'
import BaConfigService from './ba-config.service'

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: BaConfigService,
      useValue: getBaConfigInstance(),
    },
  ],
  exports: [BaConfigService],
})
export default class BaConfigModule {}
