import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import ThrowerErrorGuard from '../../../../guards/thrower-error.guard'
import { MAILGUN_CONFIG } from '../../mailgun.constants'
import MailgunHelper from '../mailgun.helper'
import { testEmailDefinitions } from './utils/emailDefinitions'

describe('Mailgun Emails', () => {
  let mailgunHelper: MailgunHelper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailgunHelper, ThrowerErrorGuard, ConfigService],
    }).compile()

    mailgunHelper = module.get<MailgunHelper>(MailgunHelper)
  })

  describe('local rendering of emails', () => {
    Object.entries(testEmailDefinitions).forEach(([key, emailDefinition]) => {
      it(`should correctly render email: ${key}`, async () => {
        expect(MAILGUN_CONFIG[emailDefinition.template].renderLocaly).toBe(true) // Ensure the email is set to be rendered locally

        const rendered = await mailgunHelper.getFilledTemplate(
          MAILGUN_CONFIG[emailDefinition.template].template,
          MailgunHelper.createEmailVariables(emailDefinition),
        )
        expect(rendered).toMatchSnapshot()
      })
    })
  })
})
