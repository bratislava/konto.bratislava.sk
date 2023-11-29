declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @param attribute data-cy name.
     * @param specify It is used to specify the search, for example pointing to a child.
     * @example cy.dataCy('greeting')
     */
    dataCy(attribute: string, specify?: string): Chainable<Element>
  }
}