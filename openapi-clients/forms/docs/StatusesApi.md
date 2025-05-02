# StatusesApi

All URIs are relative to _http://localhost:3000_

| Method                                                                  | HTTP request            | Description                  |
| ----------------------------------------------------------------------- | ----------------------- | ---------------------------- |
| [**statusControllerIsFormsRunning**](#statuscontrollerisformsrunning)   | **GET** /status/scanner | Check scanner backend status |
| [**statusControllerIsMinioRunning**](#statuscontrollerisminiorunning)   | **GET** /status/minio   | Check minio status           |
| [**statusControllerIsPrismaRunning**](#statuscontrollerisprismarunning) | **GET** /status/prisma  | Check prisma status          |
| [**statusControllerStatus**](#statuscontrollerstatus)                   | **GET** /status         | Check all services status    |

# **statusControllerIsFormsRunning**

> ServiceRunningDto statusControllerIsFormsRunning()

This endpoint checks if forms backend is running

### Example

```typescript
import { StatusesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new StatusesApi(configuration)

const { status, data } = await apiInstance.statusControllerIsFormsRunning()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ServiceRunningDto**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description        | Response headers |
| ----------- | ------------------ | ---------------- |
| **200**     | Status of scanner. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **statusControllerIsMinioRunning**

> ServiceRunningDto statusControllerIsMinioRunning()

This endpoint checks if minio is running

### Example

```typescript
import { StatusesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new StatusesApi(configuration)

const { status, data } = await apiInstance.statusControllerIsMinioRunning()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ServiceRunningDto**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description      | Response headers |
| ----------- | ---------------- | ---------------- |
| **200**     | Status of minio. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **statusControllerIsPrismaRunning**

> ServiceRunningDto statusControllerIsPrismaRunning()

This endpoint checks if prisma is running

### Example

```typescript
import { StatusesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new StatusesApi(configuration)

const { status, data } = await apiInstance.statusControllerIsPrismaRunning()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ServiceRunningDto**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description       | Response headers |
| ----------- | ----------------- | ---------------- |
| **200**     | Status of prisma. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **statusControllerStatus**

> StatusResponseDto statusControllerStatus()

This endpoint checks all services status

### Example

```typescript
import { StatusesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new StatusesApi(configuration)

const { status, data } = await apiInstance.statusControllerStatus()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**StatusResponseDto**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                   | Response headers |
| ----------- | --------------------------------------------- | ---------------- |
| **200**     | Status of prisma, minio and scanner services. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
