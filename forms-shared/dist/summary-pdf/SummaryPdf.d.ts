import React from 'react';
import { SummaryJsonForm } from '../summary-json/summaryJsonTypes';
import { ValidatedSummary } from '../summary-renderer/validateSummary';
import { FormDefinition } from '../definitions/formDefinitionTypes';
import { GenericObjectType } from '@rjsf/utils';
type SummaryPdfProps = {
    formDefinition: FormDefinition;
    cssToInject: string;
    formData: GenericObjectType;
    summaryJson: SummaryJsonForm;
    validatedSummary: ValidatedSummary;
};
export declare const SummaryPdf: ({ formDefinition, cssToInject, summaryJson, validatedSummary, formData, }: SummaryPdfProps) => React.JSX.Element;
export {};
