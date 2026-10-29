import { ErrorFactoryService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance, isAxiosError } from 'axios'
import { resolveFeedbackLink } from 'forms-shared/form-utils/resolveFeedbackLink'
import { z } from 'zod'

import BaConfigService from '../config/ba-config.service'
import {
  StrapiErrorsEnum,
  StrapiErrorsResponseEnum,
} from './strapi.errors.enum'

const STRAPI_REQUEST_TIMEOUT_MS = 5000

const strapiFormsResponseSchema = z.object({
  data: z.array(
    z.object({
      formSentPage: z
        .object({
          feedbackLink: z.string().nullable(),
        })
        .nullable(),
    }),
  ),
})

@Injectable()
export default class StrapiService {
  private readonly strapiClient: AxiosInstance

  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly errorFactoryService: ErrorFactoryService,
  ) {
    this.strapiClient = axios.create({
      baseURL: this.baConfigService.cityAccountStrapi.url,
      timeout: STRAPI_REQUEST_TIMEOUT_MS,
    })
  }

  async getFeedbackLink(formDefinitionSlug: string): Promise<string | null> {
    try {
      const response = await this.strapiClient.get<unknown>('/api/forms', {
        params: {
          'filters[slug][$eq]': formDefinitionSlug,
          'fields[0]': 'slug',
          'populate[formSentPage][fields][0]': 'feedbackLink',
        },
      })
      const { data } = strapiFormsResponseSchema.parse(response.data)

      return resolveFeedbackLink(data[0]?.formSentPage)
    } catch (error) {
      const consoleMessage = `Failed to get the feedback link for form definition ${formDefinitionSlug}`
      throw isAxiosError(error)
        ? this.errorFactoryService.fromAxiosError(error, {
            message: StrapiErrorsResponseEnum.FEEDBACK_LINK_FETCH_ERROR,
            console: consoleMessage,
            errorEnumOverwrite: StrapiErrorsEnum.FEEDBACK_LINK_FETCH_ERROR,
          })
        : this.errorFactoryService.InternalServerErrorException({
            errorEnum: StrapiErrorsEnum.FEEDBACK_LINK_FETCH_ERROR,
            message: StrapiErrorsResponseEnum.FEEDBACK_LINK_FETCH_ERROR,
            console: consoleMessage,
            error,
          })
    }
  }
}
