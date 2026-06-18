import { ApiProperty } from '@nestjs/swagger'
import { ConsentEnum } from '@prisma/client'
import { IsBoolean, IsEmail, IsEnum } from 'class-validator'

export class ResponseConsentDto {
  @ApiProperty({
    description: 'Type of consent',
    enum: ConsentEnum,
    enumName: 'ConsentEnum',
  })
  @IsEnum(ConsentEnum)
  consentType!: ConsentEnum

  @ApiProperty({
    description: 'Whether the consent is currently granted',
    example: true,
  })
  @IsBoolean()
  isGranted!: boolean
}
export enum UserAttributeEnum {
  TAX2023 = 'TAX2023',
  TAX2024 = 'TAX2024',
}

export enum UserOfficialCorrespondenceChannelEnum {
  POSTAL = 'POSTAL',
  EDESK = 'EDESK',
  EMAIL = 'EMAIL',
}

export class ResponseUserDataBasicDto {
  @ApiProperty({
    description: 'Local ID of user',
    default: '133e0473-44da-407a-b24f-12da343e808d',
  })
  id!: string

  @ApiProperty({
    description: 'Created timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Last updated timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  updatedAt!: Date

  @ApiProperty({
    description:
      'Id from cognito, it is not required. We can have also only subscribed user, who are not city account users',
    default: 'e51754f2-3367-43f6-b9bc-b5c6131b041a',
  })
  externalId: string | null

  @ApiProperty({
    description: 'Email',
    default: 'test@bratislava.sk',
  })
  email: string | null

  @ApiProperty({
    description: 'Birth number',
    default: '9909090000',
  })
  birthNumber: string | null

  @ApiProperty({
    description:
      'State, if we can communicate user with email, or user have active e-desk slovensko.sk mail or we need to communicate with him with post. First we are looking for edesk, if he has registered edesk communication in NASES use edesk. If not, check if there is subscription for communication through email, use email from city account. Else use Postal communication.',
    default: UserOfficialCorrespondenceChannelEnum.EMAIL,
    enum: UserOfficialCorrespondenceChannelEnum,
    enumName: 'UserOfficialCorrespondenceChannelEnum',
    nullable: true,
  })
  officialCorrespondenceChannel: UserOfficialCorrespondenceChannelEnum | null

  @ApiProperty({
    description:
      'Can show banner for formal communication through email? If it was shown and clicked, it will not be shown.',
    default: true,
  })
  showEmailCommunicationBanner!: boolean

  @ApiProperty({
    description:
      'True if user changed delivery method after deadline. This is used to show alert about changed delivery method propagating in the next year.',
    default: false,
  })
  hasChangedDeliveryMethodAfterDeadline!: boolean
}

export class ResponseUserDataDto extends ResponseUserDataBasicDto {
  @ApiProperty({
    description: 'Current consent state for the user, one entry per consent type.',
    type: [ResponseConsentDto],
    default: [
      { consentType: 'MARKETING', isGranted: true },
      { consentType: 'GENERAL', isGranted: true },
    ],
  })
  consents!: ResponseConsentDto[]
}
export class ChangeEmailRequestDto {
  @ApiProperty({
    description: 'New email for a user',
    default: 'new@email.com',
  })
  @IsEmail()
  newEmail!: string
}
