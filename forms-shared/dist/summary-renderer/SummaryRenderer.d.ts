import React, { PropsWithChildren, ReactNode } from 'react';
import { SummaryJsonArray, SummaryJsonArrayItem, SummaryJsonField, SummaryJsonForm, SummaryJsonStep } from '../summary-json/summaryJsonTypes';
import { ValidatedSummary } from './validateSummary';
import { FileInfoSummary } from '../form-files/fileStatus';
import { SummaryDisplayValue } from '../summary-json/getSummaryDisplayValue';
type RendererPropsBase = {
    hasError: boolean;
    index: number;
    isFirst: boolean;
    isLast: boolean;
};
export type SummaryFormRendererProps = PropsWithChildren<{
    form: SummaryJsonForm;
} & RendererPropsBase>;
export type SummaryStepRendererProps = PropsWithChildren<{
    step: SummaryJsonStep;
} & RendererPropsBase>;
export type SummaryArrayRendererProps = PropsWithChildren<{
    array: SummaryJsonArray;
} & RendererPropsBase>;
export type SummaryFieldRendererProps = PropsWithChildren<{
    field: SummaryJsonField;
} & RendererPropsBase>;
export type SummaryArrayItemRendererProps = PropsWithChildren<{
    arrayItem: SummaryJsonArrayItem;
} & RendererPropsBase>;
type ValueRendererBase = {
    index: number;
    isFirst: boolean;
    isLast: boolean;
};
export type SummaryStringValueRendererProps = {
    value: string;
} & ValueRendererBase;
export type SummaryFileValueRendererProps = {
    id: string;
    fileInfo: FileInfoSummary;
} & ValueRendererBase;
export type SummaryNoneValueRendererProps = ValueRendererBase;
export type SummaryInvalidValueRendererProps = ValueRendererBase;
type DisplayValueRendererProps = {
    displayValue: SummaryDisplayValue;
    validatedSummary: ValidatedSummary;
    renderStringValue: (props: SummaryStringValueRendererProps) => ReactNode;
    renderFileValue: (props: SummaryFileValueRendererProps) => ReactNode;
    renderNoneValue: (props: SummaryNoneValueRendererProps) => ReactNode;
    renderInvalidValue: (props: SummaryInvalidValueRendererProps) => ReactNode;
} & ValueRendererBase;
type SummaryRendererProps = {
    summaryJson: SummaryJsonForm;
    validatedSummary: ValidatedSummary;
    renderForm: (props: SummaryFormRendererProps) => ReactNode;
    renderStep: (props: SummaryStepRendererProps) => ReactNode;
    renderField: (props: SummaryFieldRendererProps) => ReactNode;
    renderArray: (props: SummaryArrayRendererProps) => ReactNode;
    renderArrayItem: (props: SummaryArrayItemRendererProps) => ReactNode;
} & Pick<DisplayValueRendererProps, 'renderStringValue' | 'renderFileValue' | 'renderNoneValue' | 'renderInvalidValue'>;
/**
 * Renders a summary JSON to a React component.
 *
 * This encapsulates the common logic of rendering the summary JSON into a React component. See usage for more details.
 */
export declare const SummaryRenderer: ({ summaryJson, validatedSummary, renderForm, renderStep, renderField, renderArray, renderArrayItem, renderStringValue, renderFileValue, renderNoneValue, renderInvalidValue, }: SummaryRendererProps) => React.ReactNode;
export {};
