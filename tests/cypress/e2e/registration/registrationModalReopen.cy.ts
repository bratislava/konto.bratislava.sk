/// <reference types="cypress" />

describe('RF04 - ', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {

        before(() => {
          cy.visit('/mestske-sluzby/stanovisko-k-investicnemu-zameru')
        })

        it('1. Reopening registration modal with save as a concept button.', () => {
          cy.hideNavbar(device)

          cy.dataCy('close-modal').click()

          cy.dataCy(`save-concept-${device}`).should('be.visible').click()

          cy.dataCy('registration-modal-button').click()
          cy.url().should("include", "/registracia");
        })
      })
    })
})
