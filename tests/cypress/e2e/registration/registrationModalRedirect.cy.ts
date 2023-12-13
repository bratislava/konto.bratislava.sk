/// <reference types="cypress" />

describe('Registration modal redirect flow', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {

        beforeEach(() => {
          cy.visit('/mestske-sluzby/stanovisko-k-investicnemu-zameru')
          cy.hideNavbar(device)
        })

        it('Checking if registration modal window is open.', () => {
          cy.dataCy('registration-modal').should('be.visible').matchImage()
        })

        it('Checking if modal button is redirecting correctly.', () => {
          cy.dataCy('registration-modal-button').click()
          cy.url().should("include", "/registracia");
        })
      })
    })
})
