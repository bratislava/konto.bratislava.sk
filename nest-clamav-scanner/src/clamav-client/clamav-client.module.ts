import { Module } from '@nestjs/common';
import { ClamavClientService } from './clamav-client.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ClamavClientService],
  exports: [ClamavClientService],
})
export class ClamavClientModule {
  constructor(
    private readonly clamavClientService: ClamavClientService,
    private readonly configService: ConfigService,
  ) {
    this.clamavClientService = new ClamavClientService(configService);
  }
}
