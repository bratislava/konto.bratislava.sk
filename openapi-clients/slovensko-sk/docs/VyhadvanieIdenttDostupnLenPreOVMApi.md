# VyhadvanieIdenttDostupnLenPreOVMApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                                                        | HTTP request                        | Description                     |
| ------------------------------------------------------------- | ----------------------------------- | ------------------------------- |
| [**apiIamIdentitiesIdGet**](#apiiamidentitiesidget)           | **GET** /api/iam/identities/{id}    | Vráti identitu                  |
| [**apiIamIdentitiesSearchPost**](#apiiamidentitiessearchpost) | **POST** /api/iam/identities/search | Vyhľadá identity podľa kritérií |

# **apiIamIdentitiesIdGet**

> ApiIamIdentitiesIdGet200Response apiIamIdentitiesIdGet()

Vráti identitu. Pozor, volanie je dostupné len pre OVM.

### Example

```typescript
import { VyhadvanieIdenttDostupnLenPreOVMApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new VyhadvanieIdenttDostupnLenPreOVMApi(configuration)

let id: string //ID identity. (default to undefined)

const { status, data } = await apiInstance.apiIamIdentitiesIdGet(id)
```

### Parameters

| Name   | Type         | Description  | Notes                 |
| ------ | ------------ | ------------ | --------------------- |
| **id** | [**string**] | ID identity. | defaults to undefined |

### Return type

**ApiIamIdentitiesIdGet200Response**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description               | Response headers |
| ----------- | ------------------------- | ---------------- |
| **200**     | Úspešne vrátená identita. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiIamIdentitiesSearchPost**

> Array<ApiIamIdentitiesIdGet200Response> apiIamIdentitiesSearchPost(apiIamIdentitiesSearchPostRequest)

Vyhľadá identity podľa kritérií. Pozor, volanie je dostupné len pre OVM.

### Example

```typescript
import {
  VyhadvanieIdenttDostupnLenPreOVMApi,
  Configuration,
  ApiIamIdentitiesSearchPostRequest,
} from './api'

const configuration = new Configuration()
const apiInstance = new VyhadvanieIdenttDostupnLenPreOVMApi(configuration)

let apiIamIdentitiesSearchPostRequest: ApiIamIdentitiesSearchPostRequest //

const { status, data } = await apiInstance.apiIamIdentitiesSearchPost(
  apiIamIdentitiesSearchPostRequest,
)
```

### Parameters

| Name                                  | Type                                  | Description | Notes |
| ------------------------------------- | ------------------------------------- | ----------- | ----- |
| **apiIamIdentitiesSearchPostRequest** | **ApiIamIdentitiesSearchPostRequest** |             |       |

### Return type

**Array<ApiIamIdentitiesIdGet200Response>**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                | Response headers |
| ----------- | ------------------------------------------ | ---------------- |
| **200**     | Úspešne vyhľadané identity podľa kritérií. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
