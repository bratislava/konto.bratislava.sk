import KeyvRedis from '@keyv/redis'
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import BaConfigModule from '../config/ba-config.module'
import BaConfigService from '../config/ba-config.service'

/**
 * Redis-based cache module for the application
 *
 * Currently used for:
 * - Nonce-based replay protection in signature authentication
 *
 * Configuration:
 * - Requires REDIS_SERVICE, REDIS_PASSWORD environment variables
 * - REDIS_USER defaults to 'default', REDIS_PORT defaults to 6379
 */
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => {
        const { service, password, user, port } = baConfigService.redis
        // REDIS_USER/REDIS_PORT default to 'default'/6379 when not set.
        const redisUrl = `redis://${user ?? 'default'}:${password}@${service}:${port ?? 6379}`

        return {
          stores: [new KeyvRedis(redisUrl)],
        }
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
