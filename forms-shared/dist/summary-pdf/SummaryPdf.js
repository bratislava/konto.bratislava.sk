"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryPdf = void 0;
const react_1 = __importDefault(require("react"));
const SummaryRenderer_1 = require("../summary-renderer/SummaryRenderer");
const react_markdown_1 = __importDefault(require("react-markdown"));
const classnames_1 = __importDefault(require("classnames"));
const renderTemplate_1 = require("../string-templates/renderTemplate");
const FormRenderer = ({ form, children }) => (react_1.default.createElement("div", { className: "flex flex-col gap-8" },
    react_1.default.createElement("h1", { className: "text-2xl font-semibold" }, form.title),
    children));
const StepRenderer = ({ step, children }) => (react_1.default.createElement("div", { className: "flex flex-col gap-4" },
    react_1.default.createElement("h2", { className: "text-xl font-semibold" }, step.title),
    react_1.default.createElement("div", null, children)));
const FieldRenderer = ({ field, hasError, children }) => {
    const wrapperClass = (0, classnames_1.default)('flex flex-row flex-nowrap gap-2 border-b-2 py-2.5', {
        'border-gray-200': !hasError,
        'border-red-500': hasError,
    });
    return (react_1.default.createElement("div", { className: wrapperClass },
        react_1.default.createElement("p", { className: "font-semibold flex-1" }, field.label),
        react_1.default.createElement("div", { className: "flex flex-1 flex-col gap-2" }, children)));
};
const StringValueRenderer = ({ value }) => {
    return react_1.default.createElement("span", { className: "whitespace-pre-wrap" }, value);
};
const FileIcon = () => (react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", fill: "none", viewBox: "0 0 24 24" },
    react_1.default.createElement("path", { fill: "currentColor", d: "M10.96 19.01c-1.39 1.39-3.81 1.39-5.2 0l-.41-.41a4.183 4.183 0 0 1 0-5.91l8.43-8.44c.99-.99 2.73-.99 3.72 0 .5.5.77 1.16.77 1.86 0 .7-.27 1.36-.77 1.86L9.07 16.4a.984.984 0 0 1-1.4 0c-.38-.39-.39-1.02 0-1.4l7.48-7.48-1.06-1.06-7.48 7.48c-.97.97-.97 2.55 0 3.52.97.97 2.55.97 3.52 0l8.43-8.43c.78-.78 1.21-1.82 1.21-2.92 0-1.1-.43-2.14-1.21-2.92a4.108 4.108 0 0 0-2.92-1.21c-1.1 0-2.14.43-2.92 1.21l-8.43 8.43a5.704 5.704 0 0 0 0 8.04l.41.41c.98.98 2.28 1.52 3.66 1.52 1.38 0 2.68-.54 3.66-1.52l7.78-7.78-1.06-1.06-7.78 7.78Z" })));
const FileValueRenderer = ({ fileInfo }) => {
    return (react_1.default.createElement("div", { className: "flex items-center gap-2" },
        react_1.default.createElement("div", { className: "shrink-0" },
            react_1.default.createElement(FileIcon, null)),
        react_1.default.createElement("span", null, fileInfo.fileName)));
};
const NoneValueRenderer = () => {
    return react_1.default.createElement("span", null, "-");
};
const InvalidValueRenderer = () => {
    return react_1.default.createElement("span", { className: "text-red-500" }, "Nezn\u00E1ma hodnota");
};
const ArrayRenderer = ({ array, children }) => (react_1.default.createElement("div", { className: "mt-4" },
    react_1.default.createElement("div", { className: "mb-4 font-semibold" }, array.title),
    children));
const getArrayDepth = (id) => id.split('_').filter((part) => !isNaN(parseInt(part))).length;
const ArrayItemRenderer = ({ arrayItem, children }) => {
    const arrayDepth = getArrayDepth(arrayItem.id);
    const wrapperClass = (0, classnames_1.default)('flex flex-col mb-4', {
        'rounded-xl border border-gray-200 p-6 gap-6': arrayDepth === 1,
        'gap-2': arrayDepth !== 1,
    });
    const spanClass = (0, classnames_1.default)('font-semibold', {
        'inline-block bg-gray-100 px-2 rounded-xl self-start': arrayDepth !== 1,
    });
    return (react_1.default.createElement("div", { className: wrapperClass },
        react_1.default.createElement("span", { className: spanClass }, arrayItem.title),
        react_1.default.createElement("div", null, children)));
};
const SummaryMarkdown = ({ className, children }) => {
    return (react_1.default.createElement(react_markdown_1.default, { className: className, components: {
            h2: ({ children }) => react_1.default.createElement("h2", { className: "text-h-xl font-semibold mb-4" }, children),
            h3: ({ children }) => react_1.default.createElement("h3", { className: "text-h-lg font-semibold mb-3" }, children),
            h4: ({ children }) => react_1.default.createElement("h4", { className: "text-h-md font-semibold mb-2" }, children),
            h5: ({ children }) => react_1.default.createElement("h5", { className: "text-h-base font-semibold mb-2" }, children),
            h6: ({ children }) => react_1.default.createElement("h6", { className: "text-h-xs font-semibold mb-2" }, children),
            p: ({ children }) => react_1.default.createElement("p", { className: "text-p-md font-normal mb-4" }, children),
            strong: ({ children }) => react_1.default.createElement("strong", { className: "font-semibold" }, children),
            ol: ({ children }) => react_1.default.createElement("ol", { className: "list-decimal pl-8 mb-4" }, children),
            ul: ({ children }) => react_1.default.createElement("ul", { className: "list-disc pl-8 mb-4" }, children),
            li: ({ children }) => react_1.default.createElement("li", { className: "text-p-md font-normal mb-2" }, children),
            a: ({ children, href }) => (react_1.default.createElement("a", { href: href, className: "font-semibold underline", target: "_blank" }, children)),
        } }, children));
};
const AdditionalInfo = ({ formDefinition, formData, }) => {
    const additionalInfo = (0, renderTemplate_1.renderFormAdditionalInfo)(formDefinition, formData);
    if (!additionalInfo) {
        return null;
    }
    return (react_1.default.createElement("div", { className: "flex flex-col gap-4" },
        react_1.default.createElement("h2", { className: "text-xl font-semibold" }, "Dopl\u0148uj\u00FAce inform\u00E1cie"),
        react_1.default.createElement(SummaryMarkdown, { className: "rounded-xl bg-gray-50 p-6" }, additionalInfo)));
};
const TermsAndConditions = ({ formDefinition }) => {
    return (react_1.default.createElement("div", { className: "flex flex-col gap-4" },
        react_1.default.createElement("h2", { className: "text-xl font-semibold" }, "Ochrana osobn\u00FDch \u00FAdajov"),
        react_1.default.createElement(SummaryMarkdown, { className: "rounded-xl bg-gray-50 p-6" }, formDefinition.termsAndConditions)));
};
const SummaryPdf = ({ formDefinition, cssToInject, summaryJson, validatedSummary, formData, }) => {
    return (react_1.default.createElement("html", null,
        react_1.default.createElement("head", null,
            react_1.default.createElement("title", null, summaryJson.title),
            react_1.default.createElement("style", { type: "text/css", dangerouslySetInnerHTML: { __html: cssToInject } })),
        react_1.default.createElement("body", { className: "font-sans text-[#333]" },
            react_1.default.createElement("div", { className: "flex flex-col gap-8" },
                react_1.default.createElement(SummaryRenderer_1.SummaryRenderer, { summaryJson: summaryJson, validatedSummary: validatedSummary, renderForm: FormRenderer, renderStep: StepRenderer, renderField: FieldRenderer, renderArray: ArrayRenderer, renderArrayItem: ArrayItemRenderer, renderStringValue: StringValueRenderer, renderFileValue: FileValueRenderer, renderNoneValue: NoneValueRenderer, renderInvalidValue: InvalidValueRenderer }),
                react_1.default.createElement(AdditionalInfo, { formDefinition: formDefinition, formData: formData }),
                react_1.default.createElement(TermsAndConditions, { formDefinition: formDefinition })))));
};
exports.SummaryPdf = SummaryPdf;
