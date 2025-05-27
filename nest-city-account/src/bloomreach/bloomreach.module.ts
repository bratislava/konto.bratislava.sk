import { Module } from '@nestjs/common'

import { BloomreachService } from './bloomreach.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [BloomreachService, CognitoSubservice, ThrowerErrorGuard],
  exports: [BloomreachService],
  controllers: [],
})
export class BloomreachModule {}
