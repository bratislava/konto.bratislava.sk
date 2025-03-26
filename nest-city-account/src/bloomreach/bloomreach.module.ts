import { Module } from '@nestjs/common'

import { BloomreachService } from './bloomreach.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [BloomreachService, CognitoSubservice],
  exports: [BloomreachService],
  controllers: [],
})
export class BloomreachModule {}
