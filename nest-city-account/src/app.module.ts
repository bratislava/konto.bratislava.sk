import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { ScheduleModule } from '@nestjs/schedule'
import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { VerificationModule } from './user-verification/verification.module'
import { UserModule } from './user/user.module'
import AppLoggerMiddleware from './utils/middlewares/logger.service'

@Module({
  imports: [PrismaModule, AuthModule, UserModule, VerificationModule, AdminModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
