import { randomUUID } from 'node:crypto'

import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import ConvertService from '../../convert/convert.service'
import JsonXmlConvertService from '../../convert/utils-services/json-xml.convert.service'
import FormsValidator from '../../forms/forms.validator'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { FormWithSchemaAndVersion } from '../../utils/types/prisma'
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

const xmlTemplate = `<?xml version="1.0" encoding="utf-8"?>
<E-form xmlns="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1"
        xsi:schemaLocation="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Meta>
    <ID>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</ID>
    <Name>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</Name>
    <Gestor></Gestor>
    <RecipientId></RecipientId>
    <Version>0.1</Version>
    <ZepRequired>false</ZepRequired>
    <EformUuid>5ea0cad2-8759-4826-8d4c-c59c1d09ec29</EformUuid>
    <SenderID>mailto:hruska@example.com</SenderID>
  </Meta>
</E-form>`

const jsonSchema = {
  type: 'object',
  allOf: [
    {
      type: 'object',
      required: ['prilohy'],
      properties: {
        prilohy: {
          type: 'object',
          title: 'Prílohy',
          required: ['projektovaDokumentacia'],
          properties: {
            projektovaDokumentacia: {
              type: 'array',
              items: { file: true, type: 'string' },
              title: 'Projektová dokumentácia',
            },
          },
        },
      },
    },
    {
      type: 'object',
      required: ['ziadatel'],
      properties: {
        ziadatel: {
          type: 'object',
          allOf: [
            {
              if: { properties: { ziadatelTyp: { const: 'Fyzická osoba' } } },
              then: {
                required: ['ziadatelMenoPriezvisko'],
                properties: {
                  ziadatelMenoPriezvisko: {
                    type: 'string',
                    title: 'Meno a priezvisko',
                    pattern: '.*[ ].*',
                  },
                },
              },
            },
            {
              if: {
                properties: {
                  ziadatelTyp: {
                    oneOf: [
                      { const: 'Fyzická osoba - podnikateľ' },
                      { const: 'Právnicka osoba' },
                    ],
                  },
                },
              },
              then: {
                required: ['ziadatelObchodneMeno'],
                properties: {
                  ziadatelObchodneMeno: {
                    type: 'string',
                    title: 'Obchodné meno',
                  },
                },
              },
            },
            {
              if: { properties: { ziadatelTyp: { const: 'Právnicka osoba' } } },
              then: {
                required: ['ziadatelIco'],
                properties: { ziadatelIco: { type: 'number', title: 'IČO' } },
              },
            },
            {
              if: { properties: { ziadatelTyp: { const: 'Fyzická osoba' } } },
              then: {
                required: ['ziadatelAdresaPobytu'],
                properties: {
                  ziadatelAdresaPobytu: {
                    type: 'string',
                    title: 'Adresa trvalého pobytu',
                  },
                },
              },
            },
            {
              if: {
                properties: {
                  ziadatelTyp: { const: 'Fyzická osoba - podnikateľ' },
                },
              },
              then: {
                required: ['ziadatelMiestoPodnikania'],
                properties: {
                  ziadatelMiestoPodnikania: {
                    type: 'string',
                    title: 'Miesto podnikania',
                  },
                },
              },
            },
            {
              if: { properties: { ziadatelTyp: { const: 'Právnicka osoba' } } },
              then: {
                required: ['ziadatelAdresaSidla'],
                properties: {
                  ziadatelAdresaSidla: {
                    type: 'string',
                    title: 'Adresa sídla',
                  },
                },
              },
            },
            {
              default: {},
              required: ['ziadatelMestoPsc'],
              properties: {
                ziadatelMestoPsc: {
                  type: 'object',
                  required: ['ziadatelMesto', 'ziadatelPsc'],
                  properties: {
                    ziadatelPsc: { type: 'string', title: 'PSČ' },
                    ziadatelMesto: {
                      type: 'string',
                      title: 'Mesto',
                      format: 'ciselnik',
                    },
                  },
                },
              },
            },
            {
              if: { properties: { ziadatelTyp: { const: 'Právnicka osoba' } } },
              then: {
                required: ['ziadatelKontaktnaOsoba'],
                properties: {
                  ziadatelKontaktnaOsoba: {
                    type: 'string',
                    title: 'Kontaktná osoba',
                  },
                },
              },
            },
            {
              required: ['ziadatelEmail', 'ziadatelTelefon'],
              properties: {
                ziadatelEmail: {
                  type: 'string',
                  title: 'E-mail',
                  format: 'email',
                },
                ziadatelTelefon: {
                  type: 'string',
                  title: 'Telefónne číslo (v tvare +421...)',
                  pattern:
                    '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                },
              },
            },
          ],
          title: 'Žiadateľ',
          required: ['ziadatelTyp'],
          properties: {
            ziadatelTyp: {
              enum: [
                'Fyzická osoba',
                'Fyzická osoba - podnikateľ',
                'Právnicka osoba',
              ],
              type: 'string',
              title: 'Žiadate ako',
              default: 'Fyzická osoba',
            },
          },
        },
      },
    },
    {
      type: 'object',
      required: ['investor'],
      properties: {
        investor: {
          type: 'object',
          allOf: [
            {
              if: { properties: { investorZiadatelom: { const: false } } },
              then: {
                required: ['splnomocnenie'],
                properties: {
                  splnomocnenie: {
                    type: 'array',
                    items: { file: true, type: 'string' },
                    title: 'Splnomocnenie na zastupovanie',
                  },
                },
              },
            },
            {
              if: { properties: { investorZiadatelom: { const: false } } },
              then: {
                allOf: [
                  {
                    required: ['splnomocnenie', 'investorTyp'],
                    properties: {
                      investorTyp: {
                        enum: [
                          'Fyzická osoba',
                          'Fyzická osoba - podnikateľ',
                          'Právnicka osoba',
                        ],
                        type: 'string',
                        title: 'Typ investora',
                        default: 'Fyzická osoba',
                      },
                      splnomocnenie: {
                        type: 'array',
                        items: { file: true, type: 'string' },
                        title: 'Splnomocnenie na zastupovanie',
                      },
                    },
                  },
                  {
                    if: {
                      properties: { investorTyp: { const: 'Fyzická osoba' } },
                    },
                    then: {
                      required: ['investorMenoPriezvisko'],
                      properties: {
                        investorMenoPriezvisko: {
                          type: 'string',
                          title: 'Meno a priezvisko',
                          pattern: '.*[ ].*',
                        },
                      },
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: {
                          oneOf: [
                            { const: 'Fyzická osoba - podnikateľ' },
                            { const: 'Právnicka osoba' },
                          ],
                        },
                      },
                    },
                    then: {
                      required: ['investorObchodneMeno'],
                      properties: {
                        investorObchodneMeno: {
                          type: 'string',
                          title: 'Obchodné meno',
                        },
                      },
                    },
                  },
                  {
                    if: {
                      properties: { investorTyp: { const: 'Právnicka osoba' } },
                    },
                    then: {
                      required: ['investorIco'],
                      properties: {
                        investorIco: { type: 'number', title: 'IČO' },
                      },
                    },
                  },
                  {
                    if: {
                      properties: { investorTyp: { const: 'Fyzická osoba' } },
                    },
                    then: {
                      required: ['investorAdresaPobytu'],
                      properties: {
                        investorAdresaPobytu: {
                          type: 'string',
                          title: 'Adresa trvalého pobytu',
                        },
                      },
                    },
                  },
                  {
                    if: {
                      properties: {
                        investorTyp: { const: 'Fyzická osoba - podnikateľ' },
                      },
                    },
                    then: {
                      required: ['investorMiestoPodnikania'],
                      properties: {
                        investorMiestoPodnikania: {
                          type: 'string',
                          title: 'Miesto podnikania',
                        },
                      },
                    },
                  },
                  {
                    if: {
                      properties: { investorTyp: { const: 'Právnicka osoba' } },
                    },
                    then: {
                      required: ['investorAdresaSidla'],
                      properties: {
                        investorAdresaSidla: {
                          type: 'string',
                          title: 'Adresa sídla',
                        },
                      },
                    },
                  },
                  {
                    required: ['investorMestoPsc'],
                    properties: {
                      investorMestoPsc: {
                        type: 'object',
                        required: ['investorMesto', 'investorPsc'],
                        properties: {
                          investorPsc: { type: 'string', title: 'PSČ' },
                          investorMesto: {
                            type: 'string',
                            title: 'Mesto',
                            format: 'ciselnik',
                          },
                        },
                      },
                    },
                  },
                  {
                    if: {
                      properties: { investorTyp: { const: 'Právnicka osoba' } },
                    },
                    then: {
                      required: ['investorKontaktnaOsoba'],
                      properties: {
                        investorKontaktnaOsoba: {
                          type: 'string',
                          title: 'Kontaktná osoba',
                        },
                      },
                    },
                  },
                  {
                    required: ['investorEmail', 'investorTelefon'],
                    properties: {
                      investorEmail: {
                        type: 'string',
                        title: 'E-mail',
                        format: 'email',
                      },
                      investorTelefon: {
                        type: 'string',
                        title: 'Telefónne číslo (v tvare +421...)',
                        pattern:
                          '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
                      },
                    },
                  },
                ],
              },
            },
          ],
          title: 'Investor',
          required: ['investorZiadatelom'],
          properties: {
            investorZiadatelom: {
              type: 'boolean',
              title: 'Je investor rovnaká osoba ako žiadateľ?',
              default: true,
            },
          },
        },
      },
    },
    {
      type: 'object',
      required: ['projektant'],
      properties: {
        projektant: {
          type: 'object',
          title: 'Zodpovedný projektant',
          required: [
            'projektantMenoPriezvisko',
            'projektantEmail',
            'projektantTelefon',
            'autorizacneOsvedcenie',
            'datumSpracovania',
          ],
          properties: {
            projektantEmail: {
              type: 'string',
              title: 'E-mail',
              format: 'email',
            },
            datumSpracovania: {
              type: 'string',
              title: 'Dátum spracovania projektovej dokumentácie',
              format: 'date',
            },
            projektantTelefon: {
              type: 'string',
              title: 'Telefónne číslo (v tvare +421...)',
              pattern:
                '((([+][1-9])|([+][1-9][0-9]{1,12}))|((00[1-9])|(00[1-9][0-9]{1,11})))',
            },
            autorizacneOsvedcenie: {
              type: 'string',
              title: 'Číslo autorizačného osvedčenia',
              description:
                'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním. ',
            },
            projektantMenoPriezvisko: {
              type: 'string',
              title: 'Meno a priezvisko',
              pattern: '.*[ ].*',
            },
          },
        },
      },
    },
    {
      type: 'object',
      required: ['stavba'],
      properties: {
        stavba: {
          type: 'object',
          title: 'Informácie o stavbe',
          required: [
            'stavbaNazov',
            'stavbaDruh',
            'stavbaUlica',
            'stavbaParcela',
            'stavbaKataster',
          ],
          properties: {
            stavbaDruh: {
              enum: [
                'Bytový dom',
                'Rodinný dom',
                'Iná budova na bývanie',
                'Nebytová budova',
                'Inžinierska stavba',
                'Iné',
              ],
              type: 'string',
              title: 'Druh stavby',
              default: 'Bytový dom',
            },
            stavbaNazov: { type: 'string', title: 'Názov stavby/projektu' },
            stavbaUlica: { type: 'string', title: 'Ulica' },
            stavbaParcela: {
              type: 'string',
              title: 'Parcelné číslo',
              description:
                'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na katastrálnej mape ZBGIS.',
            },
            stavbaKataster: {
              type: 'array',
              items: {
                type: 'string',
                oneOf: [
                  { const: 'Čuňovo', title: 'Čuňovo' },
                  { const: 'Devín', title: 'Devín' },
                  { const: 'Devínska Nová Ves', title: 'Devínska Nová Ves' },
                  { const: 'Dúbravka', title: 'Dúbravka' },
                  { const: 'Jarovce', title: 'Jarovce' },
                  { const: 'Karlova Ves', title: 'Karlova Ves' },
                  { const: 'Lamač', title: 'Lamač' },
                  { const: 'Nivy', title: 'Nivy' },
                  { const: 'Nové Mesto', title: 'Nové Mesto' },
                  { const: 'Petržalka', title: 'Petržalka' },
                  {
                    const: 'Podunajské Biskupice',
                    title: 'Podunajské Biskupice',
                  },
                  { const: 'Rača', title: 'Rača' },
                  { const: 'Rusovce', title: 'Rusovce' },
                  { const: 'Ružinov', title: 'Ružinov' },
                  { const: 'Staré mesto', title: 'Staré mesto' },
                  { const: 'Trnávka', title: 'Trnávka' },
                  { const: 'Vajnory', title: 'Vajnory' },
                  { const: 'Vinohrady', title: 'Vinohrady' },
                  { const: 'Vrakuňa', title: 'Vrakuňa' },
                  { const: 'Záhorská Bystrica', title: 'Záhorská Bystrica' },
                ],
              },
              title: 'Katastrálne územie',
              uniqueItems: true,
            },
            stavbaSupisneCislo: { type: 'number', title: 'Súpisné číslo' },
          },
        },
      },
    },
    {
      type: 'object',
      required: ['konanie'],
      properties: {
        konanie: {
          type: 'object',
          allOf: [
            {
              if: {
                properties: {
                  konanieTyp: { const: 'Konanie o dodatočnom povolení stavby' },
                },
              },
              then: {
                allOf: [
                  {
                    if: {
                      properties: {
                        ziadostOdovodnenie: {
                          const:
                            'Dodatočné povolenie zmeny stavby pred dokončením',
                        },
                      },
                    },
                    then: {
                      required: ['stavbaFotodokumentacia', 'stavbaPisomnosti'],
                      properties: {
                        stavbaPisomnosti: {
                          type: 'array',
                          items: { file: true, type: 'string' },
                          title: 'Relevantné písomnosti súvisiace so stavbou',
                        },
                        stavbaFotodokumentacia: {
                          type: 'array',
                          items: { file: true, type: 'string' },
                          title: 'Fotodokumentácia stavby',
                        },
                      },
                    },
                  },
                ],
                required: ['ziadostOdovodnenie'],
                properties: {
                  ziadostOdovodnenie: {
                    enum: [
                      'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                      'Dodatočné povolenie zmeny stavby pred dokončením',
                    ],
                    type: 'string',
                    title: 'Upresnenie konania',
                    default:
                      'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                  },
                },
              },
            },
          ],
          title: 'Typ konania na stavebnom úrade',
          required: ['konanieTyp'],
          properties: {
            konanieTyp: {
              enum: [
                'Územné konanie',
                'Územné konanie spojené so stavebným konaním',
                'Zmena stavby pred dokončením',
                'Zmena v užívaní stavby',
                'Konanie o dodatočnom povolení stavby',
              ],
              type: 'string',
              title: 'Typ konania',
              default: 'Územné konanie',
            },
          },
        },
      },
    },
  ],
  title: 'Záväzné stanovisko k investičnej činnosti',
  pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti.sk',
  pospVersion: '0.1',
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
        JsonXmlConvertService,
        FormsValidator,
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
      schemaVersion: {
        xmlTemplate,
        jsonSchema,
        // eslint-disable-next-line no-secrets/no-secrets
        pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti.sk',
        pospVersion: '0.1',
        isSigned: false,
        formDescription: 'formular',
        schema: {
          messageSubject: 'Podanie',
          formName: 'Zavazne stanovisko',
        },
      },
    } as unknown as FormWithSchemaAndVersion)
    expect(response.status).toBe(200)
  })
})
