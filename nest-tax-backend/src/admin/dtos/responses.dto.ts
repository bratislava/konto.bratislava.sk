import { ApiProperty } from '@nestjs/swagger'

export class CreateBirthNumbersResponseDto {
  @ApiProperty({
    description:
      'An array of birth numbers which were added to TaxPayers in this batch.',
    default: ['000000/0000', '000111/2222'],
    type: [String],
  })
  birthNumbers: string[]
}
