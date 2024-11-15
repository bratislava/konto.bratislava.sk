import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { FormState, Prisma } from '@prisma/client'

import FilesService from '../../files/files.service'
import PrismaService from '../../prisma/prisma.service'

@Injectable()
export default class FormsTaskSubservice {
  private logger: Logger = new Logger(FormsTaskSubservice.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteOldDraftForms(): Promise<void> {
    this.logger.log('Deleting old draft forms.')
    const oneWeekAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)

    const where = {
      state: FormState.DRAFT,
      updatedAt: {
        lt: oneWeekAgo,
      },
      formDataJson: {
        equals: Prisma.DbNull,
      },
    }

    // Get the forms that are in DRAFT state, older than one week and have no data.
    const forms = await this.prismaService.forms.findMany({
      select: {
        id: true,
        files: {
          select: {
            id: true,
          },
        },
      },
      where,
    })
    if (forms.length === 0) {
      this.logger.log('No old draft forms found to delete.')
      return
    }

    const formIds = forms.map((form) => form.id)
    const fileIds = forms.flatMap((form) => form.files.map((file) => file.id))
    this.logger.log(
      `Found ${formIds.length} old draft forms: ${formIds.join(', ')}`,
    )
    this.logger.log(
      `Found ${fileIds.length} files to delete from old draft forms: ${fileIds.join(', ')}`,
    )

    // Delete the forms along with its files
    await this.filesService.deleteFileMany(fileIds)
    const deleted = await this.prismaService.forms.deleteMany({
      // Delete the forms based on the same where clause as above, not by IN: formIds.
      // The reason is that there is a LIMIT on how many ids can be passed to IN, this ensures that all forms are deleted.
      // The result of WHERE is the same as in the findMany query above, since oneWeekAgo is a constant.
      where,
    })
    this.logger.log(`Deleted ${deleted.count} old draft forms.`)
  }
}
