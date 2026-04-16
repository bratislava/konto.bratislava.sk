import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { bloomreachContactDatabaseProvider } from './bloomreach-contact-database.provider'
import { BloomreachContactDatabaseService } from './bloomreach-contact-database.service'
import { BloomreachOutboxProcessor } from './bloomreach-outbox.processor'
import { BloomreachOutboxService } from './bloomreach-outbox.service'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'

@Module({
  imports: [PrismaModule],
  providers: [
    BloomreachContactDatabaseService,
    bloomreachContactDatabaseProvider,
    BloomreachPayloadBuilder,
    BloomreachOutboxService,
    BloomreachOutboxProcessor,
  ],
  exports: [BloomreachOutboxService, BloomreachOutboxProcessor, BloomreachContactDatabaseService],
  controllers: [],
})
export class BloomreachModule {}
