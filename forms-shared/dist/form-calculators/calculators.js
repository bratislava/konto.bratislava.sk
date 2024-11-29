"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFormCalculatorFormula = exports.calculateFormCalculatorExpression = exports.getFormCalculatorExpression = void 0;
const expr_eval_1 = require("expr-eval");
const lodash_1 = require("lodash");
const ajvFormats_1 = require("../form-utils/ajvFormats");
function getFormCalculatorExpression(formula, logError = false) {
    const parser = new expr_eval_1.Parser();
    // Ratio (e.g. "5/13") is a string that needs to be evaluated.
    parser.functions.evalRatio = (arg) => {
        if ((0, ajvFormats_1.parseRatio)(arg).isValid) {
            return parser.evaluate(arg);
        }
        return NaN;
    };
    parser.functions.ratioNumerator = (arg) => {
        const parsed = (0, ajvFormats_1.parseRatio)(arg);
        if (parsed.isValid) {
            return parsed.numerator;
        }
        return NaN;
    };
    parser.functions.ratioDenominator = (arg) => {
        const parsed = (0, ajvFormats_1.parseRatio)(arg);
        if (parsed.isValid) {
            return parsed.denominator;
        }
        return NaN;
    };
    try {
        return parser.parse(formula);
    }
    catch (error) {
        if (logError) {
            console.log('Error in getFormCalculatorExpression', error);
        }
        return null;
    }
}
exports.getFormCalculatorExpression = getFormCalculatorExpression;
function calculateFormCalculatorExpression(expression, data, logError = false) {
    try {
        // It is not in the documentation, but `expr-eval` mutates the original data!
        const clonedData = (0, lodash_1.clone)(data);
        const evaluated = expression?.evaluate(clonedData);
        if (!Number.isFinite(evaluated)) {
            return null;
        }
        return evaluated;
    }
    catch (error) {
        if (logError) {
            console.log('Error in calculateFormCalculatorExpression', error);
        }
        return null;
    }
}
exports.calculateFormCalculatorExpression = calculateFormCalculatorExpression;
function calculateFormCalculatorFormula(formula, data, logError = false) {
    const expression = getFormCalculatorExpression(formula, logError);
    return calculateFormCalculatorExpression(expression, data, logError);
}
exports.calculateFormCalculatorFormula = calculateFormCalculatorFormula;
