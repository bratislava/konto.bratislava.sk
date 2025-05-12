# GetFormResponseSimpleDto

## Properties

| Name                   | Type       | Description                 | Notes                                               |
| ---------------------- | ---------- | --------------------------- | --------------------------------------------------- |
| **id**                 | **string** | Id of record                | [default to 'f69559da-5eca-4ed7-80fd-370d09dc3632'] |
| **createdAt**          | **string** | Create date of record       | [default to 2025-05-02T13:54:05.062Z]               |
| **updatedAt**          | **string** | Update date of record       | [default to 2025-05-02T13:54:05.062Z]               |
| **state**              | **string** | State of form               | [default to StateEnum_Draft]                        |
| **error**              | **string** | Specific error type         | [default to ErrorEnum_None]                         |
| **formDataJson**       | **object** | Data in JSON format         | [default to undefined]                              |
| **formSubject**        | **string** | Form subject                | [default to undefined]                              |
| **formDefinitionSlug** | **string** | Slug of the form definition | [default to undefined]                              |

## Example

```typescript
import { GetFormResponseSimpleDto } from './api'

const instance: GetFormResponseSimpleDto = {
  id,
  createdAt,
  updatedAt,
  state,
  error,
  formDataJson,
  formSubject,
  formDefinitionSlug,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
