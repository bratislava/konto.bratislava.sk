/// <reference types="cypress" />

describe('F03 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const errorBorderFields =
    '[data-cy=summary-row-root_ziadatel_email], [data-cy=summary-row-root_ziadatel_telefon], [data-cy=summary-row-root_zodpovednyProjektant_menoPriezvisko], [data-cy=summary-row-root_zodpovednyProjektant_email], [data-cy=summary-row-root_zodpovednyProjektant_projektantTelefon], [data-cy=summary-row-root_zodpovednyProjektant_autorizacneOsvedcenie], [data-cy=summary-row-root_zodpovednyProjektant_datumSpracovania], [data-cy=summary-row-root_stavba_nazov], [data-cy=summary-row-root_stavba_ulica], [data-cy=summary-row-root_stavba_parcelneCislo], [data-cy=summary-row-root_stavba_kataster], [data-cy=summary-row-root_prilohy_architektonickaStudia]'

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

        it('1. Press fill form button.', () => {
          cy.dataCy('form-landing-page-fill-form-button').click()
        })

        it('2. Checking "Applicant" step validation.', () => {
          cy.dataCy('close-modal').click()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 7)
          })

          cy.dataCy('form-container').should('be.visible') //.matchImage()
        })

        it('3. Filling out the "Applicant" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-fyzická-osoba]', form)).should('be.checked')

            cy.wrap(Cypress.$('[data-cy=input-menoPriezvisko]', form)).type(this.fileData.name)

            cy.wrap(Cypress.$('[data-cy=input-ulicaACislo]', form)).type(this.fileData.address)

            cy.wrap(Cypress.$('[data-cy=input-mesto]', form)).type(this.fileData.city)

            cy.wrap(Cypress.$('[data-cy=input-psc]', form)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(this.fileData.email_wrong)

            cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).type(
              this.fileData.phone_number_wrong,
            )

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('4. Going to summary.', () => {
          if (device === 'desktop') {
            cy.get('[data-cy=stepper-desktop] [data-cy=stepper-step-6]').click()
          } else {
            cy.dataCy('stepper-dropdown').click()
            cy.get('[data-cy=stepper-mobile] [data-cy=stepper-step-6]').click()
          }
          cy.dataCy('form-container').should('be.visible') //.matchImage()
        })

        it('5. Checking alert visibility.', () => {
          cy.dataCy('alert-container').should('exist').should('be.visible')
        })

        it('6. Checking filled in information are saved', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=summary-row-root_ziadatel_menoPriezvisko]', form)).should(
              'contain',
              this.fileData.name,
            )

            cy.wrap(
              Cypress.$('[data-cy=summary-row-root_ziadatel_adresa_ulicaACislo]', form),
            ).should('contain', this.fileData.address)

            cy.wrap(
              Cypress.$('[data-cy=summary-row-root_ziadatel_adresa_mestoPsc_mesto]', form),
            ).should('contain', this.fileData.city)

            cy.wrap(
              Cypress.$('[data-cy=summary-row-root_ziadatel_adresa_mestoPsc_psc]', form),
            ).should('contain', this.fileData.zip_code)

            cy.wrap(Cypress.$('[data-cy=summary-row-root_ziadatel_email]', form)).should(
              'contain',
              this.fileData.email_wrong,
            )

            cy.wrap(Cypress.$('[data-cy=summary-row-root_ziadatel_telefon]', form)).should(
              'contain',
              this.fileData.phone_number_wrong,
            )
          })
        })

        it('7. Checking form validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-red-500')
          })
        })
      })
    })
})
