"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSummaryEmail = void 0;
const react_1 = __importDefault(require("react"));
const getSummaryJsonNode_1 = require("../summary-json/getSummaryJsonNode");
const mergeClientAndServerFiles_1 = require("../form-files/mergeClientAndServerFiles");
const validateSummary_1 = require("../summary-renderer/validateSummary");
const components_1 = require("@react-email/components");
const SummaryEmail_1 = require("./SummaryEmail");
const renderSummaryEmail = async ({ formDefinition, formData, fileIdInfoMap, validatorRegistry, serverFiles, withHtmlBodyTags = false, }) => {
    const summaryJson = (0, getSummaryJsonNode_1.getSummaryJsonNode)(formDefinition.schemas.schema, formDefinition.schemas.uiSchema, formData, validatorRegistry);
    const fileInfos = (0, mergeClientAndServerFiles_1.mergeClientAndServerFilesSummary)([], serverFiles);
    const validatedSummary = (0, validateSummary_1.validateSummary)(formDefinition.schemas.schema, formData, fileInfos, validatorRegistry);
    return (0, components_1.render)(react_1.default.createElement(SummaryEmail_1.SummaryEmail, { summaryJson: summaryJson, validatedSummary: validatedSummary, fileIdInfoMap: fileIdInfoMap, withHtmlBodyTags: withHtmlBodyTags }));
};
exports.renderSummaryEmail = renderSummaryEmail;
