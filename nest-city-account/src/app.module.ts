import {
  AppLoggerMiddleware,
  birthNumberRedactor,
  emailRedactor,
  LogSanitizationModule,
  NestLoggingModule,
} from '@bratislava/log-nest'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import ClientsModule from './clients/clients.module'
import BaConfigModule from './config/ba-config.module'
import { IntegrationModule } from './integration/integration.module'
import { NorisModule } from './noris/noris.module'
import { OAuth2Module } from './oauth2/oauth2.module'
import { DpbModule } from './oauth2-clients/dpb/dpb.module'
import { PaasMpaModule } from './oauth2-clients/paas-mpa/paas-mpa.module'
import { TicketsModule } from './oauth2-clients/tickets/tickets.module'
import { PrismaModule } from './prisma/prisma.module'
import { TasksModule } from './tasks/tasks.module'
import { TowingModule } from './towing/towing.module'
import { UserModule } from './user/user.module'
import { VerificationModule } from './user-verification/verification.module'
import alertReporting from './utils/constants/error.alerts'
import { SharedModule } from './utils/subservices/shared.module'

@Module({
  imports: [
    BaConfigModule,
    PrismaModule,
    NestLoggingModule.forRoot({ alertReporting }),
    LogSanitizationModule.forRoot({
      redactors: [emailRedactor, birthNumberRedactor],
      allowShape: {
        message: true,
        error: true,
        statusCode: true,
        status: true,
        errorName: true,
      },
      onDisallowed: 'redact',
    }),
    AuthModule,
    UserModule,
    VerificationModule,
    AdminModule,
    IntegrationModule,
    SharedModule,
    ScheduleModule.forRoot(),
    ClientsModule,
    TasksModule,
    OAuth2Module,
    DpbModule,
    PaasMpaModule,
    TicketsModule,
    NorisModule,
    TowingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).exclude('oauth2/{*path}').forRoutes('*')
  }
}
