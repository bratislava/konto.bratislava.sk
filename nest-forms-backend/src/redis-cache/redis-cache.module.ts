import KeyvRedis from '@keyv/redis'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import BaConfigService from '../config/ba-config.service'

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => ({
        stores: [
          new KeyvRedis({
            socket: {
              host: baConfigService.redis.service,
              port: baConfigService.redis.port,
            },
            username: 'default',
            password: baConfigService.redis.password,
            disableOfflineQueue: true,
          }),
        ],
      }),
    }),
  ],
  exports: [CacheModule],
})
export default class RedisCacheModule {}
