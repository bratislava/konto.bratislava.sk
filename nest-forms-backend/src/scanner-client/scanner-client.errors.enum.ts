export enum ScannerClientErrorsEnum {
  FILE_IN_SCANNER_NOT_FOUND = 'FILE_IN_SCANNER_NOT_FOUND',
  FILE_SIZE_TOO_LARRGE = 'FILE_SIZE_TOO_LARRGE',
  FILE_WAS_PROCESSED = 'FILE_WAS_PROCESSED',
  FILE_HAS_WRONG_PARAMETERS = 'FILE_HAS_WRONG_PARAMETERS',
  PROBLEM_WITH_SCANNER = 'PROBLEM_WITH_SCANNER',
}

export enum ScannerClientResponseEnum {
  FILE_IN_SCANNER_NOT_FOUND = 'File does not exists in scanner.',
  FILE_SIZE_TOO_LARRGE = 'File is too big for scanning.',
  FILE_WAS_PROCESSED = 'File was already processed in scanner.',
  FILE_HAS_WRONG_PARAMETERS = 'Params which where sent was not accepted by scanner.',
  PROBLEM_WITH_SCANNER = 'Error while notifying scanner backend.',
}
