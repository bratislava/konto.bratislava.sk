import { Module } from '@nestjs/common'

import { AuthV2Module } from '../auth-v2/auth-v2.module'
import PrismaModule from '../prisma/prisma.module'
import FormsV2Controller from './forms-v2.controller'
import { FormsRepository } from './repositories/forms.repository'
import { FormsV2Service } from './services/forms-v2.service'

@Module({
  imports: [PrismaModule, AuthV2Module],
  providers: [FormsRepository, FormsV2Service],
  exports: [FormsRepository],
  controllers: [FormsV2Controller],
})
export default class FormsV2Module {}
