"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSlovenskoXmlSummary = exports.SlovenskoSkSummaryXml = void 0;
const react_1 = __importDefault(require("react"));
const SummaryRenderer_1 = require("../summary-renderer/SummaryRenderer");
const validateSummary_1 = require("../summary-renderer/validateSummary");
const server_1 = require("react-dom/server");
const getSummaryJsonNode_1 = require("../summary-json/getSummaryJsonNode");
const xml2js_1 = require("xml2js");
const mergeClientAndServerFiles_1 = require("../form-files/mergeClientAndServerFiles");
const FormRenderer = ({ children, form }) => (react_1.default.createElement("slovensko-sk-form", { title: form.title }, children));
const StepRenderer = ({ step, children }) => (react_1.default.createElement("slovensko-sk-step", { id: step.id, title: step.title }, children));
const FieldRenderer = ({ field, children }) => {
    return (react_1.default.createElement("slovensko-sk-field", { id: field.id, label: field.label }, children));
};
const StringValueRenderer = ({ value }) => {
    return react_1.default.createElement("slovensko-sk-string-value", null, value);
};
const FileValueRenderer = ({ fileInfo }) => {
    return react_1.default.createElement("slovensko-sk-file-value", { id: fileInfo.id }, fileInfo.fileName);
};
const NoneValueRenderer = () => {
    return react_1.default.createElement("slovensko-sk-none-value", null);
};
const InvalidValueRenderer = () => {
    return react_1.default.createElement("slovensko-sk-invalid-value", null);
};
const ArrayRenderer = ({ array, children }) => (react_1.default.createElement("slovensko-sk-array", { id: array.id, title: array.title }, children));
const ArrayItemRenderer = ({ arrayItem, children }) => {
    return (react_1.default.createElement("slovensko-sk-array-item", { id: arrayItem.id, title: arrayItem.title }, children));
};
const SlovenskoSkSummaryXml = ({ summaryJson, validatedSummary, }) => {
    return (react_1.default.createElement(SummaryRenderer_1.SummaryRenderer, { summaryJson: summaryJson, validatedSummary: validatedSummary, renderForm: FormRenderer, renderStep: StepRenderer, renderField: FieldRenderer, renderArray: ArrayRenderer, renderArrayItem: ArrayItemRenderer, renderStringValue: StringValueRenderer, renderFileValue: FileValueRenderer, renderNoneValue: NoneValueRenderer, renderInvalidValue: InvalidValueRenderer }));
};
exports.SlovenskoSkSummaryXml = SlovenskoSkSummaryXml;
const map = {
    'slovensko-sk-form': 'Form',
    'slovensko-sk-step': 'Step',
    'slovensko-sk-array': 'Array',
    'slovensko-sk-array-item': 'ArrayItem',
    'slovensko-sk-field': 'Field',
    'slovensko-sk-string-value': 'StringValue',
    'slovensko-sk-file-value': 'FileValue',
    'slovensko-sk-none-value': 'NoneValue',
    'slovensko-sk-invalid-value': 'InvalidValue',
};
const parser = new xml2js_1.Parser({
    tagNameProcessors: [
        (name) => {
            if (!(name in map)) {
                throw new Error(`Unknown tag ${name}`);
            }
            return map[name];
        },
    ],
});
async function renderSlovenskoXmlSummary(formDefinition, formData, validatorRegistry, serverFiles) {
    const summaryJson = (0, getSummaryJsonNode_1.getSummaryJsonNode)(formDefinition.schemas.schema, formDefinition.schemas.uiSchema, formData, validatorRegistry);
    const fileInfos = (0, mergeClientAndServerFiles_1.mergeClientAndServerFilesSummary)([], serverFiles);
    const validatedSummary = (0, validateSummary_1.validateSummary)(formDefinition.schemas.schema, formData, fileInfos, validatorRegistry);
    const stringXml = (0, server_1.renderToString)(react_1.default.createElement(exports.SlovenskoSkSummaryXml, { summaryJson: summaryJson, validatedSummary: validatedSummary }));
    return await parser.parseStringPromise(stringXml);
}
exports.renderSlovenskoXmlSummary = renderSlovenskoXmlSummary;
