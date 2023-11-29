/// <reference types="cypress" />

describe('Registration flow', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const errorBorderFields =
    '[data-cy=input-email], [data-cy=input-given_name], [data-cy=input-family_name], [data-cy=input-password]'
	const password = `P@${Date.now().toString(36)}`

  before(() => {
    cy.fixture('registration.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
				const emailHash = `${Date.now()+device}@cypress.test`

        it('Submitting a empty registration form and check validation.', () => {
					cy.visit('/registracia')
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('button[type=submit]', form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 6)

            cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-negative-700')
          })
        })

        it('Filling out the registration form.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-fo]', form)).should('be.visible')

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(emailHash)

            cy.wrap(Cypress.$('[data-cy=input-given_name]', form)).type(this.fileData.given_name)

            cy.wrap(Cypress.$('[data-cy=input-family_name]', form)).type(this.fileData.family_name)

            cy.wrap(Cypress.$('[data-cy=input-password]', form)).type(password)

            cy.wrap(Cypress.$('[data-cy=input-passwordConfirmation]', form)).type(password)
          })
        })

        it('Check that required inputs are not in error state.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$(errorBorderFields, form)).should(
              'not.have.class',
              'border-negative-700'
            )
          })
        })

        it('Submitting the form and checking the redirection to 2FA.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('button[type=submit]', form)).click()
          })
        })

        it('Check the 2FA page.', () => {
          cy.dataCy('verification-description').contains(emailHash)
          cy.dataCy('verification-form').then((form) => {
            cy.wrap(Cypress.$('button[type=submit]', form)).click()

            cy.wrap(Cypress.$('[data-cy=input-verificationCode]', form)).should(
              'have.class',
              'border-negative-700'
            )
          })
        })
      })
    })
})
