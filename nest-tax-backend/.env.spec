# Environment for e2e tests (pnpm test:e2e), loaded by test/e2e-env-setup.ts.
# DATABASE_URL and MSSQL_* are set by test/e2e-global-setup.ts from the started containers.
# All external HTTP services point to example.com hosts, which are mocked by nock.

NODE_ENV=test
CLUSTER_ENV=dev
PORT=3000
DB_CONCURRENCY=10

# AWS Cognito
COGNITO_USER_POOL_ID=eu-central-1_TestPool
COGNITO_CLIENT_ID=test-client-id
COGNITO_REGION=eu-central-1
AWS_COGNITO_ACCESS=test-access-key
AWS_COGNITO_SECRET=test-secret-key
ADMIN_APP_SECRET=e2e-admin-secret

# Email
AWS_SES_SMTP_USERNAME=test-smtp-user
AWS_SES_SMTP_PASSWORD=test-smtp-password
AWS_SES_SENDER_EMAIL='Mesto Bratislava <konto@example.com>'

# Payment gate
PAYGATE_MERCHANT_NUMBER=test-merchant-dzn
PAYGATE_CURRENCY=978
PAYGATE_PAYMENT_REDIRECT_URL=https://gpwebpay.example.com/pgw/order.do
PAYGATE_PASSPHRASE=test-passphrase-dzn
PAYGATE_SIGN_CERT=test-sign-cert-dzn
PAYGATE_REDIRECT_URL=https://nest-tax-backend.example.com/payment/cardpay/response
PAYGATE_KEY=test-key-dzn
PAYGATE_MERCHANT_NUMBER_KO=test-merchant-ko
PAYGATE_KEY_KO=test-key-ko
PAYGATE_SIGN_CERT_KO=test-sign-cert-ko
PAYGATE_PASSPHRASE_KO=test-passphrase-ko
PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND=https://city-account-next.example.com/platba/stav

# City account
CITY_ACCOUNT_API_URL=https://nest-city-account.example.com
CITY_ACCOUNT_ADMIN_API_KEY=test-city-account-admin-api-key

# Bloomreach
BLOOMREACH_API_KEY=test-bloomreach-key
BLOOMREACH_API_SECRET=test-bloomreach-secret
BLOOMREACH_PROJECT_TOKEN=test-bloomreach-project
BLOOMREACH_API_URL=https://bloomreach.example.com

# Payment reporting
REPORTING_ICO=11111111
REPORTING_SFTP_HOST=sftp.example.com
REPORTING_SFTP_USER=test-sftp-user
REPORTING_SFTP_KEY=test-sftp-key
REPORTING_FILE_NAME=pbr24
REPORTING_ACCOUNT_ID=2222222222222222
REPORTING_BANK_ID=3333
REPORTING_SFTP_PORT=22
REPORTING_SFTP_FILES_PATH=/dzn
REPORTING_PKO_FILE_NAME=pbr26
REPORTING_PKO_ACCOUNT_ID=4444444444444444
REPORTING_PKO_BANK_ID=5555
REPORTING_PKO_SFTP_FILES_PATH=/pko

# Feature toggles
FEATURE_TOGGLE_UPDATE_TAXES_FROM_NORIS=true
FEATURE_TOGGLE_SEND_BLOOMREACH_EVENTS=true

PAYMENT_QR_BENEFICIARY_NAME="Hlavné mesto Slovenskej republiky Bratislava"
