#!/bin/sh

npx prisma migrate deploy || exit 1
node dist/main
