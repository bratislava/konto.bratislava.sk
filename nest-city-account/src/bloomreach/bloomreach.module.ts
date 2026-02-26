import { Module } from '@nestjs/common'

import { BloomreachService } from './bloomreach.service'
import { BloomreachContactDatabaseService } from './bloomreach-contact-database.service'
import { bloomreachContactDatabaseProvider } from './bloomreach-contact-database.provider'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [BloomreachService, BloomreachContactDatabaseService, bloomreachContactDatabaseProvider],
  exports: [BloomreachService, BloomreachContactDatabaseService],
  controllers: [],
})
export class BloomreachModule {}
