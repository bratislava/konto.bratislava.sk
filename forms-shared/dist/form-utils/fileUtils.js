"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileUuids = exports.getFileUuidsNaive = void 0;
const traverse_1 = __importDefault(require("traverse"));
const validators_1 = require("./validators");
const ajvFormats_1 = require("./ajvFormats");
/**
 * Extracts used file UUIDs from form data.
 *
 * This is a naive implementation that extracts all the valid UUIDs, but is very performant compared
 * to the "normal" version.
 */
const getFileUuidsNaive = (formData) => {
    return (0, traverse_1.default)(formData).reduce(function traverseFn(acc, value) {
        if (this.isLeaf && (0, ajvFormats_1.validateBaFileUuid)(value)) {
            acc.push(value);
        }
        return acc;
    }, []);
};
exports.getFileUuidsNaive = getFileUuidsNaive;
/**
 * Extracts used file UUIDs from form data.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for AJV. This is only
 * one of few ways how to traverse the form data for specific values. In this case, we extract the
 * file ids from the form data.
 */
const getFileUuids = (schema, formData) => {
    const files = [];
    const fileValidateFn = (innerSchema, data) => {
        if (data) {
            files.push(data);
        }
        return true;
    };
    const validator = (0, validators_1.getFileValidatorBaRjsf)(fileValidateFn);
    validator.isValid(schema, formData, formData);
    return files;
};
exports.getFileUuids = getFileUuids;
