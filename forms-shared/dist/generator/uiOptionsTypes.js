"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaFieldType = exports.BaWidgetType = exports.markdownTextPrefix = void 0;
/**
 * Unique prefix for Markdown text.
 */
exports.markdownTextPrefix = `markdown_gKgflRNwdS:`;
var BaWidgetType;
(function (BaWidgetType) {
    BaWidgetType["Select"] = "Select";
    BaWidgetType["SelectMultiple"] = "SelectMultiple";
    BaWidgetType["Input"] = "Input";
    BaWidgetType["Number"] = "Number";
    BaWidgetType["RadioGroup"] = "RadioGroup";
    BaWidgetType["TextArea"] = "TextArea";
    BaWidgetType["Checkbox"] = "Checkbox";
    BaWidgetType["CheckboxGroup"] = "CheckboxGroup";
    BaWidgetType["FileUpload"] = "FileUpload";
    BaWidgetType["FileUploadMultiple"] = "FileUploadMultiple";
    BaWidgetType["DatePicker"] = "DatePicker";
    BaWidgetType["TimePicker"] = "TimePicker";
})(BaWidgetType || (exports.BaWidgetType = BaWidgetType = {}));
var BaFieldType;
(function (BaFieldType) {
    BaFieldType["CustomComponents"] = "CustomComponents";
})(BaFieldType || (exports.BaFieldType = BaFieldType = {}));
