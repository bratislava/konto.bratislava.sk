/// <reference types="cypress" />

describe('A02 -', { testIsolation: false }, () => {
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

        it('2. Changing email.', () => {
          if (device === 'desktop') { 
            cy.get('[data-cy=account-button]').click()
          } else {
            cy.get('[data-cy=mobile-account-button]').click()
          }
          cy.get('[data-cy=moj-profil-menu-item]').click()
          if (device === 'desktop') {
            cy.get('[data-cy=edit-personal-information-button]').click()
            cy.get('[data-cy=change-email-button]').click()
          } else {
            cy.get('[data-cy=edit-personal-information-button-mobile]').click()
            cy.get('[data-cy=change-email-button-mobile]').click()
          }
          cy.url().should("include", "/zmena-emailu");
          cy.dataCy('change-email-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-newEmail]', form)).clear().type(this.fileData.email)
            cy.wrap(Cypress.$('[data-cy=input-password]', form)).clear().type(this.fileData.password)
            cy.get('[data-cy=change-email-submit]').click()
          })
        })

        it('3. Validating saved information', () => {
          cy.check2FAPage(this.fileData.email, 'verification-form')
        })
      })
    })
})
