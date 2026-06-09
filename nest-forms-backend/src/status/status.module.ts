import { Module } from '@nestjs/common'

import ScannerClientModule from '../scanner-client/scanner-client.module'
import StatusController from './status.controller'
import StatusService from './status.service'

@Module({
  imports: [ScannerClientModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export default class StatusModule {}
