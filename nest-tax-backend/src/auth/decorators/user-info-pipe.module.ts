import { Module } from '@nestjs/common'

import ClientsModule from '../../clients/clients.module'
import { UserInfoPipe } from './user-info.decorator'

@Module({
  imports: [ClientsModule],
  providers: [UserInfoPipe],
  exports: [ClientsModule, UserInfoPipe],
})
export default class UserInfoPipeModule {}
