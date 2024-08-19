import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from './status/status.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScannerModule } from './scanner/scanner.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { ClamavClientModule } from './clamav-client/clamav-client.module';
import { ScannerCronModule } from './scanner-cron/scanner-cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FormsClientModule } from './forms-client/forms-client.module';
import { AuthModule } from './auth/auth.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StatusModule,
    ScannerModule,
    PrismaModule,
    AuthModule,
    MinioClientModule,
    ClamavClientModule,
    ScheduleModule.forRoot(),
    ScannerCronModule,
    FormsClientModule,
  ],
})
export class AppModule {}
