import { Test } from '@nestjs/testing'

import {
  AuthFixtureUser,
  GuestFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import { FormMigrationsFixtureRepository } from '../../test/fixtures/repositories/form-migrations-fixture-repository'
import { FormsFixtureRepository } from '../../test/fixtures/repositories/forms-fixture-repository'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { AppV2Module } from '../app-v2.module'
import { ClaimMigrationInput } from './inputs/claim-migration.input'
import { PrepareMigrationInput } from './inputs/prepare-migration.input'
import { ClaimMigrationOutput } from './outputs/claim-migration.output'
import { PrepareMigrationOutput } from './outputs/prepare-migration.output'
import { CreateFormService } from './services/create-form.service'

describe('Form migration', () => {
  let testingApp: TestingApp
  let userFixtureFactory: UserFixtureFactory

  let authUser1: AuthFixtureUser
  let authUser2: AuthFixtureUser
  let guestUser1: GuestFixtureUser
  let guestUser2: GuestFixtureUser

  let createFormService: CreateFormService
  let formsFixtureRepository: FormsFixtureRepository
  let formMigrationsFixtureRepository: FormMigrationsFixtureRepository

  const createdForms: string[] = []
  const createdMigrations: {
    cognitoAuthSub: string
    cognitoGuestIdentityId: string
  }[] = []

  beforeAll(async () => {
    userFixtureFactory = new UserFixtureFactory()

    authUser1 = userFixtureFactory.createFoAuthUser()
    authUser2 = userFixtureFactory.createFoAuthUser()
    guestUser1 = userFixtureFactory.createGuestUser()
    guestUser2 = userFixtureFactory.createGuestUser()

    const moduleRef = await userFixtureFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module],
        }),
      )
      .compile()

    testingApp = await initializeTestingApp(moduleRef)
    createFormService = testingApp.app.get(CreateFormService)
    formsFixtureRepository = new FormsFixtureRepository(moduleRef)
    formMigrationsFixtureRepository = new FormMigrationsFixtureRepository(
      moduleRef,
    )
  })

  afterEach(() => {
    testingApp.afterEach()
  })

  afterAll(async () => {
    await formsFixtureRepository.deleteMany(createdForms)
    await formMigrationsFixtureRepository.deleteMany(createdMigrations)
    await testingApp.afterAll()
  })

  describe('Prepare Migration', () => {
    it('should prepare migration for guest user with existing forms', async () => {
      const form = await createFormService.createForm(
        {
          formDefinitionSlug: 'zavazne-stanovisko-k-investicnej-cinnosti',
        },
        guestUser1.user,
      )
      createdForms.push(form.id)

      const prepareMigrationBody: PrepareMigrationInput = {
        guestIdentityId: guestUser1.identityId,
      }

      const response =
        await testingApp.axiosClient.post<PrepareMigrationOutput>(
          '/forms/migrations/prepare',
          prepareMigrationBody,
          { headers: authUser1.headers },
        )

      expect(response.status).toBe(201)
      expect(response.data).toEqual({
        success: true,
      })

      createdMigrations.push({
        cognitoAuthSub: authUser1.sub,
        cognitoGuestIdentityId: guestUser1.identityId,
      })

      const migrations =
        await formMigrationsFixtureRepository.findByGuestAndAuth(
          guestUser1.identityId,
          authUser1.sub,
        )
      expect(migrations).toHaveLength(1)
      expect(migrations[0].cognitoAuthSub).toBe(authUser1.sub)
      expect(migrations[0].cognitoGuestIdentityId).toBe(guestUser1.identityId)
      expect(migrations[0].expiresAt).toBeInstanceOf(Date)
      expect(migrations[0].expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('should return false for guest user with no forms', async () => {
      const prepareMigrationBody: PrepareMigrationInput = {
        guestIdentityId: guestUser2.identityId,
      }

      const response =
        await testingApp.axiosClient.post<PrepareMigrationOutput>(
          '/forms/migrations/prepare',
          prepareMigrationBody,
          { headers: authUser2.headers },
        )

      expect(response.status).toBe(201)
      expect(response.data).toEqual({
        success: true,
      })

      const migrations =
        await formMigrationsFixtureRepository.findByGuestAndAuth(
          guestUser2.identityId,
          authUser2.sub,
        )
      expect(migrations).toHaveLength(0)
    })
  })

  describe('Claim Migration', () => {
    it('should claim migration and transfer form ownership', async () => {
      const form = await createFormService.createForm(
        {
          formDefinitionSlug: 'zavazne-stanovisko-k-investicnej-cinnosti',
        },
        guestUser1.user,
      )
      createdForms.push(form.id)

      const prepareMigrationBody: PrepareMigrationInput = {
        guestIdentityId: guestUser1.identityId,
      }

      await testingApp.axiosClient.post<PrepareMigrationOutput>(
        '/forms/migrations/prepare',
        prepareMigrationBody,
        { headers: authUser1.headers },
      )

      createdMigrations.push({
        cognitoAuthSub: authUser1.sub,
        cognitoGuestIdentityId: guestUser1.identityId,
      })

      const claimMigrationBody: ClaimMigrationInput = {
        formId: form.id,
      }

      const response = await testingApp.axiosClient.post<ClaimMigrationOutput>(
        '/forms/migrations/claim',
        claimMigrationBody,
        { headers: authUser1.headers },
      )

      expect(response.status).toBe(201)
      expect(response.data).toEqual({
        success: true,
      })

      const updatedForm = await formsFixtureRepository.get(form.id)
      expect(updatedForm).toBeTruthy()
      expect(updatedForm?.userExternalId).toBe(authUser1.sub)
      expect(updatedForm?.cognitoGuestIdentityId).toBeNull()
    })

    it("should fail when user tries to claim another user's form", async () => {
      const form = await createFormService.createForm(
        {
          formDefinitionSlug: 'zavazne-stanovisko-k-investicnej-cinnosti',
        },
        guestUser1.user,
      )
      createdForms.push(form.id)

      const prepareMigrationBody: PrepareMigrationInput = {
        guestIdentityId: guestUser1.identityId,
      }

      await testingApp.axiosClient.post<PrepareMigrationOutput>(
        '/forms/migrations/prepare',
        prepareMigrationBody,
        { headers: authUser1.headers },
      )

      createdMigrations.push({
        cognitoAuthSub: authUser1.sub,
        cognitoGuestIdentityId: guestUser1.identityId,
      })

      const claimMigrationBody: ClaimMigrationInput = {
        formId: form.id,
      }

      const response = await testingApp.axiosClient.post<ClaimMigrationOutput>(
        '/forms/migrations/claim',
        claimMigrationBody,
        { headers: authUser2.headers },
      )

      expect(response.status).toBe(400)

      const unchangedForm = await formsFixtureRepository.get(form.id)
      expect(unchangedForm?.cognitoGuestIdentityId).toBe(guestUser1.identityId)
      expect(unchangedForm?.userExternalId).toBeNull()
    })

    it('should fail when trying to claim with expired migration', async () => {
      const form = await createFormService.createForm(
        {
          formDefinitionSlug: 'zavazne-stanovisko-k-investicnej-cinnosti',
        },
        guestUser2.user,
      )
      createdForms.push(form.id)

      const prepareMigrationBody: PrepareMigrationInput = {
        guestIdentityId: guestUser2.identityId,
      }

      await testingApp.axiosClient.post<PrepareMigrationOutput>(
        '/forms/migrations/prepare',
        prepareMigrationBody,
        { headers: authUser2.headers },
      )

      createdMigrations.push({
        cognitoAuthSub: authUser2.sub,
        cognitoGuestIdentityId: guestUser2.identityId,
      })

      await formMigrationsFixtureRepository.expireMigration(
        authUser2.sub,
        guestUser2.identityId,
      )

      const claimMigrationBody: ClaimMigrationInput = {
        formId: form.id,
      }

      const response = await testingApp.axiosClient.post<ClaimMigrationOutput>(
        '/forms/migrations/claim',
        claimMigrationBody,
        { headers: authUser2.headers },
      )

      expect(response.status).toBe(400)

      const unchangedForm = await formsFixtureRepository.get(form.id)
      expect(unchangedForm!.cognitoGuestIdentityId).toBe(guestUser2.identityId)
      expect(unchangedForm!.userExternalId).toBeNull()
    })
  })
})
