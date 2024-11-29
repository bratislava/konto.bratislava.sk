"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeBoolean = exports.safeNumber = exports.safeString = exports.safeArray = void 0;
function safeArray(array) {
    if (Array.isArray(array)) {
        return array;
    }
    return [];
}
exports.safeArray = safeArray;
function safeString(string) {
    if (typeof string === 'string') {
        return string;
    }
    return undefined;
}
exports.safeString = safeString;
function safeNumber(number) {
    if (typeof number === 'number') {
        return number;
    }
}
exports.safeNumber = safeNumber;
function safeBoolean(boolean, undefinedFalse = true) {
    if (typeof boolean === 'boolean') {
        return boolean;
    }
    if (undefinedFalse && boolean === undefined) {
        return false;
    }
}
exports.safeBoolean = safeBoolean;
