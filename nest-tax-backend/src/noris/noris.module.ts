import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'

import { NorisService } from './noris.service'

@Module({
  imports: [PrismaModule],
  providers: [NorisService],
  exports: [NorisService],
  controllers: [],
})
export class NorisModule {}
