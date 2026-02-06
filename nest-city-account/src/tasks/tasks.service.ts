import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import HandleErrors from '../utils/decorators/errorHandler.decorators'
import { CleanupTasksSubservice } from './subservices/cleanup-tasks.subservice'
import { EdeskTasksSubservice } from './subservices/edesk-tasks.subservice'
import { TaxDeliveryMethodsTasksSubservice } from './subservices/tax-delivery-methods-tasks.subservice'

@Injectable()
export class TasksService {
  constructor(
    private readonly cleanupTasksSubservice: CleanupTasksSubservice,
    private readonly edeskTasksSubservice: EdeskTasksSubservice,
    private readonly taxDeliveryMethodsTasksSubservice: TaxDeliveryMethodsTasksSubservice
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async deleteOldUserVerificationData() {
    return this.cleanupTasksSubservice.deleteOldUserVerificationData()
  }

  @Cron(`*/5 * 2-31 ${process.env.MUNICIPAL_TAX_LOCK_MONTH}-12 *`) // Every 5 minutes from MUNICIPAL_TAX_LOCK_MONTH (February), starting from 2nd.
  @HandleErrors('Cron Error')
  async updateDeliveryMethodsInNoris() {
    return this.taxDeliveryMethodsTasksSubservice.updateDeliveryMethodsInNoris()
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('CronError')
  async updateEdesk(): Promise<void> {
    return this.edeskTasksSubservice.updateEdesk()
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  @HandleErrors('CronError')
  async alertFailingEdeskUpdate(): Promise<void> {
    return this.edeskTasksSubservice.alertFailingEdeskUpdate()
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  @HandleErrors('CronError')
  async cleanupExpiredAuthorizationCodes(): Promise<void> {
    return this.cleanupTasksSubservice.cleanupExpiredAuthorizationCodes()
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  @HandleErrors('CronError')
  async deleteOldOAuth2Data(): Promise<void> {
    return this.cleanupTasksSubservice.deleteOldOAuth2Data()
  }

  @Cron(`0 0 ${process.env.MUNICIPAL_TAX_LOCK_DAY} ${process.env.MUNICIPAL_TAX_LOCK_MONTH} *`)
  @HandleErrors('Cron')
  async lockDeliveryMethods(): Promise<void> {
    return this.taxDeliveryMethodsTasksSubservice.lockDeliveryMethods()
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron')
  async sendDailyDeliveryMethodSummaries() {
    return this.taxDeliveryMethodsTasksSubservice.sendDailyDeliveryMethodSummaries()
  }
}
