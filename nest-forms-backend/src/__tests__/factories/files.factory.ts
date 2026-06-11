import { Files, FileStatus } from '@prisma/client'

const DEFAULT_DATE = new Date('2024-01-01T00:00:00.000Z')

const baseFile = {
  id: '00000000-0000-4000-8000-000000000002',
  pospId: 'test-posp-id',
  formId: '00000000-0000-4000-8000-000000000001',
  scannerId: null,
  minioFileName: 'test-minio-file.pdf',
  fileName: 'test-file.pdf',
  fileSize: 1024,
  slotId: null,
  status: FileStatus.UPLOADED,
  ginisOrder: null,
  ginisUploaded: false,
  ginisUploadedError: false,
  createdAt: DEFAULT_DATE,
  updatedAt: DEFAULT_DATE,
}

export const createTestFile = (overrides?: Partial<Files>): Files => ({
  ...baseFile,
  ...overrides,
})
