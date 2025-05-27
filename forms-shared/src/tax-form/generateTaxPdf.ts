import fontkit from '@pdf-lib/fontkit'
import {
  cleanText,
  mergeLines,
  ParseSpeeds,
  PDFArray,
  PDFBool,
  PDFCheckBox,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFString,
  PDFTextField,
} from 'pdf-lib'

import { getPocty } from './mapping/shared/functions'
import { zobrazitOslobodenie } from './mapping/shared/oslobodenieShared'
import { getTaxFormPdfMapping } from './mapping/pdf/pdf'
import { TaxFormData } from './types'
import taxPdf from '../generated-assets/taxPdf'
import taxPdfFont from '../generated-assets/taxPdfFont'

export type GenerateTaxPdfPayload = {
  formData: TaxFormData
  formId?: string
}

const copyOrRemovePages = async (pdfDoc: PDFDocument, index: number, count: number) => {
  if (count === 0) {
    pdfDoc.removePage(index)
    return
  }
  if (count === 1) {
    return
  }

  for (let copyIndex = 0; copyIndex < count - 1; copyIndex++) {
    const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [index])

    // This is a pretty esoteric code to rename all the fields on the copied page.
    // Our modification is to postfix all the field names with "_Copy{copyIndex + 1}".
    // https://github.com/Hopding/pdf-lib/issues/151#issuecomment-517965052
    const acroForm = copiedPage.doc.catalog.lookup(PDFName.of('AcroForm'), PDFDict)
    const acroFields = acroForm.lookup(PDFName.of('Fields'), PDFArray)

    acroForm.set(PDFName.of('NeedAppearances'), PDFBool.True)

    const annots = copiedPage.node.Annots()!
    for (let idx = 0; idx < annots.size(); idx++) {
      const annot = annots.lookup(idx, PDFDict)
      const tVal = (annot.lookup(PDFName.of('T')) as unknown as { value: string }).value

      annot.set(PDFName.of('P'), copiedPage.ref)
      annot.set(PDFName.of('T'), PDFString.of(`${tVal}_Copy${copyIndex + 1}`))
      // This line is commented out because it was causing the checkboxes to not work in the copied pages.
      // annot.delete(PDFName.of('AP'))

      acroFields.push(annots.get(idx))
    }
    pdfDoc.insertPage(index + copyIndex + 1, copiedPage)
  }
}

/**
 * @returns Base64 encoded PDF
 */
export async function generateTaxPdf({ formData, formId }: GenerateTaxPdfPayload) {
  const pdfDoc = await PDFDocument.load(taxPdf, {
    parseSpeed: ParseSpeeds.Fastest,
  })
  if (!formData) {
    return pdfDoc.saveAsBase64()
  }

  if (!zobrazitOslobodenie(formData)) {
    ;[12, 11].forEach((index) => {
      pdfDoc.removePage(index)
    })
  }
  // Sections we don't need.
  ;[
    10, // PRIZNANIE K DANI ZA NEVÝHERNÉ HRACIE PRÍSTROJE
    9, // PRIZNANIE K DANI ZA NEVÝHERNÉ HRACIE PRÍSTROJE
    8, // PRIZNANIE K DANI ZA PREDAJNÉ AUTOMATY
    7, // PRIZNANIE K DANI ZA PREDAJNÉ AUTOMATY
    6, // PRIZNANIE K DANI ZA PSA
  ].forEach((index) => {
    pdfDoc.removePage(index)
  })

  const { pocetPozemkov, pocetStaviebJedenUcel, pocetStaviebViacereUcely, pocetBytov } =
    getPocty(formData)
  // Pages must be copied or removed in reverse order, because the existing pages are shifted when a new page is
  // inserted or removed.
  await copyOrRemovePages(pdfDoc, 5, pocetBytov)
  await copyOrRemovePages(pdfDoc, 4, pocetStaviebViacereUcely)
  await copyOrRemovePages(pdfDoc, 3, pocetStaviebJedenUcel)
  await copyOrRemovePages(pdfDoc, 2, pocetPozemkov)

  // The original PDF doesn't contain embedded font, therefore it doesn't support Unicode characters, for example it
  // throws error when trying to use "č" (0x010d):
  // https://github.com/Hopding/pdf-lib/issues/1147
  //
  // Therefore, a font must be embedded. It is not possible to embed the original "Arial" for licensing reasons, so
  // we use "Liberation Sans", which is a free alternative to "Arial", instead.
  // More info about Unicode in PDF: https://github.com/Hopding/pdf-lib?tab=readme-ov-file#fonts-and-unicode
  pdfDoc.registerFontkit(fontkit)
  const liberationSansFont = await pdfDoc.embedFont(taxPdfFont)

  const mapping = getTaxFormPdfMapping(formData, formId)

  const fields = pdfDoc.getForm().getFields()
  fields.forEach((field) => {
    const fieldName = field.getName()
    const value = mapping[fieldName]

    if (field instanceof PDFCheckBox && typeof value === 'boolean') {
      if (value) {
        field.check()
      } else {
        field.uncheck()
      }
    }

    if (field instanceof PDFTextField && !field.isReadOnly()) {
      if (typeof value === 'string') {
        const maxLength = field.getMaxLength()
        // Using value.length is not enough, because the PDF calculates the length differently, taken from:
        // https://github.com/Hopding/pdf-lib/blob/93dd36e85aa659a3bca09867d2d8fac172501fbe/src/api/text/layout.ts#L245
        const pdfLength = mergeLines(cleanText(value)).length
        // The original PDF contains many fields with a maximum length, but it is not suitable for many fields, therefore
        // we remove the maximum length from all affected fields. Combed fields will become uncombed which is expected.
        if (maxLength != null && maxLength < pdfLength) {
          field.setMaxLength()
        }
        field.setText(value)
      }
      // We want to update font for each field, to have a consistent look when user edits PDF manually.
      field.updateAppearances(liberationSansFont)
    }
  })

  return pdfDoc.saveAsBase64()
}
