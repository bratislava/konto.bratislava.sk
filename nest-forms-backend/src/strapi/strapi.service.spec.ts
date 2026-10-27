import { ErrorFactoryService } from '@bratislava/log-nest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'
import type { MockInstance } from 'vitest'
import { ZodError } from 'zod'

import { expectAny, expectStringContaining } from '../__tests__/matchers'
import BaConfigService from '../config/ba-config.service'
import {
  StrapiErrorsEnum,
  StrapiErrorsResponseEnum,
} from './strapi.errors.enum'
import StrapiService from './strapi.service'

describe('StrapiService', () => {
  let service: StrapiService
  let getSpy: MockInstance

  const formDefinitionSlug = 'priznanie-k-dani-z-nehnutelnosti'
  const feedbackLink = 'https://test.feedback.com/bratislava/'

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StrapiService,
        ErrorFactoryService,
        {
          provide: BaConfigService,
          useValue: {
            cityAccountStrapi: {
              url: 'https://city-account-strapi.staging.bratislava.sk',
            },
          },
        },
      ],
    }).compile()

    service = app.get<StrapiService>(StrapiService)

    getSpy = vi.spyOn(service['strapiClient'], 'get')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getFeedbackLink', () => {
    it('should fetch the form by slug and return its feedback link', async () => {
      getSpy.mockResolvedValue({
        data: { data: [{ formSentPage: { feedbackLink } }] },
      })

      const result = await service.getFeedbackLink(formDefinitionSlug)

      expect(result).toBe(feedbackLink)
      expect(getSpy).toHaveBeenCalledWith('/api/forms', {
        params: {
          'filters[slug][$eq]': formDefinitionSlug,
          'fields[0]': 'slug',
          'populate[formSentPage][fields][0]': 'feedbackLink',
        },
      })
    })

    it('should return null if the form is not found', async () => {
      getSpy.mockResolvedValue({ data: { data: [] } })

      await expect(service.getFeedbackLink(formDefinitionSlug)).resolves.toBe(
        null,
      )
    })

    it.each([
      { label: 'form sent page is null', formSentPage: null },
      { label: 'feedback link is null', formSentPage: { feedbackLink: null } },
      { label: 'feedback link is blank', formSentPage: { feedbackLink: '  ' } },
    ])('should return null if $label', async ({ formSentPage }) => {
      getSpy.mockResolvedValue({ data: { data: [{ formSentPage }] } })

      await expect(service.getFeedbackLink(formDefinitionSlug)).resolves.toBe(
        null,
      )
    })

    it.each([
      { label: 'data is missing', data: {} },
      { label: 'form sent page is missing', data: { data: [{}] } },
      {
        label: 'feedback link is not a string',
        data: { data: [{ formSentPage: { feedbackLink: 1 } }] },
      },
    ])(
      'should throw if the response format is unexpected: $label',
      async ({ data }) => {
        getSpy.mockResolvedValue({ data })

        await expect(
          service.getFeedbackLink(formDefinitionSlug),
        ).rejects.toThrowEqualLogNestError({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errorEnum: StrapiErrorsEnum.FEEDBACK_LINK_FETCH_ERROR,
          message: StrapiErrorsResponseEnum.FEEDBACK_LINK_FETCH_ERROR,
          console: expectStringContaining(formDefinitionSlug),
          error: expectAny(ZodError),
        })
      },
    )

    it('should throw if the request fails', async () => {
      const axiosError = new AxiosError('Network Error')
      getSpy.mockRejectedValue(axiosError)

      await expect(
        service.getFeedbackLink(formDefinitionSlug),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.BAD_GATEWAY,
        errorEnum: StrapiErrorsEnum.FEEDBACK_LINK_FETCH_ERROR,
        message: StrapiErrorsResponseEnum.FEEDBACK_LINK_FETCH_ERROR,
        console: expectStringContaining(formDefinitionSlug),
        error: axiosError,
      })
    })
  })
})
