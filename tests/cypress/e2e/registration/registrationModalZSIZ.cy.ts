/// <reference types="cypress" />

describe('RF04 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {

        beforeEach(() => {
          cy.visit('/mestske-sluzby/zavazne-stanovisko-k-investicnej-cinnosti')
          cy.hideNavbar(device)
        })

        it('1. Registration modal is redirecting to registration page.', () => {
          cy.dataCy('registration-modal-button').click()
          cy.url().should("include", "/registracia");
        })

        it(`1. Reopening registration modal with save as a concept button.`, () => {
          cy.dataCy('close-modal').click()

          cy.dataCy(`save-concept-${device}`).should('be.visible').click()
          cy.dataCy('registration-modal').should('be.visible')//.matchImage()
        })
      })
    })
})
