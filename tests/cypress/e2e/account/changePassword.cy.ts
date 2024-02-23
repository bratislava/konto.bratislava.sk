/// <reference types="cypress" />

describe('A01 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  before(() => {
    cy.fixture('account.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
        
        before(() => {
          if (device === 'mobile') {
            cy.logOutUser()
          }
          
          cy.visit('/')
        })
        
        it('1. Logging in.', () => {
          cy.logInUser(device, this.fileData.email, this.fileData.password)
        })

        it('2. Changing password.', () => {
          if (device === 'desktop') { 
            cy.get('[data-cy=account-button]').click()
          } else {
            cy.get('[data-cy=mobile-account-button]').click()
          }
          cy.get('[data-cy=moj-profil-menu-item]').click()
          cy.get('[data-cy=change-password-button]').click()
          cy.location('pathname', {timeout: 4000})
          .should('eq', '/zmena-hesla');
          cy.dataCy('change-password-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-oldPassword]', form)).clear().type(this.fileData.password)
            cy.wrap(Cypress.$('[data-cy=input-password]', form)).clear().type(this.fileData.password)
            cy.wrap(Cypress.$('[data-cy=input-passwordConfirmation]', form)).clear().type(this.fileData.password)
            cy.get('[data-cy=change-password-submit]').click()
          })
        })

        it('3. Validating saved information', () => {
          cy.location('pathname', {timeout: 4000})
          .should('eq', '/zmena-hesla');
          cy.get('[data-cy=success-alert]').should('be.visible')
          cy.get('[data-cy=pokračovať-do-konta-button]').click()
          cy.location('pathname', {timeout: 4000})
          .should('eq', '/');
        })
      })
    })
})
