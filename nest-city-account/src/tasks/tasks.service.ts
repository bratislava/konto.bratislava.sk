import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import HandleErrors from '../utils/decorators/errorHandler.decorators'
import { CleanupTasksSubservice } from './subservices/cleanup-tasks.subservice'
import { EdeskTasksSubservice } from './subservices/edesk-tasks.subservice'
import { TaxDeliveryMethodsTasksSubservice } from './subservices/tax-delivery-methods-tasks.subservice'

const bratislavaTimezone = 'Europe/Bratislava'

/**
 * Main task orchestration service that schedules and coordinates all cron jobs.
 * Delegates actual task execution to domain-specific subservices.
 */
@Injectable()
export class TasksService {
  constructor(
    private readonly cleanupTasksSubservice: CleanupTasksSubservice,
    private readonly edeskTasksSubservice: EdeskTasksSubservice,
    private readonly taxDeliveryMethodsTasksSubservice: TaxDeliveryMethodsTasksSubservice
  ) {}

  /**
   * Deletes user verification data older than 1 month.
   * Cleans up both UserIdCardVerify and LegalPersonIcoIdCardVerify records.
   * Runs daily at 1:02 AM.
   */
  @Cron('2 01 * * *', { timeZone: bratislavaTimezone })
  @HandleErrors('Cron Error')
  async deleteOldUserVerificationData() {
    return this.cleanupTasksSubservice.deleteOldUserVerificationData()
  }

  /**
   * Updates delivery methods in Noris tax backend for users who haven't been updated this year.
   * Processes users in batches and validates that users aren't deactivated during the update.
   * Runs every 5 minutes from February 2nd onwards during tax season.
   */
  @Cron(`*/5 * 2-31 ${process.env.MUNICIPAL_TAX_LOCK_MONTH}-12 *`, {
    timeZone: bratislavaTimezone,
  })
  @HandleErrors('Cron Error')
  async updateDeliveryMethodsInNoris() {
    return this.taxDeliveryMethodsTasksSubservice.updateDeliveryMethodsInNoris()
  }

  /**
   * Updates eDesk active status from UPVS for physical entities.
   * Uses exponential backoff for retry logic on failures.
   * Processes up to 5 entities every 30 seconds.
   */
  @Cron(CronExpression.EVERY_30_SECONDS, { timeZone: bratislavaTimezone })
  @HandleErrors('CronError')
  async updateEdesk(): Promise<void> {
    return this.edeskTasksSubservice.updateEdesk()
  }

  /**
   * Alerts on entities that have failed eDesk updates 7 or more times consecutively.
   * Logs error messages with entity details for monitoring.
   * Runs daily at 9:01 AM.
   */
  @Cron('1 09 * * *', { timeZone: bratislavaTimezone })
  @HandleErrors('CronError')
  async alertFailingEdeskUpdate(): Promise<void> {
    return this.edeskTasksSubservice.alertFailingEdeskUpdate()
  }

  /**
   * Cleans up expired OAuth2 authorization codes older than 5 minutes.
   * Removes access, ID, and refresh tokens from expired records.
   * Runs every 5 minutes, ensuring codes are at most 10 minutes old.
   */
  @Cron(CronExpression.EVERY_5_MINUTES, { timeZone: bratislavaTimezone })
  @HandleErrors('CronError')
  async cleanupExpiredAuthorizationCodes(): Promise<void> {
    return this.cleanupTasksSubservice.cleanupExpiredAuthorizationCodes()
  }

  /**
   * Deletes OAuth2 data records older than 1 month.
   * Removes both expired authorization codes and stale records.
   * Runs on the 1st day of each month at midnight.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, { timeZone: bratislavaTimezone })
  @HandleErrors('CronError')
  async deleteOldOAuth2Data(): Promise<void> {
    return this.cleanupTasksSubservice.deleteOldOAuth2Data()
  }

  /**
   * Locks delivery methods for all users on the configured tax lock date.
   * Determines delivery method based on eDesk status and GDPR preferences.
   * Processes users in batches with delays to avoid overwhelming the database.
   * Runs once per year on MUNICIPAL_TAX_LOCK_DAY/MUNICIPAL_TAX_LOCK_MONTH.
   */
  @Cron(`0 0 ${process.env.MUNICIPAL_TAX_LOCK_DAY} ${process.env.MUNICIPAL_TAX_LOCK_MONTH} *`, {
    timeZone: bratislavaTimezone,
  })
  @HandleErrors('Cron')
  async lockDeliveryMethods(): Promise<void> {
    return this.taxDeliveryMethodsTasksSubservice.lockDeliveryMethods()
  }

  /**
   * Sends email notifications to users whose delivery method changed yesterday.
   * Handles both GDPR preference changes and eDesk status changes.
   * Includes PDF attachments for city account activations.
   * Runs daily at 1:01 AM.
   */
  @Cron('1 01 * * *', { timeZone: bratislavaTimezone })
  @HandleErrors('Cron')
  async sendDailyDeliveryMethodSummaries() {
    return this.taxDeliveryMethodsTasksSubservice.sendDailyDeliveryMethodSummaries()
  }
}
