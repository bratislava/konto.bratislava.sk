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
 * - Requires REDIS_SERVICE, REDIS_USER, REDIS_PASSWORD, REDIS_PORT environment variables
 */
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => {
        const { service, password, user, port } = baConfigService.redis
        const redisUrl = `redis://${user}:${password}@${service}:${port}`

        return {
          stores: [new KeyvRedis(redisUrl)],
        }
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
