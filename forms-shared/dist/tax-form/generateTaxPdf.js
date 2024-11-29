"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTaxPdf = void 0;
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
const pdf_lib_1 = require("pdf-lib");
const functions_1 = require("./mapping/shared/functions");
const oslobodenieShared_1 = require("./mapping/shared/oslobodenieShared");
const pdf_1 = require("./mapping/pdf/pdf");
const taxPdf_1 = __importDefault(require("../generated-assets/taxPdf"));
const taxPdfFont_1 = __importDefault(require("../generated-assets/taxPdfFont"));
const copyOrRemovePages = async (pdfDoc, index, count) => {
    if (count === 0) {
        pdfDoc.removePage(index);
        return;
    }
    if (count === 1) {
        return;
    }
    for (let copyIndex = 0; copyIndex < count - 1; copyIndex++) {
        const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [index]);
        // This is a pretty esoteric code to rename all the fields on the copied page.
        // Our modification is to postfix all the field names with "_Copy{copyIndex + 1}".
        // https://github.com/Hopding/pdf-lib/issues/151#issuecomment-517965052
        const acroForm = copiedPage.doc.catalog.lookup(pdf_lib_1.PDFName.of('AcroForm'), pdf_lib_1.PDFDict);
        const acroFields = acroForm.lookup(pdf_lib_1.PDFName.of('Fields'), pdf_lib_1.PDFArray);
        acroForm.set(pdf_lib_1.PDFName.of('NeedAppearances'), pdf_lib_1.PDFBool.True);
        const annots = copiedPage.node.Annots();
        for (let idx = 0; idx < annots.size(); idx++) {
            const annot = annots.lookup(idx, pdf_lib_1.PDFDict);
            const tVal = annot.lookup(pdf_lib_1.PDFName.of('T')).value;
            annot.set(pdf_lib_1.PDFName.of('P'), copiedPage.ref);
            annot.set(pdf_lib_1.PDFName.of('T'), pdf_lib_1.PDFString.of(`${tVal}_Copy${copyIndex + 1}`));
            // This line is commented out because it was causing the checkboxes to not work in the copied pages.
            // annot.delete(PDFName.of('AP'))
            acroFields.push(annots.get(idx));
        }
        pdfDoc.insertPage(index + copyIndex + 1, copiedPage);
    }
};
/**
 * @returns Base64 encoded PDF
 */
async function generateTaxPdf({ formData, formId }) {
    const pdfDoc = await pdf_lib_1.PDFDocument.load(taxPdf_1.default, {
        parseSpeed: pdf_lib_1.ParseSpeeds.Fastest,
    });
    if (!formData) {
        return pdfDoc.saveAsBase64();
    }
    if (!(0, oslobodenieShared_1.zobrazitOslobodenie)(formData)) {
        ;
        [12, 11].forEach((index) => {
            pdfDoc.removePage(index);
        });
    }
    // Sections we don't need.
    ;
    [
        10, // PRIZNANIE K DANI ZA NEVÝHERNÉ HRACIE PRÍSTROJE
        9, // PRIZNANIE K DANI ZA NEVÝHERNÉ HRACIE PRÍSTROJE
        8, // PRIZNANIE K DANI ZA PREDAJNÉ AUTOMATY
        7, // PRIZNANIE K DANI ZA PREDAJNÉ AUTOMATY
        6, // PRIZNANIE K DANI ZA PSA
    ].forEach((index) => {
        pdfDoc.removePage(index);
    });
    const { pocetPozemkov, pocetStaviebJedenUcel, pocetStaviebViacereUcely, pocetBytov } = (0, functions_1.getPocty)(formData);
    // Pages must be copied or removed in reverse order, because the existing pages are shifted when a new page is
    // inserted or removed.
    await copyOrRemovePages(pdfDoc, 5, pocetBytov);
    await copyOrRemovePages(pdfDoc, 4, pocetStaviebViacereUcely);
    await copyOrRemovePages(pdfDoc, 3, pocetStaviebJedenUcel);
    await copyOrRemovePages(pdfDoc, 2, pocetPozemkov);
    // The original PDF doesn't contain embedded font, therefore it doesn't support Unicode characters, for example it
    // throws error when trying to use "č" (0x010d):
    // https://github.com/Hopding/pdf-lib/issues/1147
    //
    // Therefore, a font must be embedded. It is not possible to embed the original "Arial" for licensing reasons, so
    // we use "Liberation Sans", which is a free alternative to "Arial", instead.
    // More info about Unicode in PDF: https://github.com/Hopding/pdf-lib?tab=readme-ov-file#fonts-and-unicode
    pdfDoc.registerFontkit(fontkit_1.default);
    const liberationSansFont = await pdfDoc.embedFont(taxPdfFont_1.default);
    const mapping = (0, pdf_1.getTaxFormPdfMapping)(formData, formId);
    const fields = pdfDoc.getForm().getFields();
    fields.forEach((field) => {
        const fieldName = field.getName();
        const value = mapping[fieldName];
        if (field instanceof pdf_lib_1.PDFCheckBox && typeof value === 'boolean') {
            if (value) {
                field.check();
            }
            else {
                field.uncheck();
            }
        }
        if (field instanceof pdf_lib_1.PDFTextField && !field.isReadOnly()) {
            if (typeof value === 'string') {
                const maxLength = field.getMaxLength();
                // Using value.length is not enough, because the PDF calculates the length differently, taken from:
                // https://github.com/Hopding/pdf-lib/blob/93dd36e85aa659a3bca09867d2d8fac172501fbe/src/api/text/layout.ts#L245
                const pdfLength = (0, pdf_lib_1.mergeLines)((0, pdf_lib_1.cleanText)(value)).length;
                // The original PDF contains many fields with a maximum length, but it is not suitable for many fields, therefore
                // we remove the maximum length from all affected fields. Combed fields will become uncombed which is expected.
                if (maxLength != null && maxLength < pdfLength) {
                    field.setMaxLength();
                }
                field.setText(value);
            }
            // We want to update font for each field, to have a consistent look when user edits PDF manually.
            field.updateAppearances(liberationSansFont);
        }
    });
    return pdfDoc.saveAsBase64();
}
exports.generateTaxPdf = generateTaxPdf;
