"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryEmail = void 0;
const react_1 = __importStar(require("react"));
const components_1 = require("@react-email/components");
const SummaryRenderer_1 = require("../summary-renderer/SummaryRenderer");
const FileIdInfoMapContext = (0, react_1.createContext)(null);
const useFileIdInfoMap = () => {
    const fileIdInfoMap = react_1.default.useContext(FileIdInfoMapContext);
    if (!fileIdInfoMap) {
        throw new Error('useFileIdInfoMap must be used within a FileIdInfoMapContext.Provider');
    }
    return fileIdInfoMap;
};
const FormRenderer = ({ form, children }) => (react_1.default.createElement(components_1.Container, null, children));
const StepRenderer = ({ step, children, isFirst }) => (react_1.default.createElement(components_1.Section, null,
    react_1.default.createElement(components_1.Text, { style: {
            fontSize: '20px',
            fontWeight: 'bold',
            marginTop: isFirst ? '0' : '16px',
            marginBottom: '16px',
        } }, step.title),
    children));
const FieldRenderer = ({ field, children }) => (react_1.default.createElement(components_1.Section, { style: {
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '10px',
        marginBottom: '10px',
    } },
    react_1.default.createElement(components_1.Text, { style: { margin: '0', fontWeight: 'bold' } }, field.label),
    children));
const StringValueRenderer = ({ value, isLast }) => (react_1.default.createElement(components_1.Text, { style: {
        margin: '0',
        paddingBottom: isLast ? '0' : '8px',
        whiteSpace: 'pre-wrap',
    } }, value));
const FileValueRenderer = ({ fileInfo, isLast }) => {
    const fileIdInfoMap = useFileIdInfoMap();
    const fileUrl = fileIdInfoMap[fileInfo.id].url;
    return (react_1.default.createElement(components_1.Text, { style: { margin: '0', paddingBottom: isLast ? '0' : '8px' } }, fileUrl ? react_1.default.createElement(components_1.Link, { href: fileUrl }, fileInfo.fileName) : fileInfo.fileName));
};
const NoneValueRenderer = ({ isLast }) => (react_1.default.createElement(components_1.Text, { style: { margin: '0', paddingBottom: isLast ? '0' : '8px' } }, "-"));
const InvalidValueRenderer = ({ isLast }) => (react_1.default.createElement(components_1.Text, { style: {
        margin: '0',
        paddingBottom: isLast ? '0' : '8px',
        color: '#ef4444',
    } }, "Nezn\u00E1ma hodnota"));
const ArrayRenderer = ({ array, children }) => (react_1.default.createElement(components_1.Section, null,
    react_1.default.createElement(components_1.Text, { style: { fontWeight: 'bold', margin: '0 0 16px 0' } }, array.title),
    children));
const ArrayItemRenderer = ({ arrayItem, children, isLast }) => (react_1.default.createElement(components_1.Section, { style: {
        borderLeft: '2px solid #e5e7eb',
        paddingLeft: '16px',
        marginTop: '0',
        marginBottom: isLast ? '0' : '16px',
    } },
    react_1.default.createElement(components_1.Text, { style: {
            display: 'inline-block',
            fontWeight: 'bold',
            backgroundColor: '#f3f4f6',
            padding: '0 8px',
            borderRadius: '12px',
            margin: '0 0 8px 0',
        } }, arrayItem.title),
    children));
const SummaryEmail = ({ summaryJson, validatedSummary, fileIdInfoMap, withHtmlBodyTags, }) => {
    const content = (react_1.default.createElement(FileIdInfoMapContext.Provider, { value: fileIdInfoMap },
        react_1.default.createElement(SummaryRenderer_1.SummaryRenderer, { summaryJson: summaryJson, validatedSummary: validatedSummary, renderForm: FormRenderer, renderStep: StepRenderer, renderField: FieldRenderer, renderArray: ArrayRenderer, renderArrayItem: ArrayItemRenderer, renderStringValue: StringValueRenderer, renderFileValue: FileValueRenderer, renderNoneValue: NoneValueRenderer, renderInvalidValue: InvalidValueRenderer })));
    if (!withHtmlBodyTags) {
        return content;
    }
    return (react_1.default.createElement(components_1.Html, null,
        react_1.default.createElement(components_1.Body, { style: {
                backgroundColor: '#ffffff',
                fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
            } }, content)));
};
exports.SummaryEmail = SummaryEmail;
