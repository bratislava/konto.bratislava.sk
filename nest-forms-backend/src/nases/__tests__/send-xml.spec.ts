import { randomUUID } from 'node:crypto'

import { Test, TestingModule } from '@nestjs/testing'
import { Forms } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import ConvertService from '../../convert/convert.service'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { SendMessageNasesSenderType } from '../types/send-message-nases-sender.type'
import NasesUtilsService from '../utils-services/tokens.nases.service'

jest.mock('../../convert/convert.service')

const generateMessageXml = (messageId: string): string =>
  // note - needs to be single line without spaces, otherwise it will get rejected by upvs
  // eslint-disable-next-line no-secrets/no-secrets, prettier/prettier
  `<?xml version="1.0" encoding="utf-8"?><SKTalkMessage xmlns="http://gov.sk/SKTalkMessage" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><EnvelopeVersion>3.0</EnvelopeVersion><Header><MessageInfo><Class>EGOV_APPLICATION</Class><PospID>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</PospID><PospVersion>0.1</PospVersion><MessageID>${messageId}</MessageID><CorrelationID>${messageId}</CorrelationID></MessageInfo></Header><Body><MessageContainer xmlns="http://schemas.gov.sk/core/MessageContainer/1.0"><MessageId>${messageId}</MessageId><SenderId>${process.env.NASES_RECIPIENT_URI ?? ''}</SenderId><RecipientId>${process.env.NASES_RECIPIENT_URI ?? ''}</RecipientId><MessageType>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</MessageType><MessageSubject>Podanie</MessageSubject><Object Id="${messageId}" IsSigned="false" Name="Záväzné stanovisko k investičnej činnosti" Description="" Class="FORM" MimeType="application/x-eform-xml" Encoding="XML"><E-form xmlns="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1" xsi:schemaLocation="http://schemas.gov.sk/doc/eform/00603481.zavazneStanoviskoKInvesticnejCinnosti.sk/0.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Meta><ID>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</ID><Name>00603481.zavazneStanoviskoKInvesticnejCinnosti.sk</Name><Gestor/><RecipientId/><Version>0.1</Version><ZepRequired>false</ZepRequired><EformUuid>5ea0cad2-8759-4826-8d4c-c59c1d09ec29</EformUuid><SenderID>mailto:hruska@example.com</SenderID></Meta><Body><Prilohy><ProjektovaDokumentacia><Nazov>string</Nazov><Prilozena>true</Prilozena></ProjektovaDokumentacia></Prilohy><Ziadatel><ZiatetelTyp>Právnicka osoba</ZiatetelTyp><ZiadatelObchodneMeno>string</ZiadatelObchodneMeno><ZiadatelIco>-2736</ZiadatelIco><ZiadatelMiestoPodnikania>string</ZiadatelMiestoPodnikania><ZiadatelAdresaSidla>string</ZiadatelAdresaSidla><ZiadatelMestoPsc><ZiadatelPsc>string</ZiadatelPsc><ZiadatelMesto><Code>mesto</Code><Name>mesto</Name><WsEnumCode>undefined</WsEnumCode></ZiadatelMesto></ZiadatelMestoPsc><ZiadatelKontaktnaOsoba>test</ZiadatelKontaktnaOsoba><ZiadatelEmail>ziadatel@test.sk</ZiadatelEmail><ZiadatelTelefon>+449</ZiadatelTelefon></Ziadatel><Investor><InvestorZiadatelom>true</InvestorZiadatelom><Splnomocnenie><Nazov>string</Nazov><Prilozena>true</Prilozena></Splnomocnenie><InvestorTyp>Právnicka osoba</InvestorTyp><InvestorMenoPriezvisko>Janko Hrasko</InvestorMenoPriezvisko><InvestorMiestoPodnikania>string</InvestorMiestoPodnikania><InvestorMestoPsc><InvestorPsc>string</InvestorPsc><InvestorMesto><Code>mesto</Code><Name>mesto</Name><WsEnumCode>undefined</WsEnumCode></InvestorMesto></InvestorMestoPsc><InvestorEmail>investor@test.sk</InvestorEmail><InvestorTelefon>+4</InvestorTelefon></Investor><Projektant><ProjektantEmail>projektant@test.sk</ProjektantEmail><DatumSpracovania>1989-03-27</DatumSpracovania><ProjektantTelefon>+5</ProjektantTelefon><AutorizacneOsvedcenie>string</AutorizacneOsvedcenie><ProjektantMenoPriezvisko>Fero Mrkva</ProjektantMenoPriezvisko></Projektant><Stavba><StavbaDruh>Bytový dom</StavbaDruh><StavbaNazov>string</StavbaNazov><StavbaUlica>string</StavbaUlica><StavbaParcela>string</StavbaParcela><StavbaKataster>Karlova Ves</StavbaKataster></Stavba><Konanie><KonanieTyp>Konanie o dodatočnom povolení stavby</KonanieTyp><ZiadostOdovodnenie>Dodatočné povolenie zmeny stavby pred dokončením</ZiadostOdovodnenie><StavbaPisomnosti><Nazov>string</Nazov><Prilozena>true</Prilozena></StavbaPisomnosti><StavbaPisomnosti><Nazov>string</Nazov><Prilozena>true</Prilozena></StavbaPisomnosti><StavbaFotodokumentacia><Nazov>string</Nazov><Prilozena>true</Prilozena></StavbaFotodokumentacia><StavbaFotodokumentacia><Nazov>string</Nazov><Prilozena>true</Prilozena></StavbaFotodokumentacia></Konanie></Body></E-form></Object></MessageContainer></Body></SKTalkMessage>`
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

describe('SendXmlToNases', () => {
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
    console.log('Sending test xml with messageId:', messageId)
    service['createEnvelopeSendMessage'] = jest
      .fn()
      .mockReturnValue(generateMessageXml(messageId))

    const response = await service.sendMessageNases(jwt, {} as Forms, {
      type: SendMessageNasesSenderType.Self,
    })
    expect(response.status).toBe(200)
  })
})
