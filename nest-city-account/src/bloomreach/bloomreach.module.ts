import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { BloomreachService } from './bloomreach.service'
import { bloomreachContactDatabaseProvider } from './bloomreach-contact-database.provider'
import { BloomreachContactDatabaseService } from './bloomreach-contact-database.service'

@Module({
  imports: [PrismaModule],
  providers: [
    BloomreachService,
    BloomreachContactDatabaseService,
    bloomreachContactDatabaseProvider,
  ],
  exports: [BloomreachService, BloomreachContactDatabaseService],
  controllers: [],
})
export class BloomreachModule {}
