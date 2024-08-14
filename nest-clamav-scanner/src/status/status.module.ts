import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { StatusController } from './status.controller';
import { ClamavClientModule } from '../clamav-client/clamav-client.module';
import { FormsClientModule } from '../forms-client/forms-client.module';

@Module({
  imports: [MinioClientModule, ClamavClientModule, FormsClientModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
