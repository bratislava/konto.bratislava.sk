import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { FormDefinitionSlovenskoSk } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import {
  AuthFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import { FormsFixtureRepository } from '../../test/fixtures/repositories/forms-fixture-repository'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { AppV2Module } from '../app-v2.module'
import FormRegistrationStatusRepository from '../nases/utils-services/form-registration-status.repository'
import PrismaService from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { FormSendOnlyRegisteredGuard } from './guards/form-send-only-registered.guard'
import { CreateFormService } from './services/create-form.service'

@Controller('test-form-send-e2e')
class TestFormSendController {
  @Get('form-send-only-registered/:formId')
  @UseGuards(FormSendOnlyRegisteredGuard)
  getFormSendOnlyRegistered(@Param('formId') formId: string) {
    return { formId }
  }

  @Get('form-send/:formId')
  getFormSend(@Param('formId') formId: string) {
    return { formId }
  }
}

describe('Form send', () => {
  let testingApp: TestingApp
  let userFixtureFactory: UserFixtureFactory
  let formsFixtureRepository: FormsFixtureRepository
  let createFormService: CreateFormService
  let prismaService: PrismaService
  let formRegistrationStatusRepository: FormRegistrationStatusRepository

  let authUser1: AuthFixtureUser

  const createdFormIds: string[] = []

  const slovenskoSkFormSlug = 'ziadost-o-najom-bytu'
  const nonSlovenskoSkFormSlug = 'olo-mimoriadny-odvoz-a-zhodnotenie-odpadu'

  beforeAll(async () => {
    userFixtureFactory = new UserFixtureFactory()

    authUser1 = userFixtureFactory.createFoAuthUser()

    const moduleRef = await userFixtureFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module],
          providers: [ThrowerErrorGuard, FormRegistrationStatusRepository],
          controllers: [TestFormSendController],
        }),
      )
      .compile()

    testingApp = await initializeTestingApp(moduleRef)
    formsFixtureRepository = new FormsFixtureRepository(moduleRef)

    createFormService = testingApp.app.get(CreateFormService)
    prismaService = testingApp.app.get(PrismaService)
    formRegistrationStatusRepository = testingApp.app.get(
      FormRegistrationStatusRepository,
    )
  })

  afterEach(() => {
    testingApp.afterEach()
  })

  afterAll(async () => {
    await formsFixtureRepository.deleteMany(createdFormIds)
    await testingApp.afterAll()
    await prismaService.formRegistrationStatus.deleteMany({}) // clean the table after tests
  })

  describe('Error Handling & Invalid Requests', () => {
    it('should return 500 if trying to send form which is marked as not registered in Slovensko.sk', async () => {
      const formDefinition = getFormDefinitionBySlug(
        slovenskoSkFormSlug,
      ) as FormDefinitionSlovenskoSk

      await formRegistrationStatusRepository.setStatus(formDefinition, false)

      const createdForm = await createFormService.createForm(
        { formDefinitionSlug: slovenskoSkFormSlug },
        authUser1.user,
      )
      createdFormIds.push(createdForm.id)

      const response = await testingApp.axiosClient.get(
        `/test-form-send-e2e/form-send-only-registered/${createdForm.id}`,
      )

      expect(response.status).toBe(500)
    })

    it('should return 500 if trying to send form which is missing from table with registered forms', async () => {
      const createdForm = await createFormService.createForm(
        { formDefinitionSlug: slovenskoSkFormSlug },
        authUser1.user,
      )
      createdFormIds.push(createdForm.id)

      const response = await testingApp.axiosClient.get(
        `/test-form-send-e2e/form-send-only-registered/${createdForm.id}`,
      )

      expect(response.status).toBe(500)
    })

    it('should pass if form definition is not slovensko.sk', async () => {
      const createdForm = await createFormService.createForm(
        { formDefinitionSlug: nonSlovenskoSkFormSlug },
        authUser1.user,
      )
      createdFormIds.push(createdForm.id)

      const response = await testingApp.axiosClient.get(
        `/test-form-send-e2e/form-send-only-registered/${createdForm.id}`,
      )

      expect(response.status).toBe(200)
    })

    it('should pass if form is registered in Slovensko.sk', async () => {
      const formDefinition = getFormDefinitionBySlug(
        slovenskoSkFormSlug,
      ) as FormDefinitionSlovenskoSk

      await formRegistrationStatusRepository.setStatus(formDefinition, true)
      const createdForm = await createFormService.createForm(
        { formDefinitionSlug: slovenskoSkFormSlug },
        authUser1.user,
      )
      createdFormIds.push(createdForm.id)

      const response = await testingApp.axiosClient.get(
        `/test-form-send-e2e/form-send-only-registered/${createdForm.id}`,
      )

      expect(response.status).toBe(200)
    })
  })
})
