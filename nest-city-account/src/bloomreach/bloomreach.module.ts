import { Module } from '@nestjs/common'

import { BloomreachService } from './bloomreach.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PrismaModule } from '../prisma/prisma.module'
import { PdfConverterModule } from './pdf-converter/pdf-converter.module'
import { BloomreachController } from './bloomreach.controller'

@Module({
  imports: [PrismaModule, PdfConverterModule],
  providers: [BloomreachService, CognitoSubservice, ThrowerErrorGuard],
  exports: [BloomreachService],
  controllers: [BloomreachController],
})
export class BloomreachModule {}
