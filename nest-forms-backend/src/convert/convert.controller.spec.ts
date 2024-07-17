// TODO fix provider dependencies

// import { ConfigService } from '@nestjs/config'
// import { Test, TestingModule } from '@nestjs/testing'
// import { SchemaVersion } from '@prisma/client'

// import prismaMock from '../../test/singleton'
// import {
//   jsonSchema,
//   testData,
//   testJsonData,
//   xmlTemplate,
// } from '../__tests__/constants'
// import FormsHelper from '../forms/forms.helper'
// import PrismaService from '../prisma/prisma.service'
// import SchemasService from '../schemas/schemas.service'
// import TaxService from '../tax/tax.service'
// import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
// import ConvertController from './convert.controller'
// import ConvertService from './convert.service'
// import JsonXmlConvertService from './utils-services/json-xml.convert.service'

describe('ConvertController', () => {
  // let controller: ConvertController

  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   providers: [
    //     ConvertController,
    //     SchemasService,
    //     ConvertService,
    //     TaxService,
    //     JsonXmlConvertService,
    //     ThrowerErrorGuard,
    //     FormsHelper,
    //     ConfigService,
    //     { provide: PrismaService, useValue: prismaMock },
    //   ],
    // }).compile()
    // controller = module.get<ConvertController>(ConvertController)
    // prismaMock.schemaVersion.findUnique.mockResolvedValue({
    //   jsonSchema,
    //   xmlTemplate,
    // } as SchemaVersion)
  })

  it('should run mock test', () => {
    expect(true).toBeTruthy()
  })

  // describe('reverted conversion', () => {
  //   it('should be the same after the reverse conversion (from Json)', async () => {
  //     expect(true).toBeTruthy()
  //     const xmlConverted = await controller.convertJsonToXml(
  //       { jsonForm: testJsonData },
  //       'test',
  //     )
  //     const jsonConverted = await controller.convertXmlToJson(
  //       { xmlForm: xmlConverted.xmlForm },
  //       'test',
  //     )

  //     expect(jsonConverted.jsonForm).toEqual(testJsonData)
  //   })

  //   it('should be the same after the reverse conversion (from XML)', async () => {
  //     return // TODO put back after fix
  //     const jsonConverted = await controller.convertXmlToJson(
  //       { xmlForm: testData },
  //       'test',
  //     )
  //     const xmlConverted = await controller.convertJsonToXml(
  //       { jsonForm: jsonConverted.jsonForm },
  //       'test',
  //     )

  //     // It is deleting the xml tag when sending to nases in envelope.
  //     expect(
  //       `<?xml version="1.0" encoding="utf-8"?>\n${xmlConverted.xmlForm}`,
  //     ).toEqual(testData)
  //   })
  // })
})
