# ApiIamIdentitiesSearchPostRequest

## Properties

| Name               | Type                                                                                                    | Description                                                                                                                                                                                                                                                                                                | Notes                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **ids**            | **Array&lt;string&gt;**                                                                                 | ID identít.                                                                                                                                                                                                                                                                                                | [optional] [default to undefined]       |
| **uris**           | **Array&lt;string&gt;**                                                                                 | URI identít.                                                                                                                                                                                                                                                                                               | [optional] [default to undefined]       |
| **en**             | **string**                                                                                              | Identifikátor schránky.                                                                                                                                                                                                                                                                                    | [optional] [default to undefined]       |
| **type**           | **string**                                                                                              | Typ identity: - &#x60;natural_person&#x60; fyzická osoba, - &#x60;legal_entity&#x60; právnická osoba, - &#x60;technical_account&#x60; technický účet, - &#x60;employee_of_public_administration&#x60; zamestnanec verejnej správy, - &#x60;institution_of_public_administration&#x60; orgán verejnej moci. | [optional] [default to undefined]       |
| **email**          | **string**                                                                                              |                                                                                                                                                                                                                                                                                                            | [optional] [default to undefined]       |
| **phone**          | **string**                                                                                              |                                                                                                                                                                                                                                                                                                            | [optional] [default to undefined]       |
| **address**        | [**ApiIamIdentitiesSearchPostRequestAddress**](ApiIamIdentitiesSearchPostRequestAddress.md)             |                                                                                                                                                                                                                                                                                                            | [optional] [default to undefined]       |
| **legal_entity**   | [**ApiIamIdentitiesSearchPostRequestLegalEntity**](ApiIamIdentitiesSearchPostRequestLegalEntity.md)     |                                                                                                                                                                                                                                                                                                            | [optional] [default to undefined]       |
| **natural_person** | [**ApiIamIdentitiesSearchPostRequestNaturalPerson**](ApiIamIdentitiesSearchPostRequestNaturalPerson.md) |                                                                                                                                                                                                                                                                                                            | [optional] [default to undefined]       |
| **match**          | **string**                                                                                              | Spôsob vyhľadávania atribútov &#x60;corporate_body.name&#x60;, &#x60;natural_person.given_name&#x60; a &#x60;natural_person.family_name&#x60;.                                                                                                                                                             | [optional] [default to MatchEnum_Exact] |
| **page**           | **number**                                                                                              | Číslo stránky zoznamu identít.                                                                                                                                                                                                                                                                             | [optional] [default to 1]               |
| **per_page**       | **number**                                                                                              | Počet identít na stránke zoznamu.                                                                                                                                                                                                                                                                          | [optional] [default to 10]              |

## Example

```typescript
import { ApiIamIdentitiesSearchPostRequest } from './api'

const instance: ApiIamIdentitiesSearchPostRequest = {
  ids,
  uris,
  en,
  type,
  email,
  phone,
  address,
  legal_entity,
  natural_person,
  match,
  page,
  per_page,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
