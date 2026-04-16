import KeyvRedis from '@keyv/redis'
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

/**
 * Redis-based cache module for the application
 *
 * Currently used for:
 * - Nonce-based replay protection in signature authentication
 *
 * Configuration:
 * - Requires REDIS_SERVICE, REDIS_USER, REDIS_PASSWORD environment variables
 * - REDIS_PORT defaults to 6379
 */
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const service = configService.get<string>('REDIS_SERVICE')
        const password = configService.get<string>('REDIS_PASSWORD')
        const user = configService.get<string>('REDIS_USER', 'default')
        const port = configService.get<number>('REDIS_PORT', 6379)

        if (!service || !password) {
          throw new Error(
            'REDIS_SERVICE and REDIS_PASSWORD must be configured. Required for nonce-based replay protection in signature authentication.'
          )
        }

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
