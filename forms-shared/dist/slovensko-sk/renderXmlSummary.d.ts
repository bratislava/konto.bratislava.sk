import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import { SummaryJsonForm } from '../summary-json/summaryJsonTypes';
import { ValidatedSummary } from '../summary-renderer/validateSummary';
import { FormDefinition } from '../definitions/formDefinitionTypes';
import { GenericObjectType } from '@rjsf/utils';
import { FormsBackendFile } from '../form-files/serverFilesTypes';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
type SlovenskoSkSummaryXmlProps = {
    summaryJson: SummaryJsonForm;
    validatedSummary: ValidatedSummary;
};
type CustomElement<P = {}> = DetailedHTMLProps<HTMLAttributes<HTMLElement> & P, HTMLElement>;
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'slovensko-sk-form': CustomElement<{
                title: string;
            }>;
            'slovensko-sk-step': CustomElement<{
                id: string;
                title: string;
            }>;
            'slovensko-sk-array': CustomElement<{
                id: string;
                title: string;
            }>;
            'slovensko-sk-array-item': CustomElement<{
                id: string;
                title: string;
            }>;
            'slovensko-sk-field': CustomElement<{
                id: string;
                label: string;
            }>;
            'slovensko-sk-string-value': CustomElement;
            'slovensko-sk-file-value': CustomElement<{
                id: string;
            }>;
            'slovensko-sk-none-value': CustomElement;
            'slovensko-sk-invalid-value': CustomElement;
        }
    }
}
export declare const SlovenskoSkSummaryXml: ({ summaryJson, validatedSummary, }: SlovenskoSkSummaryXmlProps) => React.JSX.Element;
export declare function renderSlovenskoXmlSummary(formDefinition: FormDefinition, formData: GenericObjectType, validatorRegistry: BaRjsfValidatorRegistry, serverFiles?: FormsBackendFile[]): Promise<any>;
export {};
