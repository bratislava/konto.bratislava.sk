# FormMigrationsApi

All URIs are relative to _http://localhost:3000_

| Method                                                                                    | HTTP request                              | Description |
| ----------------------------------------------------------------------------------------- | ----------------------------------------- | ----------- |
| [**formMigrationsControllerClaimMigration**](#formmigrationscontrollerclaimmigration)     | **POST** /forms/migrations/claim/{formId} |             |
| [**formMigrationsControllerPrepareMigration**](#formmigrationscontrollerpreparemigration) | **POST** /forms/migrations/prepare        |             |

# **formMigrationsControllerClaimMigration**

> ClaimMigrationOutput formMigrationsControllerClaimMigration()

### Example

```typescript
import { FormMigrationsApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new FormMigrationsApi(configuration)

let formId: string // (default to undefined)

const { status, data } = await apiInstance.formMigrationsControllerClaimMigration(formId)
```

### Parameters

| Name       | Type         | Description | Notes                 |
| ---------- | ------------ | ----------- | --------------------- |
| **formId** | [**string**] |             | defaults to undefined |

### Return type

**ClaimMigrationOutput**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **formMigrationsControllerPrepareMigration**

> PrepareMigrationOutput formMigrationsControllerPrepareMigration(prepareMigrationInput)

### Example

```typescript
import { FormMigrationsApi, Configuration, PrepareMigrationInput } from './api'

const configuration = new Configuration()
const apiInstance = new FormMigrationsApi(configuration)

let prepareMigrationInput: PrepareMigrationInput //

const { status, data } =
  await apiInstance.formMigrationsControllerPrepareMigration(prepareMigrationInput)
```

### Parameters

| Name                      | Type                      | Description | Notes |
| ------------------------- | ------------------------- | ----------- | ----- |
| **prepareMigrationInput** | **PrepareMigrationInput** |             |       |

### Return type

**PrepareMigrationOutput**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
