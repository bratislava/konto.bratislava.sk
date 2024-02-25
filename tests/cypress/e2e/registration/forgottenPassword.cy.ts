/// <reference types="cypress" />

describe('RF05 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  before(() => {
    cy.fixture('forgottenPassword.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
        const wrongEmailHash = `${Date.now() + device}wrongemail@cypress.test`

        it('1. Submitting wrong value.', () => {
          cy.visit('/zabudnute-heslo')
          cy.hideNavbar(device)
          cy.hideInfoBar()

          cy.dataCy('forgotten-password-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(this.fileData.wrong_value)

            cy.submitForm('forgotten-password-form')

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).should('have.class', 'border-negative-700')
          })
        })

        it('2. Submitting wrong email.', () => {
          cy.dataCy('forgotten-password-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-email]', form)).focus().clear().type(wrongEmailHash)

            cy.submitForm('forgotten-password-form')
          })
          cy.dataCy('alert-container').should('be.visible')
          cy.dataCy('forgotten-password-form').should('be.visible')//.matchImage()
        })

        it('3. Submitting correct email.', () => {
          cy.dataCy('forgotten-password-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-email]', form)).focus().clear().type(this.fileData.correct_email)

            cy.submitForm('forgotten-password-form')
          })
          cy.dataCy('new-password-form').should('be.visible')
        })
      })
    })
})
