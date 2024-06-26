import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TasksSubservice {

  constructor(private readonly prisma: PrismaService) {

  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteOldUserVerificationData() {
    const today = new Date();
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))

    await this.prisma.userIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo
        }
      }
    })

    await this.prisma.legalPersonIcoIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo
        }
      }
    })
  }
}
