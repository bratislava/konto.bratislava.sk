import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import AdminModule from './admin/admin.module'
import AppController from './app.controller'
import AppService from './app.service'
import { AppSharedModule } from './app-shared.module'
import { AppV2Module } from './app-v2.module'
import AuthModule from './auth/auth.module'
import { AuthV2Module } from './auth-v2/auth-v2.module'
import ConvertModule from './convert/convert.module'
import ConvertPdfModule from './convert-pdf/convert-pdf.module'
import FilesModule from './files/files.module'
import FormsModule from './forms/forms.module'
import GinisModule from './ginis/ginis.module'
import NasesModule from './nases/nases.module'
import NasesConsumerModule from './nases-consumer/nases-consumer.module'
import RabbitmqClientModule from './rabbitmq-client/rabbitmq-client.module'
import SignerModule from './signer/signer.module'
import StatusModule from './status/status.module'
import TaxModule from './tax/tax.module'
import ThrowerErrorGuard from './utils/guards/thrower-error.guard'
import AppLoggerMiddleware from './utils/middlewares/logger.service'
import SharepointSubservice from './utils/subservices/sharepoint.subservice'

@Module({
  imports: [
    AppSharedModule,
    AppV2Module,
    AuthModule,
    AuthV2Module,
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
    SignerModule,
  ],
  controllers: [AppController],
  providers: [AppService, SharepointSubservice, ThrowerErrorGuard],
})
export default class AppModule {}
