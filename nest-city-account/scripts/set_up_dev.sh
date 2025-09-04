#!/bin/bash

# Default values
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--force)
      FORCE=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -f, --force    Use force flags for prisma commands"
      echo "  -h, --help     Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

# Build open api clients
cd ../openapi-clients/ || exit
npm install
npm run build
cd ../nest-city-account/ || exit

# Start Postgresql and RabbitMQ
docker compose up -d

# Install all node packages
npm install

# Set up prisma
if [ "$FORCE" = true ]; then
  npx prisma migrate reset --force
  npx prisma migrate dev --force
else
  npx prisma migrate reset
  npx prisma migrate dev
fi
npx prisma generate

npm run build
