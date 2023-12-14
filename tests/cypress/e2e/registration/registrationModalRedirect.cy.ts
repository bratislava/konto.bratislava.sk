/// <reference types="cypress" />

describe('RF03 - ', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {

        before(() => {
          cy.visit('/mestske-sluzby/stanovisko-k-investicnemu-zameru')
        })

        it('1. Registration modal should be open and button redirecting correctly.', () => {
          cy.hideNavbar(device)
          cy.dataCy('registration-modal-button').click()
          cy.url().should("include", "/registracia");
        })
      })
    })
})
