import { ApiProperty } from '@nestjs/swagger'

export class ResponseGetPaymentUrlDto {
  @ApiProperty({
    description: 'url to redirect to GP webpay',
    default: 'https://gpwebpay...',
  })
  url: string
}
