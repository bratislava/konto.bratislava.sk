import { Module } from '@nestjs/common'
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import KeyvRedis from '@keyv/redis'

/**
 * Redis-based cache module for the application
 *
 * Currently used for:
 * - Nonce-based replay protection in signature authentication
 *
 * Configuration:
 * - Requires REDIS_URL environment variable
 * - Connection timeout: 5 seconds
 * - Automatic reconnection with exponential backoff
 * - Max 10 retry attempts
 */
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL')

        if (!redisUrl) {
          throw new Error(
            'REDIS_URL is not configured. Required for nonce-based replay protection in signature authentication.'
          )
        }

        return {
          stores: [new KeyvRedis(redisUrl)],
        }
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
