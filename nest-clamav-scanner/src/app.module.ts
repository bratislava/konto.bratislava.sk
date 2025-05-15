import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ClamavClientModule } from './clamav-client/clamav-client.module'
import { MinioClientModule } from './minio-client/minio-client.module'
import { PrismaModule } from './prisma/prisma.module'
import { ScannerModule } from './scanner/scanner.module'
import { ScannerCronModule } from './scanner-cron/scanner-cron.module'
import { StatusModule } from './status/status.module'
import ClientsModule from './clients/clients.module'

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule,
    StatusModule,
    ScannerModule,
    PrismaModule,
    AuthModule,
    MinioClientModule,
    ClamavClientModule,
    ScheduleModule.forRoot(),
    ScannerCronModule,
  ],
})
export class AppModule {}
