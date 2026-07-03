import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { FormState } from '@prisma/client'

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
import { GetFormResponseDto } from '../forms/dtos/responses.dto'
import FormsModule from '../forms/forms.module'
import PrismaService from '../prisma/prisma.service'
import { CreateFormOutput } from './outputs/create-form.output'

describe('Get form', () => {
  let testingApp: TestingApp
  let userFixtureFactory: UserFixtureFactory
  let foAuthUser: AuthFixtureUser
  let formsFixtureRepository: FormsFixtureRepository
  const createdForms: string[] = []

  beforeAll(async () => {
    userFixtureFactory = new UserFixtureFactory()
    foAuthUser = userFixtureFactory.createFoAuthUser()

    const moduleRef = await userFixtureFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module, FormsModule],
        }),
      )
      .compile()

    testingApp = await initializeTestingApp(moduleRef)
    formsFixtureRepository = new FormsFixtureRepository(moduleRef)
  })

  afterEach(() => {
    testingApp.afterEach()
  })

  afterAll(async () => {
    await formsFixtureRepository.deleteMany(createdForms)
    await testingApp.afterAll()
  })

  it('should return the form if user has access', async () => {
    const createdForm = await testingApp.axiosClient.post<CreateFormOutput>(
      '/forms-v2/',
      { formDefinitionSlug: 'zavazne-stanovisko-k-investicnej-cinnosti' },
      { headers: foAuthUser.headers },
    )

    createdForms.push(createdForm.data.formId)

    const response = await testingApp.axiosClient.get<GetFormResponseDto>(
      `/forms/${createdForm.data.formId}`,
      { headers: foAuthUser.headers },
    )

    expect(response.status).toBe(HttpStatus.OK)
  })

  it('should return the form if user has access, form definition is disabled, but it is not editable', async () => {
    const createdForm = await testingApp.axiosClient.post<CreateFormOutput>(
      '/forms-v2/',
      // 'predzahradky' is disabled so it cannot be created, we will manually set it after
      { formDefinitionSlug: 'zavazne-stanovisko-k-investicnej-cinnosti' },
      { headers: foAuthUser.headers },
    )

    createdForms.push(createdForm.data.formId)

    // Set state to processing and slug to disabled 'predzahradky'
    await testingApp.app.get(PrismaService).forms.update({
      where: { id: createdForm.data.formId },
      data: {
        formDefinitionSlug: 'predzahradky',
        state: FormState.PROCESSING,
      },
    })

    const response = await testingApp.axiosClient.get<GetFormResponseDto>(
      `/forms/${createdForm.data.formId}`,
      { headers: foAuthUser.headers },
    )

    expect(response.status).toBe(HttpStatus.OK)
  })

  it('should not return the form if form definition is disabled and form is editable', async () => {
    const createdForm = await testingApp.axiosClient.post<CreateFormOutput>(
      '/forms-v2/',
      { formDefinitionSlug: 'zavazne-stanovisko-k-investicnej-cinnosti' },
      { headers: foAuthUser.headers },
    )

    createdForms.push(createdForm.data.formId)

    // Set slug to disabled 'predzahradky', keep state as DRAFT (editable)
    await testingApp.app.get(PrismaService).forms.update({
      where: { id: createdForm.data.formId },
      data: { formDefinitionSlug: 'predzahradky' },
    })

    const response = await testingApp.axiosClient.get<GetFormResponseDto>(
      `/forms/${createdForm.data.formId}`,
      { headers: foAuthUser.headers },
    )

    expect(response.status).toBe(HttpStatus.FORBIDDEN)
  })
})
