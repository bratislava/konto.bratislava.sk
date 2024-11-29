import { GenericObjectType } from '@rjsf/utils';
import { Expression } from 'expr-eval';
export declare function getFormCalculatorExpression(formula: string, logError?: boolean): Expression | null;
export declare function calculateFormCalculatorExpression(expression: Expression | null, data: GenericObjectType, logError?: boolean): number | null;
export declare function calculateFormCalculatorFormula(formula: string, data: GenericObjectType, logError?: boolean): number | null;
