import { GenericObjectType } from '@rjsf/utils';
import { FormsBackendFile } from '../form-files/serverFilesTypes';
import { FormDefinition } from '../definitions/formDefinitionTypes';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
export type FileIdInfoMap = Record<string, {
    url: string;
    fileName: string;
}>;
export type RenderSummaryEmailPayload = {
    formDefinition: FormDefinition;
    formData: GenericObjectType;
    fileIdInfoMap: FileIdInfoMap;
    validatorRegistry: BaRjsfValidatorRegistry;
    serverFiles?: FormsBackendFile[];
    withHtmlBodyTags?: boolean;
};
export declare const renderSummaryEmail: ({ formDefinition, formData, fileIdInfoMap, validatorRegistry, serverFiles, withHtmlBodyTags, }: RenderSummaryEmailPayload) => Promise<string>;
