CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.contacts (
  uuid uuid NOT NULL DEFAULT gen_random_uuid(),
  birth_number text,
  ico text,
  email text,
  phone text,
  CONSTRAINT contacts_pkey PRIMARY KEY (uuid)
);

CREATE UNIQUE INDEX IF NOT EXISTS contact_idx
  ON public.contacts (birth_number, ico) NULLS NOT DISTINCT;
