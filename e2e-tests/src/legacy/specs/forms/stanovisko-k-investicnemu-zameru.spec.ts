import { test } from '@playwright/test'
import example from 'forms-shared/example-forms/examples/stanoviskoKInvesticnemuZameruExample'

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
 * `stanovisko k investičnému zámeru`, filled step by step with per-step validation checks.
 *
 * Hand-written on purpose: explicit field ids, explicit step order, no schema introspection. Only
 * the values come from the `forms-shared` example, so they stay typed against the schema.
 *
 * Cypress source:
 * https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress/e2e/form/formSIZ.cy.ts
 */

const data = example.formData as {
  ziadatel: Record<string, string>
  stavebnik: Record<string, string>
  zodpovednyProjektant: Record<string, string>
  stavba: {
    nazov: string
    ulica: string
    supisneCislo: string
    parcelneCisla: string
    clenenieStavby: Record<string, string>
  }
}

const SLUG = 'stanovisko-k-investicnemu-zameru'

/** Cypress: F01 `formSIZ.cy.ts` — `it` 1–11. */
test(
  'stanovisko k investičnému zámeru is filled in and the summary has no errors',
  { tag: '@legacy' },
  async ({ page }) => {
    // Six steps plus an upload through forms-backend and ClamAV — past the default 30s.
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
      // `ziadatelTyp` already holds `fyzickaOsoba` by default; set it anyway so the spec states which
      // branch it is exercising.
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
      // The step is valid at its default ("Áno" — stavebník is the applicant), so it would advance
      // happily. The negative check only means anything after switching to "Nie", which unfolds the
      // whole block.
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
      // Single `fileUpload` rendered as `UploadButton`, which carries no `data-cy=file-input`.
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
      await fillIn(page, 'root_stavba_ulica', data.stavba.ulica)
      await fillIn(page, 'root_stavba_supisneCislo', data.stavba.supisneCislo)
      await fillIn(page, 'root_stavba_parcelneCisla', data.stavba.parcelneCisla)

      // `selectMultiple` — the example picks two cadastral areas.
      await pickSelectMultiple(page, 'root_stavba_katastralneUzemia', ['Karlova Ves', 'Dúbravka'])

      await fillIn(
        page,
        'root_stavba_clenenieStavby_hlavnaStavba',
        data.stavba.clenenieStavby.hlavnaStavba,
      )
      await fillIn(
        page,
        'root_stavba_clenenieStavby_clenenieHlavnejStavby',
        data.stavba.clenenieStavby.clenenieHlavnejStavby,
      )
      await fillIn(
        page,
        'root_stavba_clenenieStavby_hlavnaStavbaPodlaUcelu',
        data.stavba.clenenieStavby.hlavnaStavbaPodlaUcelu,
      )
      await fillIn(
        page,
        'root_stavba_clenenieStavby_ostatneStavby',
        data.stavba.clenenieStavby.ostatneStavby,
      )

      await continueTo(page, 'prilohy')
    })

    await test.step('prílohy — empty step is rejected', async () => {
      await expectStepRejected(page, 'prilohy', ['root_prilohy_architektonickaStudia'])
    })

    await test.step('prílohy', async () => {
      await attachFiles(page, 'root_prilohy_architektonickaStudia', ['architektonicka-studia.pdf'])
      await continueTo(page, 'sumar')
    })

    await test.step('summary', async () => {
      await expectSummaryWithoutErrors(page)

      await expectSummaryRow(page, 'root_ziadatel_meno', data.ziadatel.meno)
      await expectSummaryRow(page, 'root_ziadatel_email', data.ziadatel.email)
      await expectSummaryRow(page, 'root_stavebnik_priezvisko', data.stavebnik.priezvisko)
      await expectSummaryRow(page, 'root_zodpovednyProjektant_meno', data.zodpovednyProjektant.meno)
      await expectSummaryRow(page, 'root_stavba_nazov', data.stavba.nazov)
      await expectSummaryRow(page, 'root_stavba_katastralneUzemia', 'Karlova Ves')
      await expectSummaryRow(page, 'root_stavba_katastralneUzemia', 'Dúbravka')
      await expectSummaryRow(
        page,
        'root_prilohy_architektonickaStudia',
        'architektonicka-studia.pdf',
      )
    })
  },
)
