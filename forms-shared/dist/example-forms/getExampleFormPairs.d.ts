import { FormDefinition } from '../definitions/formDefinitionTypes';
import { ExampleForm } from './types';
type ExampleFormPair<FD = FormDefinition> = {
    formDefinition: FD;
    exampleForm: ExampleForm;
};
export declare function getExampleFormPairs<FD extends FormDefinition>({ formDefinitionFilterFn, includeDevForms, }?: {
    formDefinitionFilterFn?: (formDefinition: FormDefinition) => formDefinition is FD;
    includeDevForms?: boolean;
}): ExampleFormPair<FD>[];
export {};
