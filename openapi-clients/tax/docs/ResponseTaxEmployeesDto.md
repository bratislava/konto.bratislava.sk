# ResponseTaxEmployeesDto

## Properties

| Name            | Type       | Description                       | Notes                                                 |
| --------------- | ---------- | --------------------------------- | ----------------------------------------------------- |
| **id**          | **number** | Numeric id of Employee from noris | [default to 1]                                        |
| **createdAt**   | **string** | Created at timestamp              | [default to 2023-04-13T14:39:49.004Z]                 |
| **updatedAt**   | **string** | Updated at timestamp              | [default to 2023-04-13T14:39:49.004Z]                 |
| **externalId**  | **string** | External of employee              | [default to '12562']                                  |
| **name**        | **string** | Name of employee                  | [default to 'Zamestnanec Bratislavský']               |
| **phoneNumber** | **string** | Phone number of employee          | [default to '+421 000 000 000']                       |
| **email**       | **string** | Email of employee                 | [default to 'zamestnanec.bratislavsky@bratislava.sk'] |

## Example

```typescript
import { ResponseTaxEmployeesDto } from './api'

const instance: ResponseTaxEmployeesDto = {
  id,
  createdAt,
  updatedAt,
  externalId,
  name,
  phoneNumber,
  email,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
