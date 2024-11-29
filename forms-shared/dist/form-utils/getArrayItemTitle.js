"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArrayItemTitle = void 0;
const getArrayItemTitle = (title, index) => (title ?? '').replace('{index}', String(index + 1));
exports.getArrayItemTitle = getArrayItemTitle;
