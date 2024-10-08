export enum FilesErrorsEnum {
  FILE_NOT_FOUND_ERROR = 'FILE_NOT_FOUND_ERROR',
  FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR = 'FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR',
  FILE_BY_SCANNERID_NOT_FOUND_ERROR = 'FILE_BY_SCANNERID_NOT_FOUND_ERROR',
  NO_FILE_UPLOAD_DATA_ERROR = 'NO_FILE_UPLOAD_DATA_ERROR',
  FILE_ID_ALREADY_EXISTS_ERROR = 'FILE_ID_ALREADY_EXISTS_ERROR',
  FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR = 'FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR',
  FILE_SIZE_EXCEEDED_ERROR = 'FILE_SIZE_EXCEEDED_ERROR',
  FILE_SIZE_ZERO_ERROR = 'FILE_SIZE_ZERO_ERROR',
  INVALID_JWT_TOKEN_ERROR = 'INVALID_JWT_TOKEN_ERROR',
  NO_FILE_ID_IN_JWT_TOKEN_ERROR = 'NO_FILE_ID_IN_JWT_TOKEN_ERROR',
  INVALID_OR_EXPIRED_JWT_TOKEN_ERROR = 'INVALID_OR_EXPIRED_JWT_TOKEN_ERROR',
  SCANNER_NO_RESPONSE_ERROR = 'SCANNER_NO_RESPONSE_ERROR',
  FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR = 'FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR',
  FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR = 'FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR',
  FILE_DOWNLOAD_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR = 'FILE_DOWNLOAD_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR',
  FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR = 'FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR',
  FILE_IDS_NOT_FOUND_IN_DB_ERROR = 'FILE_IDS_NOT_FOUND_IN_DB_ERROR',
  FILE_MINIO_CHECK_ERROR = 'FILE_MINIO_CHECK_ERROR',
  FILE_DELETE_FROM_SCANNER_ERROR = 'FILE_DELETE_FROM_SCANNER_ERROR',
}

export enum FilesErrorsResponseEnum {
  FILE_NOT_FOUND_ERROR = 'File not found.',
  FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR = 'Provided file status was not valid.',
  FILE_BY_SCANNERID_NOT_FOUND_ERROR = 'File by scannerId not found.',
  NO_FILE_UPLOAD_DATA_ERROR = 'No upload data have been passed to backend',
  FILE_ID_ALREADY_EXISTS_ERROR = 'already exists and cannot be created a new one with that id.',
  FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR = 'File has unsupported format.',
  FILE_SIZE_EXCEEDED_ERROR = 'File size exceeded.',
  FILE_SIZE_ZERO_ERROR = 'File size is zero.',
  INVALID_JWT_TOKEN_ERROR = 'Invalid JWT token.',
  NO_FILE_ID_IN_JWT_TOKEN_ERROR = 'No file id in JWT token.',
  INVALID_OR_EXPIRED_JWT_TOKEN_ERROR = 'Invalid or expired JWT token.',
  SCANNER_NO_RESPONSE_ERROR = 'Scanner client returned no response.',
  FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR = 'File is owned by someone else.',
  FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR = 'We were unable to upload file to minio',
  FILE_DOWNLOAD_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR = 'We were unable to download the file from minio',
  FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR = 'We were unable to delete file from minio',
  FILE_IDS_NOT_FOUND_IN_DB_ERROR = 'File ids not found in db.',
  FILE_MINIO_CHECK_ERROR = 'Error while checking if file exists in minio.',
  FILE_DELETE_FROM_SCANNER_ERROR = 'File was not successfully deleted from the scanner service',
}
