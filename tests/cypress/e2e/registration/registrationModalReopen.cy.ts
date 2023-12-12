/// <reference types="cypress" />

describe('Registration modal reopen flow', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {

        it('Checking if registration modal window is open.', () => {
          cy.visit('/mestske-sluzby/stanovisko-k-investicnemu-zameru')
          cy.get(`#${device}-navbar`).invoke('attr', 'style', 'display: none')

          cy.dataCy('registration-modal').should('be.visible').matchImage()
        })

        it('Closing and reopening modal with save as a concept button.', () => {
          cy.dataCy('close-modal').click()

          cy.dataCy(`save-concept-${device}`).should('be.visible').click()
          cy.dataCy('registration-modal').should('be.visible').matchImage()

          cy.dataCy('registration-modal-redirect').click()
          cy.url().should("include", "/registracia");
        })
      })
    })
})
