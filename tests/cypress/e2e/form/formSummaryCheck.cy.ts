/// <reference types="cypress" />

describe('F03 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

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
          cy.hideNavbar(device)
        })
        
        it('1. Checking "File" step validation.', () => {
          cy.dataCy('close-modal').click()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            cy.dataCy('error-message').should('be.visible').should('have.class', 'text-error')
          })
          cy.dataCy('form-container').should('be.visible').matchImage()
        })

        it('2. Uploading file in "File" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=file-input]', form)).attachFile('../files/test.pdf');
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('3. Checking "Applicant" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 7)
          })

          cy.dataCy('form-container').should('be.visible').matchImage()
        })

        it('4. Filling out the "Applicant" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-value-0]', form)).should('be.visible')

            cy.wrap(Cypress.$('input[type=text]', form).eq(0)).type(this.fileData.name)

            cy.wrap(Cypress.$('input[type=text]', form).eq(1)).type(this.fileData.address)

            cy.wrap(Cypress.$('input[type=text]', form).eq(2)).type(this.fileData.city)

            cy.wrap(Cypress.$('input[type=text]', form).eq(3)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('input[type=email]', form)).type(this.fileData.email_wrong)

            cy.wrap(Cypress.$('input[type=tel]', form)).type(this.fileData.phone_number_wrong)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('5. Going to summary.', () => {
          if (device === 'desktop') {
            cy.get('[data-cy=stepper-desktop] [data-cy=stepper-step-6]').click();
          } else {
            cy.dataCy('stepper-dropdown').click()
            cy.get('[data-cy=stepper-mobile] [data-cy=stepper-step-6]').click();
          }
          cy.dataCy('form-container').should('be.visible').matchImage()
        })

        it('6. Checking alert visibility.', () => {
          cy.dataCy('alert-container').should('exist').should('be.visible')
        })

        it('7. Checking filled in information are saved', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=summary-row]', form).eq(0)).find('[data-cy=summary-row-icon]').should('have.not.class', 'text-error')

            cy.wrap(Cypress.$('[data-cy=summary-row]', form).eq(2)).should('contain', this.fileData.name)

            cy.wrap(Cypress.$('[data-cy=summary-row]', form).eq(3)).should('contain', this.fileData.address)

            cy.wrap(Cypress.$('[data-cy=summary-row]', form).eq(4)).should('contain', this.fileData.city)

            cy.wrap(Cypress.$('[data-cy=summary-row]', form).eq(5)).should('contain', this.fileData.zip_code)

            cy.wrap(Cypress.$('[data-cy=summary-row]', form).eq(6)).should('contain', this.fileData.email_wrong)

            cy.wrap(Cypress.$('[data-cy=summary-row]', form).eq(7)).should('contain', this.fileData.phone_number_wrong)
          })
        })

        it('8. Checking form validation.', () => {
          cy.dataCy('form-container').then((form) => {
            const rowsToCheck = [6, 7, 9, 10, 11, 12, 13, 14, 16, 18, 19];
            rowsToCheck.forEach((rowIndex) => {
              cy.wrap(Cypress.$('[data-cy=summary-row]', form).eq(rowIndex)).should('have.class', 'border-red-500');
            });
          })
        })
      })
    })
})
