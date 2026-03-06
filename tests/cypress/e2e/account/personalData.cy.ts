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
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
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
          if (device === 'desktop') {
            cy.get('[data-cy=edit-personal-information-button]').click()
          } else {
            cy.get('[data-cy=edit-personal-information-button-mobile]').click()
          }
          cy.dataCy('edit-personal-information-form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-given_name]', form)).clear().type(nameHash)
            cy.wrap(Cypress.$('[data-cy=input-family_name]', form)).clear().type(surnameHash)
            // cy.wrap(Cypress.$('[data-cy=input-phone_number]', form))
            //   .clear()
            //   .type(this.fileData.wrong_phone_number)
            // cy.wrap(Cypress.$('[data-cy=input-street_address]', form))
            //   .clear()
            //   .type(this.fileData.address)
            // cy.wrap(Cypress.$('[data-cy=input-city]', form)).clear().type(this.fileData.city)
            // cy.wrap(Cypress.$('[data-cy=input-postal_code]', form))
            //   .clear()
            //   .type(this.fileData.wrong_postal_code)
          })
          if (device === 'desktop') {
            cy.get('[data-cy=save-personal-information-button]').click()
          } else {
            cy.get('[data-cy=save-personal-information-button-mobile]').click()
          }

          // cy.dataCy('edit-personal-information-form-container').then((form) => {
          // cy.wrap(Cypress.$('[data-cy=error-message]', form)).should('have.length', 1)
          // cy.wrap(Cypress.$('[data-cy=error-message]', form)).should(
          //   'contain',
          //   'PSČ musí obsahovať práve 5 číslic.',
          // )
          //
          // cy.wrap(Cypress.$('[data-cy=input-postal_code]', form)).should(
          //   'have.class',
          //   'border-negative-700',
          // )
          // cy.wrap(Cypress.$('[data-cy=input-postal_code]', form))
          //   .clear()
          //   .type(this.fileData.postal_code)
          // })
          // if (device === 'desktop') {
          //   cy.get('[data-cy=save-personal-information-button]').click()
          // } else {
          //   cy.get('[data-cy=save-personal-information-button-mobile]').click()
          // }

          // cy.dataCy('edit-personal-information-form-container').then((form) => {
          // cy.wrap(Cypress.$('[data-cy=error-message]', form)).should('have.length', 1)
          // cy.wrap(Cypress.$('[data-cy=error-message]', form)).should(
          //   'contain',
          //   'Zadajte telefónne číslo v medzinárodnom formáte +421…',
          // )
          // cy.wrap(Cypress.$('[data-cy=input-phone_number]', form)).should(
          //   'have.class',
          //   'border-negative-700',
          // )
          // cy.wrap(Cypress.$('[data-cy=input-phone_number]', form))
          //   .clear()
          //   .type(this.fileData.phone_number)
          // })
          if (device === 'desktop') {
            cy.get('[data-cy=save-personal-information-button]').click()
          } else {
            cy.get('[data-cy=save-personal-information-button-mobile]').click()
          }
        })

        it('3. Validating saved information', () => {
          cy.checkSuccessSnackbar()
          cy.get('[data-cy=meno-a-priezvisko-profile-row]').should(
            'contain',
            nameHash + ' ' + surnameHash,
          )
          cy.logOutUser()
        })
      })
    })
})
