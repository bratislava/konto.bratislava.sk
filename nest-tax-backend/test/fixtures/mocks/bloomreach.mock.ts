import { HttpStatus } from '@nestjs/common'
import nock from 'nock'

import { BloomreachEventNameEnum } from '../../../src/bloomreach/bloomreach.types'
import getBaConfigInstance from '../../../src/config/ba-config.instance'

export interface BloomreachTrackedEvent {
  customer_ids: { city_account_id: string }
  event_type: BloomreachEventNameEnum
  properties: Record<string, unknown>
}

/**
 * Fake Bloomreach tracking API, served over HTTP with nock. Records every tracked event.
 *
 * Interceptors are removed by `TestingApp.afterEach()` (`nock.cleanAll()`), so call `install()` in `beforeEach`.
 * `install()` also clears recorded events and the configured response status.
 */
export class BloomreachMock {
  /** Events received since the last `install()`, including the ones answered with an error status. */
  events: BloomreachTrackedEvent[] = []

  private responseStatus: HttpStatus = HttpStatus.OK

  private readonly apiUrl: string

  private readonly eventsPath: string

  constructor() {
    const { apiUrl, projectToken } = getBaConfigInstance().bloomreach
    this.apiUrl = apiUrl
    this.eventsPath = `/track/v2/projects/${projectToken}/customers/events`
  }

  /** All following requests are answered with the status, until the next `install()`. */
  respondWith(status: HttpStatus): void {
    this.responseStatus = status
  }

  install(): void {
    this.events = []
    this.responseStatus = HttpStatus.OK

    nock(this.apiUrl)
      .persist()
      .post(this.eventsPath)
      .reply(async (request: Request) => {
        this.events.push((await request.json()) as BloomreachTrackedEvent)
        return [this.responseStatus, {}]
      })
  }
}
