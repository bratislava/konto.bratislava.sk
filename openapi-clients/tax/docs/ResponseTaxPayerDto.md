# ResponseTaxPayerDto

## Properties

| Name                            | Type        | Description                               | Notes                                               |
| ------------------------------- | ----------- | ----------------------------------------- | --------------------------------------------------- |
| **id**                          | **number**  | Numeric id of tax payer                   | [default to 1]                                      |
| **uuid**                        | **string**  | Uuid of tax payer                         | [default to '15fc5751-d5e2-4e14-9f8d-dc4b3e1dec27'] |
| **createdAt**                   | **string**  | Created at timestamp                      | [default to 2023-04-13T14:39:49.004Z]               |
| **updatedAt**                   | **string**  | Updated at timestamp                      | [default to 2023-04-13T14:39:49.004Z]               |
| **active**                      | **boolean** | Is tax payer active                       | [default to true]                                   |
| **permanentResidenceAddress**   | **string**  | Permanent address of tax payer            | [default to 'Bratislava, Hlavne námestie 1']        |
| **externalId**                  | **string**  | Id of tax payer from Noris                | [default to '12345']                                |
| **name**                        | **string**  | Name of taxpayer                          | [default to 'Bratislavčan Daňový']                  |
| **nameTxt**                     | **string**  | Text of descreption of name for pdf       | [default to 'Meno daňovníka/ subjektu']             |
| **permanentResidenceStreetTxt** | **string**  | Text of descreption of street for pdf     | [default to 'Ulica trvalého pobytu']                |
| **permanentResidenceStreet**    | **string**  | Street of permanent residence with number | [default to 'Uršulínska 6 3/6']                     |
| **permanentResidenceZip**       | **string**  | Zip of permanent residence with number    | [default to '811 01']                               |
| **permanentResidenceCity**      | **string**  | City of permanent residence with number   | [default to 'Bratislava']                           |
| **birthNumber**                 | **string**  | Birth number with slash                   | [default to '920101/1111']                          |

## Example

```typescript
import { ResponseTaxPayerDto } from './api'

const instance: ResponseTaxPayerDto = {
  id,
  uuid,
  createdAt,
  updatedAt,
  active,
  permanentResidenceAddress,
  externalId,
  name,
  nameTxt,
  permanentResidenceStreetTxt,
  permanentResidenceStreet,
  permanentResidenceZip,
  permanentResidenceCity,
  birthNumber,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
