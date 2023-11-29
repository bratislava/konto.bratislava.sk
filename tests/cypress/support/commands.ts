/// <reference types="cypress" />

Cypress.Commands.add("dataCy", (attribute, specify) => {
	const selector = `[data-cy=${attribute}]${specify ? specify : ''}`;
	cy.get(selector)
 })
