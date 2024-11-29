"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSummaryPdf = void 0;
const react_1 = __importDefault(require("react"));
const getSummaryJsonNode_1 = require("../summary-json/getSummaryJsonNode");
const server_1 = require("react-dom/server");
const SummaryPdf_1 = require("./SummaryPdf");
const mergeClientAndServerFiles_1 = require("../form-files/mergeClientAndServerFiles");
const validateSummary_1 = require("../summary-renderer/validateSummary");
const summaryPdfCss_1 = __importDefault(require("../generated-assets/summaryPdfCss"));
/**
 * Renders a summary PDF from the given JSON schema, UI schema and data.
 */
const renderSummaryPdf = async ({ formDefinition, formData, launchBrowser, validatorRegistry, clientFiles, serverFiles, }) => {
    const { schema, uiSchema } = formDefinition.schemas;
    const summaryJson = (0, getSummaryJsonNode_1.getSummaryJsonNode)(schema, uiSchema, formData, validatorRegistry);
    const fileInfos = (0, mergeClientAndServerFiles_1.mergeClientAndServerFilesSummary)(clientFiles, serverFiles);
    const validatedSummary = (0, validateSummary_1.validateSummary)(schema, formData, fileInfos, validatorRegistry);
    const renderedString = (0, server_1.renderToString)(react_1.default.createElement(SummaryPdf_1.SummaryPdf, { formDefinition: formDefinition, cssToInject: summaryPdfCss_1.default.toString(), summaryJson: summaryJson, validatedSummary: validatedSummary, formData: formData }));
    const browser = await launchBrowser();
    try {
        const page = await browser.newPage();
        await page.setContent(renderedString);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '1cm',
                bottom: '1cm',
                left: '1cm',
                right: '1cm',
            },
        });
        await browser.close();
        return pdfBuffer;
    }
    catch (error) {
        await browser.close();
        throw error;
    }
};
exports.renderSummaryPdf = renderSummaryPdf;
