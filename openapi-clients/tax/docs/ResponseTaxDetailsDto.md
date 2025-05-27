# ResponseTaxDetailsDto

## Properties

| Name          | Type                                          | Description                                           | Notes                                 |
| ------------- | --------------------------------------------- | ----------------------------------------------------- | ------------------------------------- |
| **id**        | **number**                                    | Numeric id of tax detail                              | [default to 1]                        |
| **createdAt** | **string**                                    | Created at timestamp                                  | [default to 2023-04-13T14:39:49.004Z] |
| **updatedAt** | **string**                                    | Updated at timestamp                                  | [default to 2023-04-13T14:39:49.004Z] |
| **taxId**     | **number**                                    | Numeric id of tax (foreign key)                       | [default to 1]                        |
| **type**      | [**TaxDetailTypeEnum**](TaxDetailTypeEnum.md) | Type of tax detail - object of tax                    | [default to undefined]                |
| **areaType**  | [**TaxDetailareaType**](TaxDetailareaType.md) | Area type of tax detail - exact type of object of tax | [default to undefined]                |
| **area**      | **string**                                    | Area of tax detail - square meters                    | [default to '0,00']                   |
| **base**      | **number**                                    | Base of tax pare meter                                | [default to 0]                        |
| **amount**    | **number**                                    | Real tax per area type tax detail                     | [default to 0]                        |

## Example

```typescript
import { ResponseTaxDetailsDto } from './api'

const instance: ResponseTaxDetailsDto = {
  id,
  createdAt,
  updatedAt,
  taxId,
  type,
  areaType,
  area,
  base,
  amount,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
