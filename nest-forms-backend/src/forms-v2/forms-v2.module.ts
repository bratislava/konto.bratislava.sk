import { Module } from '@nestjs/common'

import { AuthV2Module } from '../auth-v2/auth-v2.module'
import PrismaModule from '../prisma/prisma.module'
import FormsV2Controller from './forms-v2.controller'

@Module({
  imports: [PrismaModule, AuthV2Module],
  providers: [],
  exports: [],
  controllers: [FormsV2Controller],
})
export default class FormsV2Module {}
