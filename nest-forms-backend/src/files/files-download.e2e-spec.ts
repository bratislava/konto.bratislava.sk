import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'

import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import jwt from 'jsonwebtoken'
import { Client } from 'minio'
import nock from 'nock'
import type {
  ScanFileDto,
  ScanFileResponseDto,
} from 'openapi-clients/clamav-scanner'

import {
  AuthFixtureUser,
  FixtureUser,
  GuestFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { expectAny } from '../__tests__/matchers'
import { AppV2Module } from '../app-v2.module'
import AuthModule from '../auth/auth.module'
import BaConfigService from '../config/ba-config.service'
import { CreateFormOutput } from '../forms-v2/outputs/create-form.output'
import { FileStatus } from '../generated/prisma/client'
import { MinioClientService } from '../minio-client/minio-client.service'
import PrismaService from '../prisma/prisma.service'
import { DownloadTokenResponseDataDto, PostFileResponseDto } from './files.dto'
import FilesModule from './files.module'

const FORM_DEFINITION_SLUG = 'zavazne-stanovisko-k-investicnej-cinnosti'
const FILE_CONTENT = 'file content'
const PNG_UPLOAD = { mimeType: 'image/png', originalName: 'upload.png' }
const PDF_UPLOAD = { mimeType: 'application/pdf', originalName: 'upload.pdf' }

interface Upload {
  mimeType: string
  originalName: string
  fileName: string
}

type RequestHeaders = FixtureUser['headers'] | Record<string, never>

describe('Files download', () => {
  let testingApp: TestingApp
  let prismaService: PrismaService
  let baConfigService: BaConfigService
  let owner: AuthFixtureUser
  let otherAuthUser: AuthFixtureUser
  let otherGuestUser: GuestFixtureUser
  let basicAuth: { username: string; password: string }
  // nock cannot intercept minio requests, as it parses object names starting with '/' as protocol-relative URLs
  const putObject = vi.fn<Client['putObject']>()
  const getObject = vi.fn<Client['getObject']>()
  const createdFormIds: string[] = []
  const nonOwnerUsers = [
    {
      userName: 'unauthenticated user',
      getHeaders: (): RequestHeaders => ({}),
      status: HttpStatus.UNAUTHORIZED,
    },
    {
      userName: 'other auth user',
      getHeaders: (): RequestHeaders => otherAuthUser.headers,
      status: HttpStatus.FORBIDDEN,
    },
    {
      userName: 'other guest user',
      getHeaders: (): RequestHeaders => otherGuestUser.headers,
      status: HttpStatus.FORBIDDEN,
    },
  ]

  beforeAll(async () => {
    const userFixtureFactory = new UserFixtureFactory()
    owner = userFixtureFactory.createFoAuthUser()
    otherAuthUser = userFixtureFactory.createFoAuthUser()
    otherGuestUser = userFixtureFactory.createGuestUser()

    const moduleRef = await userFixtureFactory
      .setupMockAuth(
        Test.createTestingModule({
          imports: [AppV2Module, AuthModule, FilesModule],
        }),
      )
      .overrideProvider(MinioClientService)
      .useValue({ client: () => ({ putObject, getObject }) })
      .compile()

    testingApp = await initializeTestingApp(moduleRef)
    prismaService = moduleRef.get(PrismaService)
    baConfigService = moduleRef.get(BaConfigService)
    basicAuth = {
      username: baConfigService.self.username,
      password: baConfigService.self.password,
    }
  })

  beforeEach(() => {
    putObject.mockResolvedValue({ etag: 'etag', versionId: null })
  })

  afterEach(() => {
    testingApp.afterEach()
    vi.resetAllMocks()
  })

  afterAll(async () => {
    await prismaService.files.deleteMany({
      where: { formId: { in: createdFormIds } },
    })
    await prismaService.forms.deleteMany({
      where: { id: { in: createdFormIds } },
    })
    await testingApp.afterAll()
  })

  const createForm = async (user: FixtureUser): Promise<string> => {
    const response = await testingApp.axiosClient.post<CreateFormOutput>(
      '/forms-v2/',
      { formDefinitionSlug: FORM_DEFINITION_SLUG },
      { headers: user.headers },
    )
    expect(response.status).toBe(HttpStatus.CREATED)
    createdFormIds.push(response.data.formId)
    return response.data.formId
  }

  const mockScanner = () => {
    nock(baConfigService.scannerBackend.url)
      .post(
        '/api/scan/file',
        (body: ScanFileDto) =>
          body.bucketUid === baConfigService.minio.buckets.unscanned,
      )
      .reply(HttpStatus.OK, {
        id: randomUUID(),
        fileUid: 'file-uid',
        status: 'ACCEPTED',
        message: 'File accepted for scanning.',
      } satisfies ScanFileResponseDto)
  }

  const postUpload = async (
    formId: string,
    upload: Upload,
    headers: RequestHeaders,
  ) => {
    const formData = new FormData()
    formData.append('id', randomUUID())
    formData.append('filename', upload.fileName)
    formData.append(
      'file',
      new Blob([FILE_CONTENT], { type: upload.mimeType }),
      upload.originalName,
    )
    return testingApp.axiosClient.post<PostFileResponseDto>(
      `/files/upload/${formId}`,
      formData,
      { headers },
    )
  }

  const updateFileStatus = async (
    scannerId: string,
    status: FileStatus,
    auth?: { username: string; password: string },
  ) =>
    testingApp.axiosClient.patch(
      `/files/scan/${scannerId}`,
      { status },
      { auth },
    )

  const getDownloadToken = async (
    formId: string,
    fileId: string,
    headers: RequestHeaders,
  ) =>
    testingApp.axiosClient.get<DownloadTokenResponseDataDto>(
      `/files/download/jwt/${formId}/${fileId}`,
      { headers },
    )

  const downloadFile = async (token: string) =>
    testingApp.axiosClient.get<string>(`/files/download/file/${token}`, {
      responseType: 'text',
    })

  /**
   * Uploads a file to the owner's form the way the frontend does, and sends it to the scanner.
   */
  const uploadFile = async (upload: Upload) => {
    const formId = await createForm(owner)

    mockScanner()
    const response = await postUpload(formId, upload, owner.headers)
    expect(response.status).toBe(HttpStatus.CREATED)
    const { id: fileId, scannerId } = response.data
    if (!scannerId) {
      throw new Error('File was not sent to the scanner')
    }

    return { formId, fileId, scannerId }
  }

  /**
   * Uploads a file and marks it SAFE the way the scanner does.
   */
  const uploadSafeFile = async (upload: Upload) => {
    const { formId, fileId, scannerId } = await uploadFile(upload)

    const response = await updateFileStatus(
      scannerId,
      FileStatus.SAFE,
      basicAuth,
    )
    expect(response.status).toBe(HttpStatus.OK)

    return { formId, fileId }
  }

  describe('content headers', () => {
    it.each([
      {
        upload: { ...PNG_UPLOAD, fileName: 'photo.png' },
        contentType: 'image/png',
        contentDisposition: 'inline; filename=photo.png',
      },
      {
        upload: { ...PNG_UPLOAD, fileName: 'photo.JPG' },
        contentType: 'image/jpeg',
        contentDisposition: 'inline; filename=photo.JPG',
      },
      {
        upload: { ...PDF_UPLOAD, fileName: 'document.pdf' },
        contentType: 'application/pdf',
        contentDisposition: 'attachment; filename=document.pdf',
      },
      {
        upload: { ...PNG_UPLOAD, fileName: 'page.html' },
        contentType: 'text/html; charset=utf-8',
        contentDisposition: 'attachment; filename=page.html',
      },
      {
        upload: { ...PNG_UPLOAD, fileName: 'text/html' },
        contentType: 'application/octet-stream',
        contentDisposition: 'attachment; filename="text/html"',
      },
      {
        upload: { ...PNG_UPLOAD, fileName: 'no-extension' },
        contentType: 'application/octet-stream',
        contentDisposition: 'attachment; filename=no-extension',
      },
    ])(
      'should serve $upload.fileName as $contentType with $contentDisposition',
      async ({ upload, contentType, contentDisposition }) => {
        const { formId, fileId } = await uploadSafeFile(upload)
        const tokenResponse = await getDownloadToken(
          formId,
          fileId,
          owner.headers,
        )
        expect(tokenResponse.status).toBe(HttpStatus.OK)
        getObject.mockResolvedValueOnce(Readable.from([FILE_CONTENT]))

        const response = await downloadFile(tokenResponse.data.jwt)

        expect(response.status).toBe(HttpStatus.OK)
        expect(response.data).toBe(FILE_CONTENT)
        expect(response.headers).toMatchObject({
          'content-type': contentType,
          'content-disposition': contentDisposition,
          'x-content-type-options': 'nosniff',
          'access-control-expose-headers': 'Content-Disposition',
        })
        const [[, minioPath]] = putObject.mock.calls
        expect(putObject).toHaveBeenCalledWith(
          baConfigService.minio.buckets.unscanned,
          minioPath,
          expectAny(Buffer),
        )
        expect(getObject).toHaveBeenCalledWith(
          baConfigService.minio.buckets.safe,
          minioPath,
        )
      },
    )
  })

  describe('upload access', () => {
    it('should reject an svg file', async () => {
      const formId = await createForm(owner)

      const response = await postUpload(
        formId,
        {
          mimeType: 'image/svg+xml',
          originalName: 'drawing.svg',
          fileName: 'drawing.svg',
        },
        owner.headers,
      )

      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
      expect(putObject).not.toHaveBeenCalled()
    })

    it.each(nonOwnerUsers)(
      'should not allow $userName to upload a file to the form',
      async ({ getHeaders, status }) => {
        const formId = await createForm(owner)

        const response = await postUpload(
          formId,
          { ...PNG_UPLOAD, fileName: 'photo.png' },
          getHeaders(),
        )

        expect(response.status).toBe(status)
        expect(putObject).not.toHaveBeenCalled()
      },
    )
  })

  describe('file status update access', () => {
    it.each([
      { authName: 'no credentials', auth: undefined },
      {
        authName: 'wrong credentials',
        auth: { username: 'wrong', password: 'wrong' },
      },
    ])('should not allow $authName to update file status', async ({ auth }) => {
      const { fileId, scannerId } = await uploadFile({
        ...PNG_UPLOAD,
        fileName: 'photo.png',
      })

      const response = await updateFileStatus(scannerId, FileStatus.SAFE, auth)

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      const file = await prismaService.files.findUnique({
        where: { id: fileId },
      })
      expect(file?.status).toBe(FileStatus.ACCEPTED)
    })
  })

  describe('download token access', () => {
    it.each(nonOwnerUsers)(
      'should not issue a download token to $userName',
      async ({ getHeaders, status }) => {
        const { formId, fileId } = await uploadSafeFile({
          ...PNG_UPLOAD,
          fileName: 'photo.png',
        })

        const response = await getDownloadToken(formId, fileId, getHeaders())

        expect(response.status).toBe(status)
      },
    )

    it('should not issue a download token for a file of another form', async () => {
      const { fileId } = await uploadSafeFile({
        ...PNG_UPLOAD,
        fileName: 'photo.png',
      })
      const otherUserFormId = await createForm(otherAuthUser)

      const response = await getDownloadToken(
        otherUserFormId,
        fileId,
        otherAuthUser.headers,
      )

      expect(response.status).toBe(HttpStatus.NOT_FOUND)
    })
  })

  describe('download access', () => {
    it.each([
      { tokenName: 'malformed token', getToken: () => 'invalid-token' },
      {
        tokenName: 'token signed with another secret',
        getToken: (fileId: string) => jwt.sign({ fileId }, randomUUID()),
      },
      {
        tokenName: 'expired token',
        getToken: (fileId: string) =>
          jwt.sign(
            { fileId, exp: Math.floor(Date.now() / 1000) - 1 },
            baConfigService.tokens.jwtSecret,
          ),
      },
    ])('should not download a file with $tokenName', async ({ getToken }) => {
      const { fileId } = await uploadSafeFile({
        ...PNG_UPLOAD,
        fileName: 'photo.png',
      })

      const response = await downloadFile(getToken(fileId))

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      expect(getObject).not.toHaveBeenCalled()
    })
  })
})
