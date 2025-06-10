import { Test } from '@nestjs/testing'

import {
  AuthFixtureUser,
  GuestFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import { FormsFixtureRepository } from '../../test/fixtures/repositories/forms-fixture-repository'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { AppV2Module } from '../app-v2.module'
import { CreateFormInput } from './inputs/create-form.input'
import { CreateFormOutput } from './outputs/create-form.output'

describe('Create form', () => {
  let testingApp: TestingApp
  let userFixtureFactory: UserFixtureFactory
  let authUser: AuthFixtureUser
  let guestUser: GuestFixtureUser
  let formsFixtureRepository: FormsFixtureRepository
  const createdForms: string[] = []

  beforeAll(async () => {
    userFixtureFactory = new UserFixtureFactory()
    authUser = userFixtureFactory.createFoAuthUser()
    guestUser = userFixtureFactory.createGuestUser()

    const moduleRef = await userFixtureFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module],
        }),
      )
      .compile()

    testingApp = await initializeTestingApp(moduleRef)
    formsFixtureRepository = new FormsFixtureRepository(moduleRef)
  })

  afterEach(async () => {
    testingApp.afterEach()
  })

  afterAll(async () => {
    await formsFixtureRepository.deleteMany(createdForms)
    await testingApp.afterAll()
  })

  const createFormRequest: CreateFormInput = {
    formDefinitionSlug: 'zavazne-stanovisko-k-investicnej-cinnosti',
  }

  it('should create form for authenticated users', async () => {
    const response = await testingApp.axiosClient.post<CreateFormOutput>(
      '/forms-v2/',
      createFormRequest,
      { headers: authUser.headers },
    )
    expect(response.status).toBe(201)
    expect(response.data).toHaveProperty('formId')
    expect(typeof response.data.formId).toBe('string')

    createdForms.push(response.data.formId)

    const form = await formsFixtureRepository.get(response.data.formId)
    expect(form).toBeTruthy()
    expect(form?.userExternalId).toBe(authUser.sub)
    expect(form?.cognitoGuestIdentityId).toBeNull()
    expect(form?.formDefinitionSlug).toBe(createFormRequest.formDefinitionSlug)
  })

  it('should create form for guest users', async () => {
    const response = await testingApp.axiosClient.post<CreateFormOutput>(
      '/forms-v2/',
      createFormRequest,
      { headers: guestUser.headers },
    )
    expect(response.status).toBe(201)
    expect(response.data).toHaveProperty('formId')
    expect(typeof response.data.formId).toBe('string')

    createdForms.push(response.data.formId)

    const form = await formsFixtureRepository.get(response.data.formId)
    expect(form).toBeTruthy()
    expect(form?.userExternalId).toBeNull()
    expect(form?.cognitoGuestIdentityId).toBe(guestUser.identityId)
    expect(form?.formDefinitionSlug).toBe(createFormRequest.formDefinitionSlug)
  })
})
