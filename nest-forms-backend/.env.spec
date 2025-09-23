# Basic configuration
PORT=3000
SELF_URL=https://nest-forms-backend.dev.bratislava.sk
CLUSTER_ENV=dev

# Authentication
NEST_FORMS_BACKEND_USERNAME=e2e-user
NEST_FORMS_BACKEND_PASSWORD=e2e-password
ADMIN_APP_SECRET=e2e-admin-secret
JWT_SECRET=e2e-jwt-secret-for-testing

# AWS Cognito
AWS_COGNITO_CLIENT_ID=test-client-id
AWS_COGNITO_USERPOOL_ID=eu-central-1_TestPool
AWS_COGNITO_REGION=eu-central-1
AWS_COGNITO_ACCESS=test-access-key
AWS_COGNITO_SECRET=test-secret-key
AWS_ACCOUNT_ID=123456789012
AWS_UNAUTH_ROLE_NAME=Test_Cognito_Unauth_Role

# RabbitMQ
RABBIT_MQ_URI=amqp://guest:guest@localhost:5672

# Mailgun
MAILGUN_API_KEY=test-mailgun-key
MAILGUN_DOMAIN=test.mailgun.com
MAILGUN_HOST=https://api.mailgun.net
MAILGUN_EMAIL_FROM=test@example.com

# Slovensko.sk
SLOVENSKO_SK_CONTAINER_URI="https://fix.slovensko-sk-api.bratislava.sk"

# API Tokens
API_TOKEN_PRIVATE=test-private-token
OBO_TOKEN_PUBLIC=test-public-token
SUB_NASES_TECHNICAL_ACCOUNT=test-technical-account

# NASES
NASES_SENDER_URI=ico://sk/test-sender
NASES_RECIPIENT_URI=ico://sk/test-recipient

# Frontend
FRONTEND_URL=https://city-account-next.staging.bratislava.sk
USER_ACCOUNT_API="https://nest-city-account.staging.bratislava.sk"

# ClamAV Scanner
NEST_CLAMAV_SCANNER=http://127.0.0.1:3200
NEST_CLAMAV_SCANNER_USERNAME=test-user
NEST_CLAMAV_SCANNER_PASSWORD=test-password

# GINIS
GINIS_USERNAME=test-ginis-user
GINIS_PASSWORD=test-ginis-password
GINIS_SSL_HOST=https://test-ginis.example.com/ssl
GINIS_SSL_MTOM_HOST=https://test-ginis.example.com/ssl/mtom
GINIS_GIN_HOST=https://test-ginis.example.com/gin
GINIS_FORM_ID_PROPERTY_ID=TEST_FORM_ID
GINIS_SHOULD_REGISTER=false

# OLO
OLO_SMTP_USERNAME=test-olo-user
OLO_SMTP_PASSWORD=test-olo-password
OLO_FRONTEND_URL=https://test.olo.sk

# SharePoint
SHAREPOINT_DOMAIN=test.sharepoint.com
SHAREPOINT_SITE_ID=test-site-id
SHAREPOINT_SITE_NAME=test-site-name
SHAREPOINT_GRAPH_URL=https://test.graph.microsoft.com/v1.0
SHAREPOINT_CLIENT_ID=test-sharepoint-client
SHAREPOINT_CLIENT_SECRET=test-sharepoint-secret
SHAREPOINT_TENANT_ID=test-tenant-id

# MinIO
MINIO_ACCESS_KEY=test-access-key
MINIO_ENDPOINT=localhost
MINIO_HOST=localhost:9000
MINIO_PORT=9000
MINIO_SECRET_KEY=test-secret-key
MINIO_USE_SSL=false
MINIO_PATH_STYLE=false
MINIO_UNSCANNED_BUCKET=test-unscanned
MINIO_SAFE_BUCKET=test-safe
MINIO_INFECTED_BUCKET=test-infected

# Redis
REDIS_SERVICE=localhost
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASSWORD=test-redis-password

# Tax PDF Jobs
TAX_PDF_JOB_CONCURRENCY=1
TAX_PDF_JOB_TIMEOUT=10000

# Feature Toggles
FEATURE_TOGGLE_VERSIONING=true
