import { Module } from '@nestjs/common'
import { MagproxyModule } from 'src/magproxy/magproxy.module'
import { PrismaModule } from '../prisma/prisma.module'
import { RfoByBirthnumberService } from './rfo-by-birthnumber.service'

@Module({
  imports: [PrismaModule, MagproxyModule],
  providers: [RfoByBirthnumberService],
  exports: [RfoByBirthnumberService],
})
export class RfoByBirthnumberModule {}
