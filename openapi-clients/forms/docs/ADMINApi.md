# ADMINApi

All URIs are relative to _http://localhost:3000_

| Method                                                                          | HTTP request                      | Description |
| ------------------------------------------------------------------------------- | --------------------------------- | ----------- |
| [**adminControllerGetAdministrationJwt**](#admincontrollergetadministrationjwt) | **GET** /admin/administration-jwt |             |
| [**adminControllerGetEidJwt**](#admincontrollergeteidjwt)                       | **GET** /admin/eid-jwt            |             |
| [**adminControllerGetTechnicalJwt**](#admincontrollergettechnicaljwt)           | **GET** /admin/technical-jwt      |             |

# **adminControllerGetAdministrationJwt**

> object adminControllerGetAdministrationJwt()

Return administration account JWT token

### Example

```typescript
import { ADMINApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

const { status, data } = await apiInstance.adminControllerGetAdministrationJwt()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**object**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Generated JWT token | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerGetEidJwt**

> object adminControllerGetEidJwt()

Return eid user JWT token

### Example

```typescript
import { ADMINApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

const { status, data } = await apiInstance.adminControllerGetEidJwt()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**object**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Generated JWT token | -                |
| **401**     | Unauthorized.       | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminControllerGetTechnicalJwt**

> object adminControllerGetTechnicalJwt()

Return technical account JWT token

### Example

```typescript
import { ADMINApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ADMINApi(configuration)

const { status, data } = await apiInstance.adminControllerGetTechnicalJwt()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**object**

### Authorization

[apiKey](../README.md#apiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Generated JWT token | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
