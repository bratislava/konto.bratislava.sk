import { Module } from '@nestjs/common'

import { bloomreachContactDatabaseProvider } from './bloomreach-contact-database.provider'
import { BloomreachContactDatabaseService } from './bloomreach-contact-database.service'

@Module({
  providers: [BloomreachContactDatabaseService, bloomreachContactDatabaseProvider],
  exports: [BloomreachContactDatabaseService],
})
export class ContactDatabaseModule {}
