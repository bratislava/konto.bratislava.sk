import { test } from '@playwright/test'
import example from 'forms-shared/example-forms/examples/zavazneStanoviskoKInvesticnejCinnostiExample'

import { openForm } from '../../pages/FormPage'
import {
  attachFiles,
  continueTo,
  expectStepRejected,
  expectSummaryRow,
  expectSummaryWithoutErrors,
  fillIn,
  pickDate,
  pickRadio,
  pickSelectMultiple,
} from '../../helpers'

/**
 * `záväzné stanovisko k investičnej činnosti`, filled step by step with per-step validation checks.
 *
 * Same shape as the sibling SIZ spec, plus the `typ žiadosti` step and the apartment counts behind
 * `clenenieStavby.obsahujeByty`.
 *
 * Cypress source:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/form/formZSIZ.cy.ts
 */

const data = example.formData as {
  ziadatel: Record<string, string>
  stavebnik: Record<string, string>
  zodpovednyProjektant: Record<string, string>
  stavba: {
    nazov: string
    idStavby: string
    ulica: string
    supisneCislo: string
    parcelneCisla: string
    clenenieStavby: Record<string, string | number | boolean>
  }
  typZiadosti: { typ: string }
}

const SLUG = 'zavazne-stanovisko-k-investicnej-cinnosti'
const clenenie = data.stavba.clenenieStavby

/** Cypress: F02 `formZSIZ.cy.ts` — `it` 1–12. */
test(
  'záväzné stanovisko k investičnej činnosti is filled in and the summary has no errors',
  { tag: '@legacy' },
  async ({ page }) => {
    // Seven steps plus two uploads through forms-backend and ClamAV — past the default 30s.
    test.slow()

    await openForm(page, SLUG)

    await test.step('žiadateľ — empty step is rejected', async () => {
      await expectStepRejected(page, 'ziadatel', [
        'root_ziadatel_meno',
        'root_ziadatel_priezvisko',
        'root_ziadatel_ulicaACislo',
        'root_ziadatel_mesto',
        'root_ziadatel_psc',
        'root_ziadatel_email',
        'root_ziadatel_telefon',
      ])
    })

    await test.step('žiadateľ', async () => {
      await pickRadio(page, 'root_ziadatel_ziadatelTyp', 'fyzickaOsoba')
      await fillIn(page, 'root_ziadatel_meno', data.ziadatel.meno)
      await fillIn(page, 'root_ziadatel_priezvisko', data.ziadatel.priezvisko)
      await fillIn(page, 'root_ziadatel_ulicaACislo', data.ziadatel.ulicaACislo)
      await fillIn(page, 'root_ziadatel_mesto', data.ziadatel.mesto)
      await fillIn(page, 'root_ziadatel_psc', data.ziadatel.psc)
      await fillIn(page, 'root_ziadatel_email', data.ziadatel.email)
      await fillIn(page, 'root_ziadatel_telefon', data.ziadatel.telefon)

      await continueTo(page, 'stavebnik')
    })

    await test.step('stavebník — empty step is rejected after answering "Nie"', async () => {
      await pickRadio(page, 'root_stavebnik_stavebnikZiadatelom', false)

      await expectStepRejected(page, 'stavebnik', [
        'root_stavebnik_splnomocnenie',
        'root_stavebnik_meno',
        'root_stavebnik_priezvisko',
        'root_stavebnik_ulicaACislo',
        'root_stavebnik_mesto',
        'root_stavebnik_psc',
        'root_stavebnik_email',
        'root_stavebnik_telefon',
      ])
    })

    await test.step('stavebník', async () => {
      await attachFiles(page, 'root_stavebnik_splnomocnenie', ['splnomocnenie.pdf'])

      await pickRadio(page, 'root_stavebnik_ziadatelTyp', 'fyzickaOsoba')
      await fillIn(page, 'root_stavebnik_meno', data.stavebnik.meno)
      await fillIn(page, 'root_stavebnik_priezvisko', data.stavebnik.priezvisko)
      await fillIn(page, 'root_stavebnik_ulicaACislo', data.stavebnik.ulicaACislo)
      await fillIn(page, 'root_stavebnik_mesto', data.stavebnik.mesto)
      await fillIn(page, 'root_stavebnik_psc', data.stavebnik.psc)
      await fillIn(page, 'root_stavebnik_email', data.stavebnik.email)
      await fillIn(page, 'root_stavebnik_telefon', data.stavebnik.telefon)

      await continueTo(page, 'zodpovedny-projektant')
    })

    await test.step('zodpovedný projektant — empty step is rejected', async () => {
      await expectStepRejected(page, 'zodpovedny-projektant', [
        'root_zodpovednyProjektant_meno',
        'root_zodpovednyProjektant_priezvisko',
        'root_zodpovednyProjektant_email',
        'root_zodpovednyProjektant_telefon',
        'root_zodpovednyProjektant_autorizacneOsvedcenie',
        'root_zodpovednyProjektant_datumSpracovania',
      ])
    })

    await test.step('zodpovedný projektant', async () => {
      await fillIn(page, 'root_zodpovednyProjektant_meno', data.zodpovednyProjektant.meno)
      await fillIn(
        page,
        'root_zodpovednyProjektant_priezvisko',
        data.zodpovednyProjektant.priezvisko,
      )
      await fillIn(page, 'root_zodpovednyProjektant_email', data.zodpovednyProjektant.email)
      await fillIn(page, 'root_zodpovednyProjektant_telefon', data.zodpovednyProjektant.telefon)
      await fillIn(
        page,
        'root_zodpovednyProjektant_autorizacneOsvedcenie',
        data.zodpovednyProjektant.autorizacneOsvedcenie,
      )
      await pickDate(
        page,
        'root_zodpovednyProjektant_datumSpracovania',
        data.zodpovednyProjektant.datumSpracovania,
      )

      await continueTo(page, 'informacie-o-stavbe')
    })

    await test.step('informácie o stavbe — empty step is rejected', async () => {
      // `obsahujeByty` defaults to "Nie", which satisfies it, so it is not in the expected error list.
      await expectStepRejected(page, 'informacie-o-stavbe', [
        'root_stavba_nazov',
        'root_stavba_ulica',
        'root_stavba_parcelneCisla',
        'root_stavba_katastralneUzemia',
        'root_stavba_clenenieStavby_hlavnaStavba',
        'root_stavba_clenenieStavby_hlavnaStavbaPodlaUcelu',
      ])
    })

    await test.step('informácie o stavbe', async () => {
      await fillIn(page, 'root_stavba_nazov', data.stavba.nazov)
      await fillIn(page, 'root_stavba_idStavby', data.stavba.idStavby)
      await fillIn(page, 'root_stavba_ulica', data.stavba.ulica)
      await fillIn(page, 'root_stavba_supisneCislo', data.stavba.supisneCislo)
      await fillIn(page, 'root_stavba_parcelneCisla', data.stavba.parcelneCisla)
      await pickSelectMultiple(page, 'root_stavba_katastralneUzemia', ['Karlova Ves', 'Dúbravka'])

      await fillIn(page, 'root_stavba_clenenieStavby_hlavnaStavba', String(clenenie.hlavnaStavba))
      await fillIn(
        page,
        'root_stavba_clenenieStavby_clenenieHlavnejStavby',
        String(clenenie.clenenieHlavnejStavby),
      )
      await fillIn(
        page,
        'root_stavba_clenenieStavby_hlavnaStavbaPodlaUcelu',
        String(clenenie.hlavnaStavbaPodlaUcelu),
      )
      await fillIn(page, 'root_stavba_clenenieStavby_ostatneStavby', String(clenenie.ostatneStavby))

      // Defaults to "Nie"; switching it reveals the six apartment counts below.
      await pickRadio(page, 'root_stavba_clenenieStavby_obsahujeByty', true)

      await fillIn(
        page,
        'root_stavba_clenenieStavby_pocetBytovCelkovo',
        Number(clenenie.pocetBytovCelkovo),
      )
      await fillIn(
        page,
        'root_stavba_clenenieStavby_pocet1IzbovychBytov',
        Number(clenenie.pocet1IzbovychBytov),
      )
      await fillIn(
        page,
        'root_stavba_clenenieStavby_pocet2IzbovychBytov',
        Number(clenenie.pocet2IzbovychBytov),
      )
      await fillIn(
        page,
        'root_stavba_clenenieStavby_pocet3IzbovychBytov',
        Number(clenenie.pocet3IzbovychBytov),
      )
      await fillIn(
        page,
        'root_stavba_clenenieStavby_pocet4IzbovychBytov',
        Number(clenenie.pocet4IzbovychBytov),
      )
      // Required and legitimately zero — it has to be typed, not left blank.
      await fillIn(
        page,
        'root_stavba_clenenieStavby_pocetViacAko4IzbovychBytov',
        Number(clenenie.pocetViacAko4IzbovychBytov),
      )

      await continueTo(page, 'typ-ziadosti')
    })

    await test.step('typ žiadosti — empty step is rejected', async () => {
      // The only step in either form with no preselected option, so this is the cleanest negative check.
      await expectStepRejected(page, 'typ-ziadosti', ['root_typZiadosti_typ'])
    })

    await test.step('typ žiadosti', async () => {
      await pickRadio(page, 'root_typZiadosti_typ', data.typZiadosti.typ)
      await continueTo(page, 'prilohy')
    })

    await test.step('prílohy — empty step is rejected', async () => {
      await expectStepRejected(page, 'prilohy', ['root_prilohy_projektovaDokumentacia'])
    })

    await test.step('prílohy', async () => {
      // Two files. The field is valid with one, so they are uploaded under distinct names and both are
      // asserted on the summary — otherwise the second file could silently go missing.
      await attachFiles(page, 'root_prilohy_projektovaDokumentacia', [
        'projektova-dokumentacia-1.pdf',
        'projektova-dokumentacia-2.pdf',
      ])
      await continueTo(page, 'sumar')
    })

    await test.step('summary', async () => {
      await expectSummaryWithoutErrors(page)

      await expectSummaryRow(page, 'root_ziadatel_meno', data.ziadatel.meno)
      await expectSummaryRow(page, 'root_stavebnik_priezvisko', data.stavebnik.priezvisko)
      await expectSummaryRow(page, 'root_stavba_nazov', data.stavba.nazov)
      await expectSummaryRow(page, 'root_stavba_idStavby', data.stavba.idStavby)
      await expectSummaryRow(page, 'root_stavba_katastralneUzemia', 'Karlova Ves')
      await expectSummaryRow(page, 'root_stavba_katastralneUzemia', 'Dúbravka')
      await expectSummaryRow(
        page,
        'root_stavba_clenenieStavby_pocetBytovCelkovo',
        String(clenenie.pocetBytovCelkovo),
      )
      await expectSummaryRow(
        page,
        'root_prilohy_projektovaDokumentacia',
        'projektova-dokumentacia-1.pdf',
      )
      await expectSummaryRow(
        page,
        'root_prilohy_projektovaDokumentacia',
        'projektova-dokumentacia-2.pdf',
      )
    })
  },
)
