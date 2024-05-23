import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { SchemaVersion } from '@prisma/client'

import prismaMock from '../../test/singleton'
import { jsonSchema, testJsonData, xmlTemplate } from '../__tests__/constants'
import ConvertService from '../convert/convert.service'
import JsonXmlConvertService from '../convert/utils-services/json-xml.convert.service'
import FilesHelper from '../files/files.helper'
import FilesService from '../files/files.service'
import FormsHelper from '../forms/forms.helper'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import { PDF_EXPORT_FILE_NAME } from '../utils/files'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import ConvertPdfService from './convert-pdf.service'

jest.mock('../files/files.service')

describe('ConvertPdfService', () => {
  let convertPdfService: ConvertPdfService
  let filesHelper: FilesHelper
  let convertService: ConvertService
  // mocks the part of other services we're using
  const putObject = jest.fn()
  putObject.mockResolvedValue(true)
  const generatePdf = jest.fn()
  generatePdf.mockResolvedValue(true)

  // TODO create factories for test data
  const formId = 'fake-form-id'
  const pospId = 'fake-posp-id'
  const expectedPdfExportPathWithoutBucket = `${pospId}/${formId}/${PDF_EXPORT_FILE_NAME}`
  const expectedPdfExportPath = `calmav-clean-bucket/${expectedPdfExportPathWithoutBucket}`
  const fakeFile = {
    id: 'fake-data',
    pospId: 'fake-data',
    formId: 'fake-data',
    scannerId: null,
    minioFileName: 'fake-data',
    fileName: 'fake-data',
    fileSize: 1,
    status: 'SAFE',
    ginisOrder: null,
    ginisUploaded: false,
    ginisUploadedError: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsHelper,
        FormsService,
        FilesService,
        {
          provide: MinioClientSubservice,
          useValue: { client: () => ({ putObject }) },
        },
        ConvertPdfService,
        { provide: ConvertService, useValue: { generatePdf } },
        JsonXmlConvertService,
        FilesHelper,
        ConfigService,
        ScannerClientService,
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()
    convertPdfService = module.get<ConvertPdfService>(ConvertPdfService)
    filesHelper = module.get<FilesHelper>(FilesHelper)
    convertService = module.get<ConvertService>(ConvertService)

    // TODO did not find a way to mock with 'include' of schemaVersion and valid ts typing
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    prismaMock.forms.findUnique.mockResolvedValue({
      id: formId,
      formDataJson: testJsonData,
      schemaVersion: {
        jsonSchema,
        xmlTemplate,
        pospID: pospId,
      },
    } as SchemaVersion)

    // mocks default of not finding an existing file when uploading
    prismaMock.files.findMany.mockResolvedValue([])
    prismaMock.files.create.mockResolvedValue(fakeFile)
    prismaMock.files.update.mockResolvedValue(fakeFile)
    convertService.generatePdfV2 = jest
      .fn()
      .mockResolvedValue(expectedPdfExportPath)
    convertPdfService.getPdfExportFilePath = jest
      .fn()
      .mockResolvedValue(expectedPdfExportPath)

    filesHelper.upsertFileByUid = jest.fn().mockResolvedValue(fakeFile)
  })

  it('should be defined', () => {
    expect(convertPdfService).toBeDefined()
  })

  describe('get pdf file path', () => {
    it('should return correct path', async () => {
      const filePath = await convertPdfService.getPdfExportFilePath(formId)
      expect(filePath).toBe(expectedPdfExportPath)
    })
  })

  describe('convert pdf', () => {
    it('calls all services it depends on and does not explode in the process', async () => {
      const filePath = await convertPdfService.createPdfImageInFormFiles(formId)
      expect(filePath).toBe(expectedPdfExportPath)

      expect(putObject).toHaveBeenCalled()
      // TODO should this rule be disabled for tests globally ? or am I doing something wrong ?
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(convertService.generatePdfV2).toHaveBeenCalled()
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(filesHelper.upsertFileByUid).toHaveBeenCalled()
    })
  })

  // TODO test createOdfImageInFormFiles
})
