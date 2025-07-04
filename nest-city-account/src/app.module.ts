import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { ScheduleModule } from '@nestjs/schedule'
import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { VerificationModule } from './user-verification/verification.module'
import { UserModule } from './user/user.module'
import AppLoggerMiddleware from './utils/middlewares/logger.service'
import { TasksSubservice } from './utils/subservices/tasks.subservice'
import ThrowerErrorGuard from './utils/guards/errors.guard'
import { TaxSubservice } from './utils/subservices/tax.subservice'
import { ConfigModule } from '@nestjs/config'
import ClientsModule from './clients/clients.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    VerificationModule,
    AdminModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [TaxSubservice, TasksSubservice, ThrowerErrorGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
