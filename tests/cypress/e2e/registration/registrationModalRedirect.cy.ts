/// <reference types="cypress" />

describe('Registration modal redirect flow', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {

        before(() => {
          cy.visit('/mestske-sluzby/stanovisko-k-investicnemu-zameru')
          cy.hideNavbar(device)
        })

        it('Registration modal should be open and button redirecting correctly.', () => {
          cy.dataCy('registration-modal').should('be.visible').matchImage()
          cy.dataCy('registration-modal-button').click()
          cy.url().should("include", "/registracia");
        })
      })
    })
})
