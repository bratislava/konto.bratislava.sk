import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { MinioModule } from 'nestjs-minio-client'

import BaConfigModule from './config/ba-config.module'
import BaConfigService from './config/ba-config.service'
import FormValidatorRegistryModule from './form-validator-registry/form-validator-registry.module'
import PrismaModule from './prisma/prisma.module'
import AppLoggerMiddleware from './utils/middlewares/logger.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BaConfigModule,
    MinioModule.registerAsync({
      isGlobal: true,
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => ({
        endPoint: baConfigService.minio.endpoint,
        port: baConfigService.minio.port,
        useSSL: baConfigService.minio.useSSL,
        accessKey: baConfigService.minio.accessKey,
        secretKey: baConfigService.minio.secretKey,
      }),
    }),
    PrismaModule,
    FormValidatorRegistryModule,
    BullModule.forRootAsync({
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: async (baConfigService: BaConfigService) => ({
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
