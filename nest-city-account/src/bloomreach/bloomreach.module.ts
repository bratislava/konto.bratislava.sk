import { Module } from '@nestjs/common'

import { BloomreachService } from './bloomreach.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [BloomreachService],
  exports: [BloomreachService],
  controllers: [],
})
export class BloomreachModule {}
