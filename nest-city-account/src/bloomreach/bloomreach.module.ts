import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { bloomreachContactDatabaseProvider } from './bloomreach-contact-database.provider'
import { BloomreachContactDatabaseService } from './bloomreach-contact-database.service'
import { BloomreachExportService } from './bloomreach-export.service'
import { BloomreachMergeConsentService } from './bloomreach-merge-consent.service'
import { BloomreachOutboxProcessor } from './bloomreach-outbox.processor'
import { BloomreachOutboxService } from './bloomreach-outbox.service'
import { BloomreachOutboxWriterService } from './bloomreach-outbox-writer.service'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'

@Module({
  imports: [PrismaModule],
  providers: [
    BloomreachContactDatabaseService,
    bloomreachContactDatabaseProvider,
    BloomreachPayloadBuilder,
    BloomreachExportService,
    BloomreachMergeConsentService,
    BloomreachOutboxWriterService,
    BloomreachOutboxService,
    BloomreachOutboxProcessor,
  ],
  exports: [BloomreachOutboxService, BloomreachOutboxProcessor, BloomreachContactDatabaseService],
  controllers: [],
})
export class BloomreachModule {}
