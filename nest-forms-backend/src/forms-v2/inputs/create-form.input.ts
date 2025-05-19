import { IsString } from 'class-validator'

export class CreateFormInputDto {
  @IsString()
  readonly formDefinitionSlug: string
}
