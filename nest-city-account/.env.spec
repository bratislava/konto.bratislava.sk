# Fixture used by src/config/__tests__/environment-variables.validate.spec.ts to verify
# a fully-populated, valid config passes validation. Keep in sync with EnvironmentVariables.

NODE_ENV=test
CLUSTER_ENV=staging
PORT=3000

DATABASE_URL=postgresql://localhost:5432/db
DB_CONCURRENCY=10

AWS_COGNITO_CLIENT_ID=test-client-id
AWS_COGNITO_USERPOOL_ID=eu-central-1_TestPool
AWS_COGNITO_REGION=eu-central-1
AWS_COGNITO_ACCESS=test-access-key
AWS_COGNITO_SECRET=test-secret-key

MAGPROXY_URL=https://magproxy.example.com
MAGPROXY_AZURE_AD_URL=https://login.microsoftonline.com/tenant/oauth2/v2.0/token
MAGPROXY_AZURE_CLIENT_ID=azure-client-id
MAGPROXY_AZURE_CLIENT_SECRET=azure-secret
MAGPROXY_AZURE_SCOPE=api://azure-client-id/.default

RABBIT_MQ_URI=amqp://guest:guest@localhost:5672

REDIS_SERVICE=localhost
REDIS_PASSWORD=redis-password
REDIS_USER=default
REDIS_PORT=6379

# 1x0000000000000000000000000000000AA is Cloudflare's documented "always passes" test
# secret - see DUMMY_TURNSTILE_SECRET in src/config/environment-variables.ts.
TURNSTILE_SECRET=1x0000000000000000000000000000000AA

MAILGUN_API_KEY=mailgun-key
DEFAULT_MAILGUN_DOMAIN=example.com

SLOVENSKO_SK_CONTAINER_URI=https://slovensko-sk-api.example.com
API_TOKEN_PRIVATE=token-private
OBO_TOKEN_PUBLIC=token-public
SUB_NASES_TECHNICAL_ACCOUNT=account

BLOOMREACH_INTEGRATION_STATE=ACTIVE
BLOOMREACH_PROJECT_TOKEN=project-token
BLOOMREACH_API_KEY=bloomreach-key
BLOOMREACH_API_SECRET=bloomreach-secret
BLOOMREACH_API_URL=https://api.bloomreach.example.com
BLOOMREACH_CONTACT_DB_HOST=localhost
BLOOMREACH_CONTACT_DB_PORT=5432
BLOOMREACH_CONTACT_DB_NAME=bloomreach
BLOOMREACH_CONTACT_DB_USER=bloomreach
BLOOMREACH_CONTACT_DB_PASSWORD=password

ENFORCEMENT_BACKEND_URL=https://enforcement.example.com
ENFORCEMENT_BACKEND_TOW_API_KEY=tow-key

ADMIN_APP_SECRET=admin-secret
CRYPTO_SECRET_KEY=crypto-secret

MUNICIPAL_TAX_LOCK_MONTH=4
MUNICIPAL_TAX_LOCK_DAY=1

OAUTH2_LOGIN_URL=https://city-account-next.example.com/oauth
OAUTH2_CLIENT_LIST=DPB,PAAS_MPA

MSSQL_HOST=localhost
MSSQL_DB=db
MSSQL_USERNAME=user
MSSQL_PASSWORD=password
MSSQL_PORT=1433

PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
REQUIRE_HTTPS=true
