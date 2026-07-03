import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { BloomreachExportService } from './bloomreach-export.service'
import { BloomreachMergeConsentService } from './bloomreach-merge-consent.service'
import { BloomreachOutboxProcessor } from './bloomreach-outbox.processor'
import { BloomreachOutboxService } from './bloomreach-outbox.service'
import { BloomreachOutboxWriterService } from './bloomreach-outbox-writer.service'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'
import { ContactDatabaseModule } from './contact-database/contact-database.module'

@Module({
  imports: [PrismaModule, ContactDatabaseModule],
  providers: [
    BloomreachPayloadBuilder,
    BloomreachExportService,
    BloomreachMergeConsentService,
    BloomreachOutboxWriterService,
    BloomreachOutboxService,
    BloomreachOutboxProcessor,
  ],
  exports: [BloomreachOutboxService, BloomreachOutboxProcessor, ContactDatabaseModule],
  controllers: [],
})
export class BloomreachModule {}
