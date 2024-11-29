import React from 'react';
import { SummaryJsonForm } from '../summary-json/summaryJsonTypes';
import { ValidatedSummary } from '../summary-renderer/validateSummary';
import { FileIdInfoMap } from './renderSummaryEmail';
type SummaryEmailProps = {
    summaryJson: SummaryJsonForm;
    validatedSummary: ValidatedSummary;
    fileIdInfoMap: FileIdInfoMap;
    withHtmlBodyTags: boolean;
};
export declare const SummaryEmail: ({ summaryJson, validatedSummary, fileIdInfoMap, withHtmlBodyTags, }: SummaryEmailProps) => React.JSX.Element;
export {};
