/// <reference types="cypress" />

describe('Registration flow', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const errorBorderFields =
    '[data-cy=input-email], [data-cy=input-name], [data-cy=input-password]'
  const password = `P@9${Date.now().toString(36)}`

  before(() => {
    cy.fixture('registrationPO.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
        const emailHash = `${Date.now() + device}@cypress.test`

        it('Submitting a empty registration PO form and check validation.', () => {
          cy.visit('/registracia')
          cy.hideNavbarCy(device)

          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-po]', form)).check()
            cy.wrap(Cypress.$('[data-cy=radio-po]', form)).should('be.visible')

            cy.wrap(Cypress.$('button[type=submit]', form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 4)

            cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-negative-700')
          })
          cy.dataCy('registration-container').should('be.visible').matchImage()
        })

        it('Filling out the registration form.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(emailHash)

            cy.wrap(Cypress.$('[data-cy=input-name]', form)).type(this.fileData.company_name)

            cy.wrap(Cypress.$('[data-cy=input-password]', form)).type(password)

            cy.wrap(Cypress.$('[data-cy=input-passwordConfirmation]', form)).type(password)
          })
        })

        it('Check that required inputs are not in error state.', () => {
          cy.checkFormFieldsNotInErrorStateCy('register-form', errorBorderFields)
        })

        it('Submitting the form and checking the redirection to 2FA.', () => {
          cy.submitFormCy('register-form')
        })

        it('Check the 2FA page.', () => {
          cy.check2FAPage(emailHash, 'registration-container')
        })
      })
    })
})
