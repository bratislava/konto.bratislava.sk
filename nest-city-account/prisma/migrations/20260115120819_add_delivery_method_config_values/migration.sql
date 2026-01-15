INSERT INTO "Config" (id, "updatedAt", key, value)
VALUES (gen_random_uuid( ), NOW( ), 'SEND_DAILY_DELIVERY_METHOD_SUMMARIES', '{
  "active": "false"
}')