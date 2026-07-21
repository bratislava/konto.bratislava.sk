import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import BaConfigModule from './config/ba-config.module'
import BaConfigService from './config/ba-config.service'
import FormValidatorRegistryModule from './form-validator-registry/form-validator-registry.module'
import { MinioClientModule } from './minio-client/minio-client.module'
import PrismaModule from './prisma/prisma.module'
import AppLoggerMiddleware from './utils/middlewares/logger.service'

@Module({
  imports: [
    BaConfigModule,
    MinioClientModule,
    PrismaModule,
    FormValidatorRegistryModule,
    BullModule.forRootAsync({
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => ({
        redis: {
          host: baConfigService.redis.service,
          port: baConfigService.redis.port,
          username: 'default',
          password: baConfigService.redis.password,
        },
      }),
    }),
    ScheduleModule.forRoot(),
  ],
  exports: [BaConfigModule, PrismaModule, FormValidatorRegistryModule],
})
export class AppSharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
