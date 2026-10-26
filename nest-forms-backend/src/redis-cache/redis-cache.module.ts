import KeyvRedis from '@keyv/redis'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import BaConfigService from '../config/ba-config.service'

/**
 * Redis-backed `CACHE_MANAGER` (same Redis and credentials as the Bull queues in `AppSharedModule`).
 *
 * Callers must treat the cache as optional: Redis errors surface as rejected or slow cache calls, which callers should
 * turn into a miss (see `SignatureVerdictCache`). `disableOfflineQueue` makes commands fail immediately while Redis is
 * disconnected instead of piling up until it reconnects.
 */
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
