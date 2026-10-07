import { ErrorFactoryService } from '@bratislava/log-nest'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'

import BaConfigService from '../config/ba-config.service'
import { StrapiErrorsResponseEnum } from './strapi.errors.enum'
import StrapiService from './strapi.service'

describe('StrapiService', () => {
  let service: StrapiService
  let getSpy: jest.SpyInstance

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

    getSpy = jest.spyOn(service['strapiClient'], 'get')
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
        ).rejects.toThrow(StrapiErrorsResponseEnum.FEEDBACK_LINK_FETCH_ERROR)
      },
    )

    it('should throw if the request fails', async () => {
      getSpy.mockRejectedValue(new AxiosError('Network Error'))

      await expect(service.getFeedbackLink(formDefinitionSlug)).rejects.toThrow(
        StrapiErrorsResponseEnum.FEEDBACK_LINK_FETCH_ERROR,
      )
    })
  })
})
