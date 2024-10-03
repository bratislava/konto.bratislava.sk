/// <reference types="cypress" />

describe('RF01 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const errorBorderFields =
    '[data-cy=input-email], [data-cy=input-given_name], [data-cy=input-family_name], [data-cy=input-password]'
  const password = `P@9${Date.now().toString(36)}`

  before(() => {
    cy.fixture('registration.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
        const emailDomain = 'cypress.test'
        const emailHash = `${Date.now() + device}@${emailDomain}`
        const wrongEmailHash = `${Date.now() + device}wrongemail@${emailDomain}`

        it('1. Submitting a empty registration form.', () => {
          cy.visit('/registracia')
          cy.hideNavbar(device)

          cy.dataCy('registration-container').should('be.visible') //.matchImage()
        })

        it('2. Check error validation.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('button[type=submit]', form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 6)

            cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-negative-700')
          })
          cy.dataCy('registration-container').should('be.visible') //.matchImage()
        })

        it('3. Filling out the registration form.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-fyzická-osoba]', form)).should('be.checked')

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(emailHash)

            cy.wrap(Cypress.$('[data-cy=input-given_name]', form)).type(this.fileData.given_name)

            cy.wrap(Cypress.$('[data-cy=input-family_name]', form)).type(this.fileData.family_name)

            cy.wrap(Cypress.$('[data-cy=input-password]', form)).type(password)

            cy.wrap(Cypress.$('[data-cy=input-passwordConfirmation]', form)).type(password)
          })
        })

        it('4. Check that required inputs are not in error state.', () => {
          cy.checkFormFieldsNotInErrorState('register-form', errorBorderFields)
          cy.dataCy('registration-container').should('be.visible') //.matchImage()
        })

        it('5. Submitting the form and checking the redirection to 2FA.', () => {
          cy.submitForm('register-form')
        })

        it('6. Check the 2FA page.', () => {
          cy.check2FAPage(emailHash)
        })

        it('7. Logout user.', () => {
          cy.logOutUser()
        })

        describe('A02 - change email and password', { testIsolation: false }, () => {
          it('1. Logging in.', () => {
            cy.logInUser(device, emailHash, password)
            cy.get('[data-cy=add-phone-number]', { timeout: 10000 })
            cy.get('[data-cy=close-modal]').click({ multiple: true })
          })

          it('2. Changing email.', () => {
            if (device === 'desktop') {
              cy.get('[data-cy=account-button]').click()
            } else {
              cy.get('[data-cy=mobile-account-button]').click()
            }
            cy.get('[data-cy=moj-profil-menu-item]').click()
            if (device === 'desktop') {
              cy.get('[data-cy=edit-personal-information-button]').click()
              cy.get('[data-cy=change-email-button]').click()
            } else {
              cy.get('[data-cy=edit-personal-information-button-mobile]').click()
              cy.get('[data-cy=change-email-button-mobile]').click()
            }
            cy.url().should('include', '/zmena-emailu')
            cy.dataCy('change-email-form').then((form) => {
              cy.wrap(Cypress.$('[data-cy=input-newEmail]', form)).clear().type(emailHash)
              cy.wrap(Cypress.$('[data-cy=input-password]', form)).clear().type(password)
              cy.get('[data-cy=change-email-submit]').click()
            })
          })

          it('3. Validating saved information', () => {
            cy.check2FAPage(emailHash)
          })

          it('4. Changing password.', () => {
            cy.visit('/moj-profil')
            cy.get('[data-cy=change-password-button]').click()
            cy.location('pathname', { timeout: 4000 }).should('eq', '/zmena-hesla')
            cy.dataCy('change-password-form').then((form) => {
              cy.wrap(Cypress.$('[data-cy=input-oldPassword]', form)).clear().type(password)
              cy.wrap(Cypress.$('[data-cy=input-password]', form)).clear().type(password)
              cy.wrap(Cypress.$('[data-cy=input-passwordConfirmation]', form))
                .clear()
                .type(password)
              cy.get('[data-cy=change-password-submit]').click()
            })
          })

          it('5. Validating saved information', () => {
            cy.location('pathname', { timeout: 4000 }).should('eq', '/zmena-hesla')
            cy.get('[data-cy=success-alert]').should('be.visible')
            cy.get('[data-cy=pokračovať-do-konta-button]').click()
            cy.location('pathname', { timeout: 4000 }).should('eq', '/')
            cy.logOutUser()
          })
        })

        describe('RF05 - forgotten password', () => {
          beforeEach(() => {
            /*
             * These tests were previously prone to intermittent failures due to rate limiting (LimitExceededException).
             * To improve reliability, we've implemented a mock response that mimics the AWS Cognito API.
             */
            cy.intercept(
              {
                url: /^https:\/\/cognito-idp\.[a-z0-9-]+\.amazonaws\.com\/$/,
                headers: {
                  'x-amz-target': 'AWSCognitoIdentityProviderService.ForgotPassword',
                },
                method: 'POST',
              },
              (req) => {
                const requestEmail = req.body.Username
                if (requestEmail === wrongEmailHash) {
                  req.reply({
                    statusCode: 400,
                    body: {
                      __type: 'UserNotFoundException',
                      message: 'Username/client id combination not found.',
                    },
                  })
                } else if (requestEmail === emailHash) {
                  req.reply({
                    statusCode: 200,
                    body: {
                      CodeDeliveryDetails: {
                        AttributeName: 'email',
                        DeliveryMedium: 'EMAIL',
                        // peter.horvath@bratislava.sk -> "p***@b***"
                        Destination: `${requestEmail[0]}***@${emailDomain[0]}***`,
                      },
                    },
                  })
                }
              },
            ).as('forgotPasswordRequest')
          })

          it('1. Submitting wrong value.', () => {
            cy.visit('/zabudnute-heslo')
            cy.hideNavbar(device)

            cy.dataCy('forgotten-password-form').then((form) => {
              cy.wrap(Cypress.$('[data-cy=input-email]', form)).type('test')

              cy.submitForm('forgotten-password-form')

              cy.wrap(Cypress.$('[data-cy=input-email]', form)).should(
                'have.class',
                'border-negative-700',
              )
            })
          })

          it('2. Submitting wrong email.', () => {
            cy.dataCy('forgotten-password-form').then((form) => {
              cy.wrap(Cypress.$('[data-cy=input-email]', form)).focus().clear().type(wrongEmailHash)
              cy.submitForm('forgotten-password-form')
            })

            cy.wait('@forgotPasswordRequest').its('response.statusCode').should('eq', 400)
            cy.dataCy('alert-container').should('be.visible')
            cy.dataCy('forgotten-password-form').should('be.visible')
          })

          it('3. Submitting correct email.', () => {
            cy.dataCy('forgotten-password-form').then((form) => {
              cy.wrap(Cypress.$('[data-cy=input-email]', form)).focus().clear().type(emailHash)
              cy.submitForm('forgotten-password-form')
            })

            cy.wait('@forgotPasswordRequest').its('response.statusCode').should('eq', 200)
            cy.dataCy('new-password-form').should('be.visible')
          })
        })
      })
    })
})
