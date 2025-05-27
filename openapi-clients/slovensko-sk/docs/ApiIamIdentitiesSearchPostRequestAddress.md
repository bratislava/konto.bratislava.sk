# ApiIamIdentitiesSearchPostRequestAddress

Adresa trvalého pobytu alebo kontaktná adresa.

## Properties

| Name                    | Type                                                                                                                | Description                                                                                        | Notes                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| **type**                | **string**                                                                                                          | Typ adresy: - &#x60;contact&#x60; kontaktná adresa, - &#x60;resident&#x60; adresa trvalého pobytu. | [default to undefined]            |
| **country**             | [**ApiIamIdentitiesSearchPostRequestAddressCountry**](ApiIamIdentitiesSearchPostRequestAddressCountry.md)           |                                                                                                    | [optional] [default to undefined] |
| **district**            | [**ApiIamIdentitiesSearchPostRequestAddressDistrict**](ApiIamIdentitiesSearchPostRequestAddressDistrict.md)         |                                                                                                    | [optional] [default to undefined] |
| **municipality**        | [**ApiIamIdentitiesSearchPostRequestAddressMunicipality**](ApiIamIdentitiesSearchPostRequestAddressMunicipality.md) |                                                                                                    | [optional] [default to undefined] |
| **street**              | **string**                                                                                                          | Ulica.                                                                                             | [optional] [default to undefined] |
| **building_number**     | **string**                                                                                                          | Orientačné číslo budovy.                                                                           | [optional] [default to undefined] |
| **registration_number** | **number**                                                                                                          | Súpisné číslo budovy.                                                                              | [optional] [default to undefined] |

## Example

```typescript
import { ApiIamIdentitiesSearchPostRequestAddress } from './api'

const instance: ApiIamIdentitiesSearchPostRequestAddress = {
  type,
  country,
  district,
  municipality,
  street,
  building_number,
  registration_number,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
