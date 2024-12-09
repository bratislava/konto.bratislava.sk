import { Module } from '@nestjs/common';
import { FormsClientService } from './forms-client.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [FormsClientService],
  exports: [FormsClientService],
})
export class FormsClientModule {
  constructor(
    private readonly formsClientService: FormsClientService,
    private readonly configService: ConfigService,
  ) {
    this.formsClientService = new FormsClientService(configService);
  }
}
