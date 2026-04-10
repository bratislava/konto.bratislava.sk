import { Module } from '@nestjs/common'

import { BloomreachContactDatabaseService } from './bloomreach-contact-database.service'
import { bloomreachContactDatabaseProvider } from './bloomreach-contact-database.provider'
import { BloomreachOutboxService } from './bloomreach-outbox.service'
import { BloomreachOutboxProcessor } from './bloomreach-outbox.processor'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'
import { PrismaModule } from '../prisma/prisma.module'

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
