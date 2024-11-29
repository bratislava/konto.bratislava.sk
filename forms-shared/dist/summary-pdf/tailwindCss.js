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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTailwindCss = void 0;
const postcss_1 = __importDefault(require("postcss"));
const tailwindcss_1 = __importDefault(require("tailwindcss"));
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const path = __importStar(require("node:path"));
const tailwindConfig = {
    content: [path.join(__dirname, './SummaryPdf.tsx')],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
};
const tailwindCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
const getTailwindCss = async () => {
    const postCssResult = await (0, postcss_1.default)([(0, tailwindcss_1.default)(tailwindConfig), autoprefixer_1.default]).process(tailwindCss, { from: undefined } /* Required to avoid a warning */);
    return postCssResult.css;
};
exports.getTailwindCss = getTailwindCss;
