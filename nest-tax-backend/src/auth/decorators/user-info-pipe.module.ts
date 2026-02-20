import { Module } from '@nestjs/common'

import ClientsModule from '../../clients/clients.module.js'
import { UserInfoPipe } from './user-info.decorator.js'

@Module({
  imports: [ClientsModule],
  providers: [UserInfoPipe],
  exports: [ClientsModule, UserInfoPipe],
})
export default class UserInfoPipeModule {}
