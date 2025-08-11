import { Controller, Get, UseGuards } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Forms } from '@prisma/client'

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
import { AllowedUserTypes } from '../auth-v2/decorators/allowed-user-types.decorator'
import { UserAuthGuard } from '../auth-v2/guards/user-auth.guard'
import { UserType } from '../auth-v2/types/user'
import {
  FormAccessAllowMigrations,
  FormAccessGuard,
  GetFormAccessType,
} from './guards/form-access.guard'
import { CreateFormService } from './services/create-form.service'
import {
  FormAccessService,
  FormAccessType,
} from './services/form-access.service'
import { FormMigrationsService } from './services/form-migrations.service'

@Controller('test-form-access-e2e')
class TestFormAccessController {
  @Get('access/:formId')
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  getFormAccessDefault(@GetFormAccessType() accessType: FormAccessType) {
    return { accessType }
  }

  @Get('access-with-migration/:formId')
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @FormAccessAllowMigrations()
  getFormAccessWithMigration(@GetFormAccessType() accessType: FormAccessType) {
    return { accessType }
  }

  @Get('access-no-param')
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  getFormAccessNoParam(@GetFormAccessType() accessType: FormAccessType) {
    return { accessType }
  }

  @Get('access-no-guard/:formId')
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard)
  getFormAccessNoGuard(@GetFormAccessType() accessType: FormAccessType) {
    return { accessType }
  }

  @Get('access-no-auth/:formId')
  @UseGuards(FormAccessGuard)
  getFormAccessNoAuth(@GetFormAccessType() accessType: FormAccessType) {
    return { accessType }
  }
}

describe('Form access', () => {
  let testingApp: TestingApp
  let userFixtureFactory: UserFixtureFactory
  let formsFixtureRepository: FormsFixtureRepository
  let formMigrationsFixtureRepository: FormMigrationsFixtureRepository
  let createFormService: CreateFormService
  let formAccessService: FormAccessService
  let formMigrationsService: FormMigrationsService

  let authUser1: AuthFixtureUser
  let authUser2: AuthFixtureUser
  let guestUser1: GuestFixtureUser
  let guestUser2: GuestFixtureUser
  let authUserWithIcoCommon1: AuthFixtureUser
  let authUserWithIcoCommon2: AuthFixtureUser
  let authUserWithIcoUnique: AuthFixtureUser

  let formForAuthUser1: Forms
  let formForGuestUser1: Forms
  let formForGuestUser2: Forms
  let formForAuthUserWithIcoCommon1: Forms

  const createdFormIds: string[] = []
  const createdMigrations: {
    cognitoAuthSub: string
    cognitoGuestIdentityId: string
  }[] = []

  const formDefinitionSlug = 'zavazne-stanovisko-k-investicnej-cinnosti'

  beforeAll(async () => {
    userFixtureFactory = new UserFixtureFactory()

    authUser1 = userFixtureFactory.createFoAuthUser()
    authUser2 = userFixtureFactory.createFoAuthUser()
    guestUser1 = userFixtureFactory.createGuestUser()
    guestUser2 = userFixtureFactory.createGuestUser()

    const commonIco = userFixtureFactory.generateRandomIco()
    const uniqueIco = userFixtureFactory.generateRandomIco()

    authUserWithIcoCommon1 = userFixtureFactory.createPoAuthUser({
      ico: commonIco,
    })
    authUserWithIcoCommon2 = userFixtureFactory.createPoAuthUser({
      ico: commonIco,
    })
    authUserWithIcoUnique = userFixtureFactory.createPoAuthUser({
      ico: uniqueIco,
    })

    const moduleRef = await userFixtureFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module],
          controllers: [TestFormAccessController],
        }),
      )
      .compile()

    testingApp = await initializeTestingApp(moduleRef)
    formsFixtureRepository = new FormsFixtureRepository(moduleRef)
    formMigrationsFixtureRepository = new FormMigrationsFixtureRepository(
      moduleRef,
    )
    createFormService = testingApp.app.get(CreateFormService)
    formAccessService = testingApp.app.get(FormAccessService)
    formMigrationsService = testingApp.app.get(FormMigrationsService)

    formForAuthUser1 = await createFormService.createForm(
      { formDefinitionSlug },
      authUser1.user,
    )
    createdFormIds.push(formForAuthUser1.id)

    formForGuestUser1 = await createFormService.createForm(
      { formDefinitionSlug },
      guestUser1.user,
    )
    createdFormIds.push(formForGuestUser1.id)

    formForGuestUser2 = await createFormService.createForm(
      { formDefinitionSlug },
      guestUser2.user,
    )
    createdFormIds.push(formForGuestUser2.id)

    formForAuthUserWithIcoCommon1 = await createFormService.createForm(
      { formDefinitionSlug },
      authUserWithIcoCommon1.user,
    )
    createdFormIds.push(formForAuthUserWithIcoCommon1.id)

    await formMigrationsService.prepareMigration(
      authUser1.user,
      guestUser1.identityId,
    )
    createdMigrations.push({
      cognitoAuthSub: authUser1.sub,
      cognitoGuestIdentityId: guestUser1.identityId,
    })

    await formMigrationsService.prepareMigration(
      authUser2.user,
      guestUser2.identityId,
    )
    createdMigrations.push({
      cognitoAuthSub: authUser2.sub,
      cognitoGuestIdentityId: guestUser2.identityId,
    })
    await formMigrationsFixtureRepository.expireMigration(
      authUser2.sub,
      guestUser2.identityId,
    )
  })

  afterEach(() => {
    testingApp.afterEach()
  })

  afterAll(async () => {
    await formsFixtureRepository.deleteMany(createdFormIds)
    await formMigrationsFixtureRepository.deleteMany(createdMigrations)
    await testingApp.afterAll()
  })

  describe('Error Handling & Invalid Requests', () => {
    it('should return 400 if formId path parameter is missing', async () => {
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access-no-param`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(400)
      expect(response.data.message).toContain(
        'formId path parameter is required',
      )
    })

    it('should throw InternalServerErrorException when GetFormAccessType is used without FormAccessGuard', async () => {
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access-no-guard/${formForAuthUser1.id}`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(500)
      expect(response.data.message).toContain(
        'Form access type not found. Make sure to use FormAccessGuard before accessing this parameter.',
      )
    })

    it('should throw BadRequestException when FormAccessGuard is used without UserAuthGuard', async () => {
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access-no-auth/${formForAuthUser1.id}`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(400)
      expect(response.data.message).toContain('User not found')
    })

    it('should throw NotFoundException for non-existent formId', async () => {
      const nonExistentFormId = '00000000-0000-0000-0000-000000000000'

      // Service should throw NotFoundException
      await expect(
        formAccessService.checkAccessById(nonExistentFormId, authUser1.user),
      ).rejects.toThrow(`Form with id ${nonExistentFormId} not found`)

      // Guard should propagate the error
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${nonExistentFormId}`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(404)
    })
  })

  describe('Direct User Access', () => {
    it('should allow auth user to access their own form (Service & Guard)', async () => {
      // Service - check by ID
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUser1.id,
        authUser1.user,
      )
      expect(serviceAccess).toEqual({
        hasAccess: true,
        accessType: FormAccessType.UserAccess,
      })

      // Service - check by instance
      const checkAccessResult = await formAccessService.checkAccessByInstance(
        formForAuthUser1,
        authUser1.user,
      )
      expect(checkAccessResult).toEqual({
        hasAccess: true,
        accessType: FormAccessType.UserAccess,
      })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForAuthUser1.id}`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(200)
      expect(response.data.accessType).toBe(FormAccessType.UserAccess)
    })

    it('should deny different auth user access to form (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUser1.id,
        authUser2.user,
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForAuthUser1.id}`,
        { headers: authUser2.headers },
      )
      expect(response.status).toBe(403)
    })

    it('should deny guest user access to auth user form (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUser1.id,
        guestUser1.user,
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForAuthUser1.id}`,
        { headers: guestUser1.headers },
      )
      expect(response.status).toBe(403)
    })
  })

  describe('Guest Identity Access', () => {
    it('should allow guest user to access their own form (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForGuestUser1.id,
        guestUser1.user,
      )
      expect(serviceAccess).toEqual({
        hasAccess: true,
        accessType: FormAccessType.GuestIdentity,
      })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForGuestUser1.id}`,
        { headers: guestUser1.headers },
      )
      expect(response.status).toBe(200)
      expect(response.data.accessType).toBe(FormAccessType.GuestIdentity)
    })

    it('should deny different guest user access to form (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForGuestUser1.id,
        guestUser2.user,
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForGuestUser1.id}`,
        { headers: guestUser2.headers },
      )
      expect(response.status).toBe(403)
    })

    it('should deny auth user access to guest form without migration check (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForGuestUser1.id,
        authUser1.user,
        { checkMigrations: false },
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForGuestUser1.id}`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(403)
    })
  })

  describe('ICO Access', () => {
    it('should allow auth user with ICO to access their own form as UserAccess (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUserWithIcoCommon1.id,
        authUserWithIcoCommon1.user,
      )
      expect(serviceAccess).toEqual({
        hasAccess: true,
        accessType: FormAccessType.UserAccess, // should return UserAccess since they're the owner
      })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForAuthUserWithIcoCommon1.id}`,
        { headers: authUserWithIcoCommon1.headers },
      )
      expect(response.status).toBe(200)
      expect(response.data.accessType).toBe(FormAccessType.UserAccess) // should return UserAccess since they're the owner
    })

    it('should allow auth user with same ICO to access form as IcoAccess (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUserWithIcoCommon1.id,
        authUserWithIcoCommon2.user,
      )
      expect(serviceAccess).toEqual({
        hasAccess: true,
        accessType: FormAccessType.Ico,
      })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForAuthUserWithIcoCommon1.id}`,
        { headers: authUserWithIcoCommon2.headers },
      )
      expect(response.status).toBe(200)
      expect(response.data.accessType).toBe(FormAccessType.Ico)
    })

    it('should deny auth user with different ICO access to form (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUserWithIcoCommon1.id,
        authUserWithIcoUnique.user,
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForAuthUserWithIcoCommon1.id}`,
        { headers: authUserWithIcoUnique.headers },
      )
      expect(response.status).toBe(403)
    })

    it('should deny auth user with no ICO access to ICO form (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUserWithIcoCommon1.id,
        authUser1.user,
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForAuthUserWithIcoCommon1.id}`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(403)
    })
  })

  describe('Migration Access', () => {
    it('should allow auth user with valid migration to access guest form with checkMigrations=true (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForGuestUser1.id,
        authUser1.user,
        { checkMigrations: true },
      )
      expect(serviceAccess).toEqual({
        hasAccess: true,
        accessType: FormAccessType.Migration,
      })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access-with-migration/${formForGuestUser1.id}`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(200)
      expect(response.data.accessType).toBe(FormAccessType.Migration)
    })

    it('should deny auth user with valid migration access to guest form with checkMigrations=false (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForGuestUser1.id,
        authUser1.user,
        { checkMigrations: false },
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access/${formForGuestUser1.id}`,
        { headers: authUser1.headers },
      )
      expect(response.status).toBe(403)
    })

    it('should deny auth user with no migration access to guest form even with checkMigrations=true (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForGuestUser1.id,
        authUser2.user,
        { checkMigrations: true },
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access-with-migration/${formForGuestUser1.id}`,
        { headers: authUser2.headers },
      )
      expect(response.status).toBe(403)
    })

    it('should deny auth user access to guest form if migration is expired (Service & Guard)', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForGuestUser2.id,
        authUser2.user,
        { checkMigrations: true },
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access-with-migration/${formForGuestUser2.id}`,
        { headers: authUser2.headers },
      )
      expect(response.status).toBe(403)
    })
  })

  describe('Access Priority and Edge Cases', () => {
    it('should prioritize UserAccess over IcoAccess for form owner', async () => {
      // The owner should get UserAccess, not IcoAccess, even if they have an ICO
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUserWithIcoCommon1.id,
        authUserWithIcoCommon1.user,
      )
      expect(serviceAccess).toEqual({
        hasAccess: true,
        accessType: FormAccessType.UserAccess,
      })
    })

    it('should verify that guest users cannot access auth user forms even with checkMigrations=true', async () => {
      // Service
      const serviceAccess = await formAccessService.checkAccessById(
        formForAuthUser1.id,
        guestUser1.user,
        { checkMigrations: true },
      )
      expect(serviceAccess).toEqual({ hasAccess: false })

      // Guard
      const response = await testingApp.axiosClient.get(
        `/test-form-access-e2e/access-with-migration/${formForAuthUser1.id}`,
        { headers: guestUser1.headers },
      )
      expect(response.status).toBe(403)
    })
  })

  describe('checkAccessByInstance method specific tests', () => {
    it('should work with form object', async () => {
      const result = await formAccessService.checkAccessByInstance(
        formForAuthUser1,
        authUser1.user,
      )
      expect(result).toEqual({
        hasAccess: true,
        accessType: FormAccessType.UserAccess,
      })
    })

    it('should work with partial form object', async () => {
      const partialForm = {
        formDefinitionSlug: 'mock-form-definition',
        id: formForAuthUser1.id,
        userExternalId: formForAuthUser1.userExternalId,
        cognitoGuestIdentityId: formForAuthUser1.cognitoGuestIdentityId,
        ico: formForAuthUser1.ico,
      }
      const result = await formAccessService.checkAccessByInstance(
        partialForm,
        authUser1.user,
      )
      expect(result).toEqual({
        hasAccess: true,
        accessType: FormAccessType.UserAccess,
      })
    })

    it('should deny access when form instance shows no access', async () => {
      const result = await formAccessService.checkAccessByInstance(
        formForAuthUser1,
        authUser2.user,
      )
      expect(result).toEqual({ hasAccess: false })
    })
  })

  describe('checkAccess method with form ID tests', () => {
    it('should work with form ID string', async () => {
      const result = await formAccessService.checkAccessById(
        formForAuthUser1.id,
        authUser1.user,
      )
      expect(result).toEqual({
        hasAccess: true,
        accessType: FormAccessType.UserAccess,
      })
    })

    it('should throw NotFoundException for non-existent form ID', async () => {
      const nonExistentFormId = '00000000-0000-0000-0000-000000000000'
      await expect(
        formAccessService.checkAccessById(nonExistentFormId, authUser1.user),
      ).rejects.toThrow(`Form with id ${nonExistentFormId} not found`)
    })
  })
})
