"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../generator/functions");
const step1_1 = __importDefault(require("./priznanie-k-dani-z-nehnutelnosti/step1"));
const step2_1 = __importDefault(require("./priznanie-k-dani-z-nehnutelnosti/step2"));
const step3_1 = __importDefault(require("./priznanie-k-dani-z-nehnutelnosti/step3"));
const step4_1 = __importDefault(require("./priznanie-k-dani-z-nehnutelnosti/step4"));
const step5_1 = __importDefault(require("./priznanie-k-dani-z-nehnutelnosti/step5"));
const step6_1 = __importDefault(require("./priznanie-k-dani-z-nehnutelnosti/step6"));
const step7_1 = __importDefault(require("./priznanie-k-dani-z-nehnutelnosti/step7"));
const step8_1 = __importDefault(require("./priznanie-k-dani-z-nehnutelnosti/step8"));
exports.default = (0, functions_1.schema)({
    title: 'Priznanie k dani z nehnuteľností',
}, {}, [step1_1.default, step2_1.default, step3_1.default, step4_1.default, step5_1.default, step6_1.default, step7_1.default, step8_1.default]);
