import { Test, TestingModule } from '@nestjs/testing'

import BaConfigService from '../../../../../config/ba-config.service'
import ThrowerErrorGuard from '../../../../guards/thrower-error.guard'
import { getMailgunConfig } from '../../mailgun.constants'
import MailgunHelper from '../mailgun.helper'
import { testEmailDefinitions } from './utils/emailDefinitions'

describe('Mailgun Emails', () => {
  let mailgunHelper: MailgunHelper
  let baConfigService: BaConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailgunHelper, ThrowerErrorGuard, BaConfigService],
    }).compile()

    mailgunHelper = module.get<MailgunHelper>(MailgunHelper)
    baConfigService = module.get<BaConfigService>(BaConfigService)
  })

  describe('local rendering of emails', () => {
    Object.entries(testEmailDefinitions).forEach(([key, emailDefinition]) => {
      it(`should correctly render email: ${key}`, async () => {
        const mailgunConfig = getMailgunConfig(baConfigService)
        expect(mailgunConfig[emailDefinition.template].renderLocally).toBe(true) // Ensure the email is set to be rendered locally

        const rendered = await mailgunHelper.getFilledTemplate(
          mailgunConfig[emailDefinition.template].template,
          mailgunHelper.createEmailVariables(emailDefinition),
        )
        expect(rendered).toMatchSnapshot()
      })
    })
  })
})
