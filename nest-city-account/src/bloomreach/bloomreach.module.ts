import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { BloomreachExportService } from './bloomreach-export.service'
import { BloomreachMergeConsentService } from './bloomreach-merge-consent.service'
import { BloomreachOutboxProcessor } from './bloomreach-outbox.processor'
import { BloomreachOutboxService } from './bloomreach-outbox.service'
import { BloomreachOutboxWriterService } from './bloomreach-outbox-writer.service'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'
import { bloomreachContactDatabaseProvider } from './contact-database/bloomreach-contact-database.provider'
import { BloomreachContactDatabaseService } from './contact-database/bloomreach-contact-database.service'

@Module({
  imports: [PrismaModule],
  providers: [
    BloomreachPayloadBuilder,
    BloomreachExportService,
    BloomreachMergeConsentService,
    BloomreachOutboxWriterService,
    BloomreachOutboxService,
    BloomreachOutboxProcessor,
    BloomreachContactDatabaseService,
    bloomreachContactDatabaseProvider,
  ],
  exports: [BloomreachOutboxService, BloomreachOutboxProcessor, BloomreachContactDatabaseService],
  controllers: [],
})
export class BloomreachModule {}
