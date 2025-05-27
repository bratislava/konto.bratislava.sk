/// <reference types="cypress" />

describe('RF03 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
        beforeEach(() => {
          cy.visit('/mestske-sluzby/stanovisko-k-investicnemu-zameru')
          cy.hideNavbar(device)
          cy.dataCy('form-landing-page-fill-form-button').click()
        })

        it('1. Registration modal is redirecting to registration page.', () => {
          cy.dataCy('registration-modal-button').click()
          cy.url().should('include', '/registracia')
        })

        it(`2. Reopening registration modal with save as a concept button.`, () => {
          cy.dataCy('close-modal').click()

          cy.dataCy(`save-concept-${device}`).should('be.visible').click()
          cy.dataCy('registration-modal').should('be.visible') //.matchImage()
        })
      })
    })
})
