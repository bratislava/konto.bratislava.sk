import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Test } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'

import { UserFixtureFactory } from '../../../test/fixtures/auth/user-fixture-factory'
import {
  initializeTestingApp,
  TestingApp,
} from '../../../test/initialize-testing-app'
import { AppV2Module } from '../../app-v2.module'
import { AllowCompletedDisabledForms } from '../../forms-v2/decorators/allow-completed-disabled-forms.decorator'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import FormsService from '../forms.service'
import { FormDefinitionMustBeEnabledGuard } from './form-definition-must-be-enabled.guard'

const ENABLED_SLUG = 'zavazne-stanovisko-k-investicnej-cinnosti'
const DISABLED_SLUG = 'predzahradky'

const makeForm = (slug: string, state: FormState = FormState.DRAFT): Forms =>
  ({
    id: 'test-form-id',
    formDefinitionSlug: slug,
    state,
    error: FormError.NONE,
    archived: false,
  }) as Forms

@Controller('test-must-be-enabled-e2e')
@ApiTags('test-must-be-enabled-e2e')
class TestFormMustBeEnabledController {
  @Get('default/:formId')
  @UseGuards(FormDefinitionMustBeEnabledGuard)
  @ApiOkResponse()
  defaultEndpoint(@Param('formId') formId: string) {
    return { formId }
  }

  @Get('allow-completed/:formId')
  @AllowCompletedDisabledForms(true)
  @UseGuards(FormDefinitionMustBeEnabledGuard)
  @ApiOkResponse()
  allowCompletedEndpoint(@Param('formId') formId: string) {
    return { formId }
  }
}

describe('FormDefinitionMustBeEnabledGuard e2e', () => {
  let testingApp: TestingApp
  let mockFormsService: { getForm: jest.Mock; isEditable: jest.Mock }

  beforeAll(async () => {
    const userFixtureFactory = new UserFixtureFactory()

    mockFormsService = {
      getForm: jest.fn(),
      isEditable: jest.fn(),
    }

    const moduleRef = await userFixtureFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module],
          controllers: [TestFormMustBeEnabledController],
          providers: [
            FormDefinitionMustBeEnabledGuard,
            ThrowerErrorGuard,
            { provide: FormsService, useValue: mockFormsService },
          ],
        }),
      )
      .compile()

    testingApp = await initializeTestingApp(moduleRef)
  })

  afterEach(() => {
    testingApp.afterEach()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await testingApp.afterAll()
  })

  describe('without AllowCompletedDisabledForms decorator', () => {
    it('allows access when form definition is enabled', async () => {
      mockFormsService.getForm.mockResolvedValue(makeForm(ENABLED_SLUG))

      const response = await testingApp.axiosClient.get(
        '/test-must-be-enabled-e2e/default/some-form-id',
      )

      expect(response.status).toBe(HttpStatus.OK)
    })

    it('returns 403 when form definition is disabled', async () => {
      mockFormsService.getForm.mockResolvedValue(makeForm(DISABLED_SLUG))

      const response = await testingApp.axiosClient.get(
        '/test-must-be-enabled-e2e/default/some-form-id',
      )

      expect(response.status).toBe(HttpStatus.FORBIDDEN)
    })
  })

  describe('with AllowCompletedDisabledForms(true) decorator', () => {
    it('allows access when form definition is enabled', async () => {
      mockFormsService.getForm.mockResolvedValue(makeForm(ENABLED_SLUG))

      const response = await testingApp.axiosClient.get(
        '/test-must-be-enabled-e2e/allow-completed/some-form-id',
      )

      expect(response.status).toBe(HttpStatus.OK)
    })

    it('returns 403 when definition is disabled and form is in editable state (DRAFT)', async () => {
      mockFormsService.getForm.mockResolvedValue(
        makeForm(DISABLED_SLUG, FormState.DRAFT),
      )
      mockFormsService.isEditable.mockReturnValue(true)

      const response = await testingApp.axiosClient.get(
        '/test-must-be-enabled-e2e/allow-completed/some-form-id',
      )

      expect(response.status).toBe(HttpStatus.FORBIDDEN)
    })

    it('allows access when definition is disabled and form is in completed state (PROCESSING)', async () => {
      mockFormsService.getForm.mockResolvedValue(
        makeForm(DISABLED_SLUG, FormState.PROCESSING),
      )
      mockFormsService.isEditable.mockReturnValue(false)

      const response = await testingApp.axiosClient.get(
        '/test-must-be-enabled-e2e/allow-completed/some-form-id',
      )

      expect(response.status).toBe(HttpStatus.OK)
    })

    it('allows access when definition is disabled and form is in completed state (FINISHED)', async () => {
      mockFormsService.getForm.mockResolvedValue(
        makeForm(DISABLED_SLUG, FormState.FINISHED),
      )
      mockFormsService.isEditable.mockReturnValue(false)

      const response = await testingApp.axiosClient.get(
        '/test-must-be-enabled-e2e/allow-completed/some-form-id',
      )

      expect(response.status).toBe(HttpStatus.OK)
    })
  })
})
