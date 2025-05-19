# PaymentApi

All URIs are relative to _http://localhost:3000_

| Method                                                                          | HTTP request                              | Description                                                                     |
| ------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| [**paymentControllerGetQrCodeByTaxUuid**](#paymentcontrollergetqrcodebytaxuuid) | **GET** /payment/qrcode/email/{taxUuid}   |                                                                                 |
| [**paymentControllerPayment**](#paymentcontrollerpayment)                       | **POST** /payment/cardpay/by-year/{year}  | Generate payment link to logged user for submitted year if there is no payment. |
| [**paymentControllerPaymentByTaxId**](#paymentcontrollerpaymentbytaxid)         | **GET** /payment/cardpay/by-tax-id/{uuid} | Generate payment link and redirect to this link to gpwebpay.                    |
| [**paymentControllerPaymentResponse**](#paymentcontrollerpaymentresponse)       | **GET** /payment/cardpay/response         |                                                                                 |

# **paymentControllerGetQrCodeByTaxUuid**

> paymentControllerGetQrCodeByTaxUuid()

### Example

```typescript
import { PaymentApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new PaymentApi(configuration)

let taxUuid: string // (default to undefined)

const { status, data } = await apiInstance.paymentControllerGetQrCodeByTaxUuid(taxUuid)
```

### Parameters

| Name        | Type         | Description | Notes                 |
| ----------- | ------------ | ----------- | --------------------- |
| **taxUuid** | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | Return image          | -                |
| **422**     | Error to redirect     | -                |
| **500**     | Internal server error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerPayment**

> ResponseGetPaymentUrlDto paymentControllerPayment()

If there is payment, there will be error, also if there is paid only one installment, user can not pay by paygate

### Example

```typescript
import { PaymentApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new PaymentApi(configuration)

let year: string // (default to undefined)

const { status, data } = await apiInstance.paymentControllerPayment(year)
```

### Parameters

| Name     | Type         | Description | Notes                 |
| -------- | ------------ | ----------- | --------------------- |
| **year** | [**string**] |             | defaults to undefined |

### Return type

**ResponseGetPaymentUrlDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                  | Response headers |
| ----------- | -------------------------------------------- | ---------------- |
| **200**     | Create url to GP webpay with payment details | -                |
| **422**     | Custom error to create url                   | -                |
| **500**     | Internal server error                        | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerPaymentByTaxId**

> paymentControllerPaymentByTaxId()

If there is payment, there will be error, also if there is paid only one installment, user can not pay by paygate

### Example

```typescript
import { PaymentApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new PaymentApi(configuration)

let uuid: string // (default to undefined)

const { status, data } = await apiInstance.paymentControllerPaymentByTaxId(uuid)
```

### Parameters

| Name     | Type         | Description | Notes                 |
| -------- | ------------ | ----------- | --------------------- |
| **uuid** | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     |                       | -                |
| **302**     | Redirect to GP webpay | -                |
| **422**     | Error to redirect     | -                |
| **500**     | Internal server error | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **paymentControllerPaymentResponse**

> paymentControllerPaymentResponse()

### Example

```typescript
import { PaymentApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new PaymentApi(configuration)

let dIGEST: string // (default to undefined)
let dIGEST1: string // (default to undefined)
let oPERATION: string // (default to undefined)
let oRDERNUMBER: string // (default to undefined)
let pRCODE: string // (default to undefined)
let sRCODE: string // (default to undefined)
let rESULTTEXT: string // (default to undefined)

const { status, data } = await apiInstance.paymentControllerPaymentResponse(
  dIGEST,
  dIGEST1,
  oPERATION,
  oRDERNUMBER,
  pRCODE,
  sRCODE,
  rESULTTEXT,
)
```

### Parameters

| Name            | Type         | Description | Notes                 |
| --------------- | ------------ | ----------- | --------------------- |
| **dIGEST**      | [**string**] |             | defaults to undefined |
| **dIGEST1**     | [**string**] |             | defaults to undefined |
| **oPERATION**   | [**string**] |             | defaults to undefined |
| **oRDERNUMBER** | [**string**] |             | defaults to undefined |
| **pRCODE**      | [**string**] |             | defaults to undefined |
| **sRCODE**      | [**string**] |             | defaults to undefined |
| **rESULTTEXT**  | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                   | Response headers |
| ----------- | ----------------------------- | ---------------- |
| **200**     |                               | -                |
| **302**     | Redirect to Frontend response | -                |
| **422**     | Error to redirect             | -                |
| **500**     | Internal server error         | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
