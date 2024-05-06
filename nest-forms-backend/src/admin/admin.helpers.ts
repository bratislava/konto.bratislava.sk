import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { ADMIN_SCHEMA_FILES } from './admin.constants'
import { AdminSchemaFilesNamesEnum } from './dtos/enums.admin.dto'

const checkFiles = (files: Express.Multer.File[]): void => {
  const errorGuard = new ThrowerErrorGuard()
  const allPossibleFiles = new Set(Object.keys(ADMIN_SCHEMA_FILES))
  files.forEach((file) => {
    const fileName = file.originalname as AdminSchemaFilesNamesEnum
    if (!allPossibleFiles.has(file.originalname)) {
      throw errorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `bad file name ${file.originalname}`,
      )
    }
    if (!(ADMIN_SCHEMA_FILES[fileName].type === file.mimetype)) {
      throw errorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `bad file format - ${file.originalname}. ${ADMIN_SCHEMA_FILES[fileName].type} is required`,
      )
    }
    allPossibleFiles.delete(file.originalname)
  })
  allPossibleFiles.forEach((possibleFile) => {
    const fileName = possibleFile as AdminSchemaFilesNamesEnum
    if (ADMIN_SCHEMA_FILES[fileName].required) {
      throw errorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        `File is required - ${fileName}.`,
      )
    }
  })
}

export default checkFiles
