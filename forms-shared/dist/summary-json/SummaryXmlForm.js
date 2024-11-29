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
exports.SummaryXmlForm = exports.SummaryXmlFormTag = void 0;
const core_1 = require("@rjsf/core");
const utils_1 = require("@rjsf/utils");
const react_1 = __importStar(require("react"));
const getArrayItemTitle_1 = require("../form-utils/getArrayItemTitle");
const uiOptionsTypes_1 = require("../generator/uiOptionsTypes");
const getSummaryDisplayValue_1 = require("./getSummaryDisplayValue");
const formDefaults_1 = require("../form-utils/formDefaults");
const getObjectFieldInfo_1 = require("../form-utils/getObjectFieldInfo");
var SummaryXmlFormTag;
(function (SummaryXmlFormTag) {
    SummaryXmlFormTag["Form"] = "summary-form";
    SummaryXmlFormTag["Step"] = "step";
    SummaryXmlFormTag["Array"] = "array";
    SummaryXmlFormTag["ArrayItem"] = "array-item";
    SummaryXmlFormTag["Field"] = "field";
})(SummaryXmlFormTag || (exports.SummaryXmlFormTag = SummaryXmlFormTag = {}));
const wrapWidget = (widgetType) => function wrap({ id, label, value, schema, options }) {
    return (react_1.default.createElement(SummaryXmlFormTag.Field, { id: id, label: label, type: widgetType, value: JSON.stringify(value), "display-values": JSON.stringify((0, getSummaryDisplayValue_1.getSummaryDisplayValues)(value, widgetType, schema, options)) }));
};
const FieldTemplate = ({ children }) => react_1.default.createElement(react_1.default.Fragment, null, children);
const ArrayFieldItemTemplate = ({ children, parentId, index, parentUiOptions, }) => {
    const id = `${parentId}_${index}`;
    const { itemTitle } = parentUiOptions;
    return (react_1.default.createElement(SummaryXmlFormTag.ArrayItem, { id: id, title: (0, getArrayItemTitle_1.getArrayItemTitle)(itemTitle, index) }, children));
};
const ArrayFieldTemplate = ({ title, items, idSchema, registry, uiSchema, }) => {
    const options = (0, utils_1.getUiOptions)(uiSchema);
    const id = idSchema.$id;
    const ItemTemplate = (0, utils_1.getTemplate)('ArrayFieldItemTemplate', registry);
    return (react_1.default.createElement(SummaryXmlFormTag.Array, { id: id, length: items.length, title: title }, items.map(({ key, ...itemProps }) => (react_1.default.createElement(ItemTemplate, { key: key, parentId: id, parentUiOptions: options, ...itemProps })))));
};
const ObjectFieldTemplate = ({ schema, properties, idSchema, title }) => {
    const { id, splitId, isFormObject, isStepObject } = (0, getObjectFieldInfo_1.getObjectFieldInfo)(idSchema);
    const content = properties.map((element, index) => (react_1.default.createElement(react_1.Fragment, { key: index }, element.content)));
    if (isFormObject) {
        return (react_1.default.createElement(SummaryXmlFormTag.Form, { id: id, title: schema.title }, content));
    }
    if (isStepObject) {
        const stepName = splitId[1];
        return (react_1.default.createElement(SummaryXmlFormTag.Step, { id: id, title: title, name: stepName }, content));
    }
    return react_1.default.createElement(react_1.default.Fragment, null, content);
};
const theme = {
    templates: {
        FieldTemplate,
        ObjectFieldTemplate,
        ArrayFieldTemplate,
        ArrayFieldItemTemplate: ArrayFieldItemTemplate,
    },
    widgets: {
        [uiOptionsTypes_1.BaWidgetType.Select]: wrapWidget(uiOptionsTypes_1.BaWidgetType.Select),
        [uiOptionsTypes_1.BaWidgetType.SelectMultiple]: wrapWidget(uiOptionsTypes_1.BaWidgetType.SelectMultiple),
        [uiOptionsTypes_1.BaWidgetType.Input]: wrapWidget(uiOptionsTypes_1.BaWidgetType.Input),
        [uiOptionsTypes_1.BaWidgetType.Number]: wrapWidget(uiOptionsTypes_1.BaWidgetType.Number),
        [uiOptionsTypes_1.BaWidgetType.RadioGroup]: wrapWidget(uiOptionsTypes_1.BaWidgetType.RadioGroup),
        [uiOptionsTypes_1.BaWidgetType.TextArea]: wrapWidget(uiOptionsTypes_1.BaWidgetType.TextArea),
        [uiOptionsTypes_1.BaWidgetType.Checkbox]: wrapWidget(uiOptionsTypes_1.BaWidgetType.Checkbox),
        [uiOptionsTypes_1.BaWidgetType.CheckboxGroup]: wrapWidget(uiOptionsTypes_1.BaWidgetType.CheckboxGroup),
        [uiOptionsTypes_1.BaWidgetType.FileUpload]: wrapWidget(uiOptionsTypes_1.BaWidgetType.FileUpload),
        [uiOptionsTypes_1.BaWidgetType.FileUploadMultiple]: wrapWidget(uiOptionsTypes_1.BaWidgetType.FileUploadMultiple),
        [uiOptionsTypes_1.BaWidgetType.DatePicker]: wrapWidget(uiOptionsTypes_1.BaWidgetType.DatePicker),
        [uiOptionsTypes_1.BaWidgetType.TimePicker]: wrapWidget(uiOptionsTypes_1.BaWidgetType.TimePicker),
    },
    fields: {
        [uiOptionsTypes_1.BaFieldType.CustomComponents]: () => null,
    },
};
const ThemedForm = (0, core_1.withTheme)(theme);
/**
 * Generates a summary XML form based on the provided schema, UI schema, and form data.
 *
 * Getting a summary for JSON Schema data is hard and is not supported by RJSF out of the box. This component leverages
 * that RJSF allows to customize the form rendering and generates a custom XML structure that represents the form data.
 * Unfortunately, it is not possible to generate a JSON summary directly, so the XML is later parsed into JSON.
 * The generated XML is tightly coupled with its parsing in `getSummaryJson` function, and it is not used anywhere else.
 */
const SummaryXmlForm = ({ schema, uiSchema, formData, validatorRegistry, }) => {
    return (react_1.default.createElement(ThemedForm, { schema: schema, uiSchema: uiSchema, formData: formData, 
        // RJSF renders the form in <form> tag by default.
        tagName: ({ children }) => react_1.default.createElement(react_1.default.Fragment, null, children), ...(0, formDefaults_1.getBaFormDefaults)(schema, validatorRegistry) },
        react_1.default.createElement(react_1.default.Fragment, null)));
};
exports.SummaryXmlForm = SummaryXmlForm;
