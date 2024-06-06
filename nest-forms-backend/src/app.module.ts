import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { MinioModule } from 'nestjs-minio-client'

import AdminModule from './admin/admin.module'
import AppController from './app.controller'
import AppService from './app.service'
import AuthModule from './auth/auth.module'
import ConvertModule from './convert/convert.module'
import ConvertPdfModule from './convert-pdf/convert-pdf.module'
import FilesModule from './files/files.module'
import FormsModule from './forms/forms.module'
import GinisModule from './ginis/ginis.module'
import NasesModule from './nases/nases.module'
import NasesConsumerModule from './nases-consumer/nases-consumer.module'
import PrismaModule from './prisma/prisma.module'
import RabbitmqClientModule from './rabbitmq-client/rabbitmq-client.module'
import StatusModule from './status/status.module'
import TaxModule from './tax/tax.module'
import AppLoggerMiddleware from './utils/middlewares/logger.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MinioModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        endPoint: <string>configService.get('MINIO_ENDPOINT') ?? '',
        port: parseInt(<string>configService.get('MINIO_PORT') ?? '', 10),
        useSSL: configService.get('MINIO_USE_SSL') === 'true',
        accessKey: <string>configService.get('MINIO_ACCESS_KEY') ?? '',
        secretKey: <string>configService.get('MINIO_SECRET_KEY') ?? '',
      }),
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    FormsModule,
    FilesModule,
    NasesModule,
    StatusModule,
    RabbitmqClientModule,
    NasesConsumerModule,
    ConvertModule,
    ConvertPdfModule,
    GinisModule,
    TaxModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export default class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
