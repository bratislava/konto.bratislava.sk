/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to check if all form inputs are not in error state.
     * @param form Form name.
     * @param errorBorderFields All fields to check.
     * @example cy.checkFormFieldsNotInErrorState('register-form')
     */
    checkFormFieldsNotInErrorState(form: string, errorBorderFields: string): Chainable<any>

    /**
     * Custom command to submit form.
     * @param form Form name.
     * @example cy.submitForm('register-form')
     */
    submitForm(form: string): Chainable<any>

    /**
     * Custom command to check if 2FA page is working as expected.
     * @param emailHash Email hash.
     * @param formContainer Form container.
     * @example cy.check2FAPage(emailHash, 'registration-container')
     */
    check2FAPage(emailHash: string): Chainable<any>
  }
}

Cypress.Commands.add('checkFormFieldsNotInErrorState', (form, errorBorderFields) => {
  cy.dataCy(form).then((form) => {
    cy.wrap(Cypress.$(errorBorderFields, form)).should('not.have.class', 'border-negative-700')
  })
})

Cypress.Commands.add('submitForm', (form) => {
  cy.dataCy(form).then((form) => {
    cy.wrap(Cypress.$('button[type=submit]', form)).should('be.visible').dblclick()
  })
})

Cypress.Commands.add('check2FAPage', (emailHash) => {
  cy.get('[data-cy=success-alert]', { timeout: 15000 }).find('p').contains(emailHash)
  cy.dataCy('pokračovať-do-konta-button').contains('Pokračovať do konta')
})
