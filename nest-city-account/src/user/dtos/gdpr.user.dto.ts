import { ApiProperty } from '@nestjs/swagger'
import { GDPRCategoryEnum, GDPRSubTypeEnum, GDPRTypeEnum, User } from '@prisma/client'
import { IsEmail, IsEnum } from 'class-validator'

export class RequestGdprDataDto {
  gdprData!: GdprDataDto[]
}

export enum UserAttributeEnum {
  TAX2023 = 'TAX2023',
  TAX2024 = 'TAX2024',
}

export class GdprDataDto {
  @ApiProperty({
    description: 'Type of Gdpr subscription',
    default: 'marketing',
    enum: GDPRTypeEnum,
    enumName: 'GDPRTypeEnum',
  })
  @IsEnum(GDPRTypeEnum)
  type!: GDPRTypeEnum

  @ApiProperty({
    description: 'Type of Gdpr category',
    default: 'library',
    enum: GDPRCategoryEnum,
    enumName: 'GDPRCategoryEnum',
  })
  @IsEnum(GDPRCategoryEnum)
  category!: GDPRCategoryEnum
}

export class GdprDataSubscriptionDto extends GdprDataDto {
  @ApiProperty({
    description: 'Type of subType - unsubscribe or subscribe',
    default: 'unsubscribe',
    enum: GDPRSubTypeEnum,
    enumName: 'GDPRSubTypeEnum',
  })
  @IsEnum(GDPRSubTypeEnum)
  subType!: GDPRSubTypeEnum
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
    description: 'Subscription Data in array',
    default: [
      {
        category: 'CITY',
        type: 'ANALYTICS',
        subType: 'unsubscribe',
      },
      {
        category: 'CITY',
        type: 'DATAPROCESSING',
        subType: 'unsubscribe',
      },
    ],
  })
  gdprData!: ResponseGdprUserDataDto[]
}

export class ResponseGdprUserDataDto {
  @ApiProperty({
    description: 'Type of Gdpr category',
    default: 'library',
    enum: GDPRCategoryEnum,
    enumName: 'GDPRCategoryEnum',
  })
  @IsEnum(GDPRCategoryEnum)
  category!: GDPRCategoryEnum

  @ApiProperty({
    description: 'Type of Gdpr subscription',
    default: 'marketing',
    enum: GDPRTypeEnum,
    enumName: 'GDPRTypeEnum',
  })
  @IsEnum(GDPRTypeEnum)
  type!: GDPRTypeEnum

  @ApiProperty({
    description: 'Type of subType - unsubscribe or subscribe',
    default: 'unsubscribe',
    enum: GDPRSubTypeEnum,
    enumName: 'GDPRSubTypeEnum',
  })
  @IsEnum(GDPRSubTypeEnum)
  subType!: GDPRSubTypeEnum
}

export class ResponsePublicUnsubscribeDto {
  @ApiProperty({
    description: 'Local ID of user',
    default: '133e0473-44da-407a-b24f-12da343e808d',
  })
  id!: string

  @ApiProperty({
    description: 'Message about unsubscribe',
    default: 'user was unsubscribed',
  })
  message!: string

  @ApiProperty({
    description: 'Subscription Data in array',
    default: [
      {
        category: 'CITY',
        type: 'ANALYTICS',
        subType: 'unsubscribe',
      },
      {
        category: 'CITY',
        type: 'DATAPROCESSING',
        subType: 'unsubscribe',
      },
    ],
  })
  gdprData!: ResponseGdprUserDataDto[]

  @ApiProperty({
    description: 'Message about unsubscribe',
    default: 'user',
  })
  userData!: User
}

export class ChangeEmailRequestDto {
  @ApiProperty({
    description: 'New email for a user',
    default: 'new@email.com',
  })
  @IsEmail()
  newEmail!: string
}
