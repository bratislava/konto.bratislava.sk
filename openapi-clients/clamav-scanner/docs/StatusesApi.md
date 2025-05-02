# StatusesApi

All URIs are relative to _http://localhost:3000_

| Method                                                                  | HTTP request                       | Description                |
| ----------------------------------------------------------------------- | ---------------------------------- | -------------------------- |
| [**statusControllerIsClamavRunning**](#statuscontrollerisclamavrunning) | **GET** /api/status/clamav         | Check clamav status        |
| [**statusControllerIsFormsRunning**](#statuscontrollerisformsrunning)   | **GET** /api/status/forms          | Check forms backend status |
| [**statusControllerIsMinioRunning**](#statuscontrollerisminiorunning)   | **GET** /api/status/minio          | Check minio status         |
| [**statusControllerIsPrismaRunning**](#statuscontrollerisprismarunning) | **GET** /api/status/prisma         | Check prisma status        |
| [**statusControllerStatus**](#statuscontrollerstatus)                   | **GET** /api/status                | Check all services status  |
| [**statusControllerVersion**](#statuscontrollerversion)                 | **GET** /api/status/clamav/version | Show clamav version        |

# **statusControllerIsClamavRunning**

> ServiceRunningDto statusControllerIsClamavRunning()

This endpoint checks if clamav is running

### Example

```typescript
import { StatusesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new StatusesApi(configuration)

const { status, data } = await apiInstance.statusControllerIsClamavRunning()
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
| **200**     | Clamav is running | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Forms backend is running | -                |

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
| **200**     | Minio is running | -                |

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
| **200**     | Prisma is running | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **statusControllerStatus**

> ServicesStatusDto statusControllerStatus()

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

**ServicesStatusDto**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                | Response headers |
| ----------- | ------------------------------------------ | ---------------- |
| **200**     | All services status retrieved successfully | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **statusControllerVersion**

> ClamavVersionDto statusControllerVersion()

This endpoint shows clamav version

### Example

```typescript
import { StatusesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new StatusesApi(configuration)

const { status, data } = await apiInstance.statusControllerVersion()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ClamavVersionDto**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Clamav version retrieved | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
