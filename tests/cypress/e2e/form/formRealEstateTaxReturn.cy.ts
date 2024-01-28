/// <reference types="cypress" />
//@ts-ignore
const path = require("path");

describe('F05 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  const taxpayerBorderFields =
    '[data-cy=input-email], [data-cy=input-rodneCislo], [data-cy=input-ulica], [data-cy=input-cislo], [data-cy=input-meno], [data-cy=input-telefon], [data-cy=input-obec], [data-cy=input-psc]'
  
  const landTaxBorderFields = '[data-cy=input-celkovaVymeraPozemku], [data-cy=input-cisloParcely], [data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu], [data-cy=input-spoluvlastnickyPodiel]'

  const onePurposeTaxBorderFields = '[data-cy=input-ulicaACisloDomu], [data-cy=input-supisneCislo], [data-cy=input-cisloParcely], [data-cy=input-celkovaZastavanaPlocha], [data-cy=input-spoluvlastnickyPodiel], [data-cy=input-pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia]'

  const multiPurposeTaxBorderFields = '[data-cy=input-ulicaACisloDomu], [data-cy=input-supisneCislo], [data-cy=input-cisloParcely], [data-cy=input-popisStavby], [data-cy=input-celkovaVymera], [data-cy=input-spoluvlastnickyPodiel], [data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu],[data-cy=input-pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia]'

  const nonResidentialTaxBorderFields = '[data-cy=input-ulicaACisloDomu], [data-cy=input-supisneCislo], [data-cy=input-cisloParcely]'

  const summaryBorderFields = '[data-cy=summary-row-rok], [data-cy=summary-row-rodneCislo], [data-cy=summary-row-priezvisko], [data-cy=summary-row-obec], [data-cy=summary-row-psc], [data-cy=summary-row-email], [data-cy=summary-row-telefon]'

  before(() => {
    cy.fixture('formRealEstateTaxReturn.cy.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {

        before(() => {
          cy.visit('/mestske-sluzby/priznanie-k-dani-z-nehnutelnosti')
        })
        
        beforeEach(() => {
          cy.hideNavbar(device)
        })
        
        it('1. Choosing how to fill out the return.', () => {
          cy.dataCy('tax-form-landing-page-card-bratislavske-konto').click()
          //cy.dataCy('tax-form-landing-page-card-esluzby-bratislava-sk').click()
          //cy.dataCy('tax-form-landing-page-card-pdf-priznanie').click()
        })

        it('2. Checking "Type of tax return" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 2)     
            cy.wrap(Cypress.$('[data-cy=input-rok]', form)).should('have.class', 'border-negative-700')
          })
        })

        it('3. Filling out "Type of tax return" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-group-vyberte-druh-priznania]', form)).find(`[data-cy=radio-${this.fileData.druhPriznania.druh}]`).click()

            cy.wrap(Cypress.$('[data-cy=input-rok]', form)).type(this.fileData.druhPriznania.rok)
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('4. Checking "Taxpayer data" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 13)     
            cy.wrap(Cypress.$(taxpayerBorderFields, form)).should('have.class', 'border-negative-700')
          })
        })

        it('5. Filling out "Taxpayer data" step', () => {
          cy.dataCy('form-container').then((form) => {
            if (this.fileData.udajeODanovnikovi.voSvojomMene) {
              cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-k-dani-z-nehnuteľností-vo-svojom-mene]', form)).find(`[data-cy=radio-áno]`).click()
            } else {
              cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-k-dani-z-nehnuteľností-vo-svojom-mene]', form)).find(`[data-cy=radio-nie]`).click()
            }

            cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-ako]', form)).find(`[data-cy=radio-${this.fileData.udajeODanovnikovi.priznanieAko}]`).click()

            cy.wrap(Cypress.$('[data-cy=input-rodneCislo]', form)).type(this.fileData.udajeODanovnikovi.rodneCislo)
            cy.wrap(Cypress.$('[data-cy=input-priezvisko]', form)).type(this.fileData.udajeODanovnikovi.menoTitul.priezvisko)
            cy.wrap(Cypress.$('[data-cy=input-meno]', form)).type(this.fileData.udajeODanovnikovi.menoTitul.meno)
            cy.wrap(Cypress.$('[data-cy=input-ulica]', form)).type(this.fileData.udajeODanovnikovi.ulicaCisloFyzickaOsoba.ulica)
            cy.wrap(Cypress.$('[data-cy=input-cislo]', form)).type(this.fileData.udajeODanovnikovi.ulicaCisloFyzickaOsoba.cislo)
            cy.wrap(Cypress.$('[data-cy=input-obec]', form)).type(this.fileData.udajeODanovnikovi.obecPsc.obec)
            cy.wrap(Cypress.$('[data-cy=input-psc]', form)).type(this.fileData.udajeODanovnikovi.obecPsc.psc)

            if (this.fileData.udajeODanovnikovi.stat !== 'Slovenská republika') {
              cy.wrap(Cypress.$('[data-cy=select-štát]', form)).click()
              cy.wrap(Cypress.$('[data-cy=select-štát]', form)).contains(this.fileData.udajeODanovnikovi.stat).click()
            }

            if (this.fileData.udajeODanovnikovi.korespondencnaAdresa.korespondencnaAdresaRovnaka) {
              cy.wrap(Cypress.$('[data-cy=radio-group-je-korešpondenčná-adresa-rovnáká-ako-adresa-trvalého-pobytu]', form)).find(`[data-cy=radio-áno]`).click()
            } else {
              cy.wrap(Cypress.$('[data-cy=radio-group-je-korešpondenčná-adresa-rovnáká-ako-adresa-trvalého-pobytu]', form)).find(`[data-cy=radio-nie]`).click()
            }

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(this.fileData.udajeODanovnikovi.email)
            cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).type(this.fileData.udajeODanovnikovi.telefon)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('6. Checking "Land tax return" step validation.', () => {
          if (this.fileData.danZPozemkov.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
            })

            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 9)     
              cy.wrap(Cypress.$(landTaxBorderFields, form)).should('have.class', 'border-negative-700')
            })
          } else {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('7. Filling out "Land tax return" step.', () => {
          if (this.fileData.danZPozemkov.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              if (!this.fileData.danZPozemkov.kalkulackaWrapper.pouzitKalkulacku) {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-kalkulačka-výpočtu-výmery-pozemkov]', form)).find(`[data-cy=checkbox-true]`).click()
              }

              // Priznanie
              cy.get(this.fileData.danZPozemkov.priznania).each((dataPriznania, indexPriznania) => {
                if (indexPriznania > 0) {
                  cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(1)).click()
                }
                cy.dataCy(`section-priznania-${indexPriznania}`).then((priznania) => {
                  cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-${this.fileData.danZPozemkov.priznania[indexPriznania].pravnyVztah}]`).click()

                  cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-${this.fileData.danZPozemkov.priznania[indexPriznania].spoluvlastnictvo}]`).click()

                  // Pozemky
                  cy.get(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky).each((dataPozemky, indexPozemky) => {
                    if (indexPozemky > 0) {
                      cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                    }

                    cy.dataCy(`section-pozemky-${indexPozemky}`).then((pozemky) => {
                      cy.wrap(Cypress.$('[data-cy=input-cisloListuVlastnictva]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].cisloListuVlastnictva)

                      cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', pozemky)).click()
                      cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', pozemky)).contains(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].kataster).click()

                      cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].parcelneCisloSposobVyuzitiaPozemku.cisloParcely)

                      cy.wrap(Cypress.$('[data-cy=select-druh-pozemku]', pozemky)).click()
                      cy.wrap(Cypress.$('[data-cy=select-druh-pozemku]', pozemky)).contains(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].druhPozemku).click()

                      cy.wrap(Cypress.$('[data-cy=input-celkovaVymeraPozemku]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].celkovaVymeraPozemku)
                      cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', priznania)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[0].podielPriestoruNaSpolocnychCastiachAZariadeniachDomu)
                      cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].spoluvlastnickyPodiel)
                    })
                  })
                })
              })
              
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('8. Checking "Construction tax return - one purpose" step validation.', () => {
          if (this.fileData.danZoStaviebJedenUcel.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
            })

            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 12)     
              cy.wrap(Cypress.$(onePurposeTaxBorderFields, form)).should('have.class', 'border-negative-700')
            })
          } else {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('9. Filling out "Construction tax return - one purpose" step.', () => { 
          // TODO
          /*
          if (this.fileData.danZoStaviebJedenUcel.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              if (!this.fileData.danZPozemkov.kalkulackaWrapper.pouzitKalkulacku) {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-kalkulačka-výpočtu-výmery-zastavanej-plochy-stavby]', form)).find(`[data-cy=checkbox-true]`).click()
              }

              // Priznanie
              cy.get(this.fileData.danZPozemkov.priznania).each((dataPriznania, indexPriznania) => {
                if (indexPriznania > 0) {
                  cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                }
                cy.dataCy(`section-priznania-${indexPriznania}`).then((priznania) => {
                  cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-${this.fileData.danZPozemkov.priznania[indexPriznania].pravnyVztah}]`).click()

                  cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-${this.fileData.danZPozemkov.priznania[indexPriznania].spoluvlastnictvo}]`).click()

                  // Pozemky
                  cy.get(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky).each((dataPozemky, indexPozemky) => {
                    cy.dataCy(`section-pozemky-${indexPozemky}`).then((pozemky) => {
    
                      cy.wrap(Cypress.$('[data-cy=input-ulicaACisloDomu]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].parcelneCisloSposobVyuzitiaPozemku.cisloParcely)

                      cy.wrap(Cypress.$('[data-cy=select-druh-pozemku]', pozemky)).click()
                      cy.wrap(Cypress.$('[data-cy=select-druh-pozemku]', pozemky)).contains(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].druhPozemku).click()

                      cy.wrap(Cypress.$('[data-cy=input-celkovaVymeraPozemku]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].celkovaVymeraPozemku)
                      cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', priznania)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[0].podielPriestoruNaSpolocnychCastiachAZariadeniachDomu)
                      cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].spoluvlastnickyPodiel)
                    })
                  })
                })
              })
              
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
          */
        })

        it('10. Checking "Construction tax return - multi purpose" step validation.', () => {
          if (this.fileData.danZoStaviebViacereUcely.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
            })

            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 14)     
              cy.wrap(Cypress.$(multiPurposeTaxBorderFields, form)).should('have.class', 'border-negative-700')
            })
          } else {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('11. Filling out "Construction tax return - multi purpose" step.', () => {
          // TODO
        })

        it('12. Checking "Tax return - apartments and non residential" step validation.', () => {
          if (this.fileData.danZBytovANebytovychPriestorov.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
            })

            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 9)     
              cy.wrap(Cypress.$(nonResidentialTaxBorderFields, form)).should('have.class', 'border-negative-700')
            })
          } else {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('13. Filling out "Tax return - apartments and non residential" step.', () => {
          // TODO
        })

        it('14. Filling out "Reduction or exemption from tax" step.', () => {
          cy.dataCy('form-container').then((form) => {
            if (this.fileData.znizenieAleboOslobodenieOdDane.byty.length > 0) {
              this.fileData.znizenieAleboOslobodenieOdDane.byty.map((byt) => {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-byty]', form)).find(`[data-cy=checkbox-${byt}]`).click()
              })
            } else if (this.fileData.znizenieAleboOslobodenieOdDane.stavby.length > 0) {
              this.fileData.znizenieAleboOslobodenieOdDane.stavby.map((stavba) => {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-stavby]', form)).find(`[data-cy=checkbox-${stavba}]`).click()
              })
            } else if (this.fileData.znizenieAleboOslobodenieOdDane.pozemky.length > 0) {
              this.fileData.znizenieAleboOslobodenieOdDane.pozemky.map((pozemok) => {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-pozemky]', form)).find(`[data-cy=checkbox-${pozemok}]`).click()
              })
            }

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('15. Check summary and download pdf.', () => {
          cy.dataCy('alert-container').should('not.exist')
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(summaryBorderFields, form)).should('not.have.class', 'border-red-500');
            cy.wrap(Cypress.$(`[data-cy=download-pdf-button-${device}]`, form)).click()
          })
        })

        it('16. Check downloaded pdf.', () => {
          const downloadsFolder = Cypress.config("downloadsFolder");
          cy.readFile(path.join(downloadsFolder, "priznanie-k-dani-z-nehnutelnosti_output.pdf")).should("exist");
        })
      })
    })
})
