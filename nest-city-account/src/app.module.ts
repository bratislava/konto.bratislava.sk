import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { ScheduleModule } from '@nestjs/schedule'
import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { VerificationModule } from './user-verification/verification.module'
import { UserModule } from './user/user.module'
import AppLoggerMiddleware from './utils/middlewares/logger.service'
import ThrowerErrorGuard from './utils/guards/errors.guard'
import { TaxSubservice } from './utils/subservices/tax.subservice'
import { ConfigModule } from '@nestjs/config'
import { TasksModule } from './tasks/tasks.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    VerificationModule,
    AdminModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TasksModule,
  ],
  controllers: [AppController],
  providers: [TaxSubservice, ThrowerErrorGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
