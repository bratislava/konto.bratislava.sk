"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormDefinitionBySlugDev = exports.getFormDefinitionBySlug = void 0;
const formDefinitions_1 = require("./formDefinitions");
const devFormDefinitions_1 = require("./devFormDefinitions");
const getFormDefinitionBySlug = (slug) => {
    const formDefinition = formDefinitions_1.formDefinitions.find((formDefinition) => formDefinition.slug === slug);
    return formDefinition ?? null;
};
exports.getFormDefinitionBySlug = getFormDefinitionBySlug;
const getFormDefinitionBySlugDev = (slug) => {
    const mergedFormDefinitions = [...formDefinitions_1.formDefinitions, ...devFormDefinitions_1.devFormDefinitions];
    const formDefinition = mergedFormDefinitions.find((formDefinition) => formDefinition.slug === slug);
    return formDefinition ?? null;
};
exports.getFormDefinitionBySlugDev = getFormDefinitionBySlugDev;
