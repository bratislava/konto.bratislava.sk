/// <reference types="cypress" />

describe('F03 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const errorBorderFields =
    '[data-cy=summary-row-email], [data-cy=summary-row-telefon], [data-cy=summary-row-projektantTelefon], [data-cy=summary-row-menoPriezvisko], [data-cy=summary-row-autorizacneOsvedcenie], [data-cy=summary-row-datumSpracovania], [data-cy=summary-row-autorizacneOsvedcenie], [data-cy=summary-row-nazov], [data-cy=summary-row-ulica], [data-cy=summary-row-parcelneCislo], [data-cy=summary-row-kataster]'  
    
  before(() => {
    cy.fixture('formSummaryCheck.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
        before(() => {
          cy.visit('/mestske-sluzby/stanovisko-k-investicnemu-zameru')
        })
        
        beforeEach(() => {
          cy.hideNavbar(device)
        })

        it('1. Checking "Applicant" step validation.', () => {
          cy.dataCy('close-modal').click()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 7)
          })

          cy.dataCy('form-container').should('be.visible')//.matchImage()
        })

        it('2. Filling out the "Applicant" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-fyzická-osoba]', form)).should('be.checked')

            cy.wrap(Cypress.$('[data-cy=input-menoPriezvisko]', form)).type(this.fileData.name)

            cy.wrap(Cypress.$('[data-cy=input-ulicaACislo]', form)).type(this.fileData.address)

            cy.wrap(Cypress.$('[data-cy=input-mesto]', form)).type(this.fileData.city)

            cy.wrap(Cypress.$('[data-cy=input-psc]', form)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(this.fileData.email_wrong)

            cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).type(this.fileData.phone_number_wrong)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('3. Going to summary.', () => {
          if (device === 'desktop') {
            cy.get('[data-cy=stepper-desktop] [data-cy=stepper-step-6]').click();
          } else {
            cy.dataCy('stepper-dropdown').click()
            cy.get('[data-cy=stepper-mobile] [data-cy=stepper-step-6]').click();
          }
          cy.dataCy('form-container').should('be.visible')//.matchImage()
        })

        it('4. Checking alert visibility.', () => {
          cy.dataCy('alert-container').should('exist').should('be.visible')
        })

        it('5. Checking filled in information are saved', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=summary-row-menoPriezvisko]', form)).should('contain', this.fileData.name)

            cy.wrap(Cypress.$('[data-cy=summary-row-ulicaACislo]', form)).should('contain', this.fileData.address)

            cy.wrap(Cypress.$('[data-cy=summary-row-mesto]', form)).should('contain', this.fileData.city)

            cy.wrap(Cypress.$('[data-cy=summary-row-psc]', form)).should('contain', this.fileData.zip_code)

            cy.wrap(Cypress.$('[data-cy=summary-row-email]', form)).should('contain', this.fileData.email_wrong)

            cy.wrap(Cypress.$('[data-cy=summary-row-telefon]', form)).should('contain', this.fileData.phone_number_wrong)
          })
        })

        it('8. Checking form validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-red-500');
          })
        })
      })
    })
})
