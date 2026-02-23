// In a separate file to avoid circular dependencies
export type TaxFormPdfExportModalState =
  | { type: 'loading'; onClose: () => void }
  | { type: 'success' }
