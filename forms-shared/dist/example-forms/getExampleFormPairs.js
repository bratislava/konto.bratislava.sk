"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExampleFormPairs = void 0;
const getFormDefinitionBySlug_1 = require("../definitions/getFormDefinitionBySlug");
const flatten_1 = __importDefault(require("lodash/flatten"));
const exampleForms_1 = require("./exampleForms");
function getExampleFormPairs({ formDefinitionFilterFn = (formDefinition) => true, includeDevForms = false, } = {}) {
    const getFormDefinitionBySlugLocal = includeDevForms
        ? getFormDefinitionBySlug_1.getFormDefinitionBySlugDev
        : getFormDefinitionBySlug_1.getFormDefinitionBySlug;
    const exampleFormsLocal = includeDevForms ? { ...exampleForms_1.exampleForms, ...exampleForms_1.exampleDevForms } : exampleForms_1.exampleForms;
    const slugs = Object.keys(exampleFormsLocal);
    const formDefinitions = slugs
        .map(getFormDefinitionBySlugLocal)
        .filter((formDefinition) => formDefinition != null && formDefinitionFilterFn(formDefinition));
    const withExampleForms = formDefinitions.map((formDefinition) => {
        const exampleFormsBySlug = exampleFormsLocal[formDefinition.slug];
        return exampleFormsBySlug.map((exampleForm) => ({ formDefinition, exampleForm }));
    });
    return (0, flatten_1.default)(withExampleForms);
}
exports.getExampleFormPairs = getExampleFormPairs;
