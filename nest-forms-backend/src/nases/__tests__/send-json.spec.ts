import { randomUUID } from 'node:crypto'

import { Test, TestingModule } from '@nestjs/testing'
import { Forms } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import ConvertService from '../../convert/convert.service'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import NasesUtilsService from '../utils-services/tokens.nases.service'

/* eslint-disable no-secrets/no-secrets, pii/no-phone-number, unicorn/no-thenable */
const formDataJson = {
  stavba: {
    stavbaDruh: 'Inžinierska stavba',
    stavbaNazov: 'consequat nostrud sint mollit cupidatat',
    stavbaUlica: 'est Excepteur velit',
    stavbaParcela: 'irure dolore enim',
    stavbaKataster: ['Vinohrady', 'Jarovce', 'Trnávka'],
    stavbaSupisneCislo: 12,
  },
  konanie: {
    konanieTyp: 'Zmena v užívaní stavby',
    stavbaPisomnosti: ['dolor'],
    ziadostOdovodnenie: 'Dodatočné povolenie zmeny stavby pred dokončením',
    stavbaFotodokumentacia: [
      'ex aute quis',
      'elit',
      'anim culpa aliqua',
      'sunt adipisicing commodo esse',
    ],
  },
  prilohy: { projektovaDokumentacia: ['velit cupidatat'] },
  investor: {
    investorEmail: '2MaBGWXMLFrPm@yCSKRaPTRCsNJxcvOeOJTxGqfWOLIp.ddso',
    splnomocnenie: [
      'do aute consectetur laborum',
      'consectetur deserunt est magna',
    ],
    investorTelefon: '+8',
    investorMestoPsc: { investorPsc: 'officia', investorMesto: 'BZtdlUzeDlT' },
    investorZiadatelom: true,
    investorAdresaPobytu: 'consectetur aute adipisicing sunt sed',
  },
  ziadatel: {
    ziadatelIco: 1234,
    ziadatelTyp: 'Fyzická osoba - podnikateľ',
    ziadatelEmail: 'S9uh2gQDQSfTG@OSE.elh',
    ziadatelTelefon: '005736572756',
    ziadatelMestoPsc: {
      ziadatelPsc: 'proident adipisicing ullamco sed',
      ziadatelMesto: 'tOsmUQ',
    },
    ziadatelAdresaSidla: 'minim in Duis sit',
    ziadatelAdresaPobytu: 'pariatur',
    ziadatelObchodneMeno: 'id occaecat',
    ziadatelKontaktnaOsoba: 'enim',
    ziadatelMenoPriezvisko: 'Meno Priezvisko',
    ziadatelMiestoPodnikania: 'tempor ut laboris',
  },
  projektant: {
    projektantEmail: 'GLw-PwV8N09YLw@qcTXcoeGGCADjdtbRmDRnuErhnSJY.jcp',
    datumSpracovania: '1997-12-29',
    projektantTelefon: '00221166',
    autorizacneOsvedcenie: 'Lorem magna eu',
    projektantMenoPriezvisko: 'Meno Priezvisko',
  },
}

/* eslint-enable no-secrets/no-secrets, pii/no-phone-number, unicorn/no-thenable */

/*
You must have these .env variables set correctly:
- SLOVENSKO_SK_CONTAINER_URI
- API_TOKEN_PRIVATE
- OBO_TOKEN_PUBLIC
- SUB_NASES_TECHNICAL_ACCOUNT
- HTTP_BASIC_USER
- HTTP_BASIC_PASS
- NASES_RECIPIENT_URI
*/

describe('SendJsonToNases', () => {
  let service: NasesUtilsService

  beforeEach(async () => {
    jest.resetAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        NasesUtilsService,
        { provide: PrismaService, useValue: prismaMock },
        ThrowerErrorGuard,
        ConvertService,
      ],
    }).compile()

    service = app.get<NasesUtilsService>(NasesUtilsService)
  })

  it('should send form to Nases correctly', async () => {
    const jwt = service.createTechnicalAccountJwtToken()
    const messageId = randomUUID()
    // eslint-disable-next-line no-console
    console.log('Sending test json with messageId:', messageId)

    const response = await service.sendMessageNases(jwt, {
      id: messageId,
      formDataJson,
    } as unknown as Forms)
    expect(response.status).toBe(200)
  })
})
