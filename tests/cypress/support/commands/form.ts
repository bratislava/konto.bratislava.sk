/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to check active step.
     * @param stepIndex step number.
     * @example cy.checkActiveStep(1)
     */
    checkActiveStep(stepIndex: number): Chainable<any>
  }
}

Cypress.Commands.add('checkActiveStep', (stepIndex) => {
  cy.dataCy('stepper-step-active').contains(stepIndex)
})