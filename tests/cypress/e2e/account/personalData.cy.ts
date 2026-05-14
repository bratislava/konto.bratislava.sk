/// <reference types="cypress" />

describe('A04 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const nameHash = `${Date.now()}Name`
  const surnameHash = `${Date.now()}Surname`

  before(() => {
    cy.fixture('account.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.expose('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.expose('resolution')[`${device}`], () => {
        it('1. Logging in.', () => {
          cy.logInUser(device, this.fileData.email, this.fileData.password)
        })

        it('2. Editing personal information.', () => {
          if (device === 'desktop') {
            cy.get('[data-cy=account-button]').click()
          } else {
            cy.get('[data-cy=mobile-account-button]').click()
          }
          cy.get('[data-cy=moj-profil-menu-item]').click()
          cy.get('[data-cy=edit-personal-information-button]').click()
          cy.dataCy('edit-personal-information-form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-given_name]', form)).clear().type(nameHash)
            cy.wrap(Cypress.$('[data-cy=input-family_name]', form)).clear().type(surnameHash)
          })
          cy.get('[data-cy=save-personal-information-button]').click()
          cy.intercept('POST', '**/user/update-or-create-bloomreach-customer').as('updateCustomer')
          cy.get('[data-cy=save-personal-information-button]').click()
          cy.wait('@updateCustomer').its('response.statusCode').should('eq', 200)
        })

        it('3. Validating saved information', () => {
          cy.reload()
          cy.get('[data-cy=meno-a-priezvisko-profile-row]').should(
            'contain',
            nameHash + ' ' + surnameHash,
          )
          cy.logOutUser()
        })
      })
    })
})
