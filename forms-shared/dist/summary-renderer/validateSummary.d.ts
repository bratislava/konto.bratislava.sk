import { GenericObjectType, RJSFSchema, ValidationData } from '@rjsf/utils';
import { FileInfoSummary } from '../form-files/fileStatus';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
export type ValidatedSummary = {
    hasErrors: boolean;
    pathHasError: (path: string) => boolean;
    filesInFormData: FileInfoSummary[];
    getFileById: (id: string) => FileInfoSummary | undefined;
} & ValidationData<any>;
/**
 * Validates the summary and returns error schema and info about files.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for Ajv. This is only one of few ways how
 * to traverse the form data for specific values. In this case, we extract the files we need to give a special attention
 * in summary.
 */
export declare const validateSummary: (schema: RJSFSchema, formData: GenericObjectType, fileInfos: Record<string, FileInfoSummary>, validatorRegistry: BaRjsfValidatorRegistry) => ValidatedSummary;
