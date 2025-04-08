-- CreateTable
CREATE TABLE "CsvFile"
(
    "id"        SERIAL       NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name"      TEXT         NOT NULL,

    CONSTRAINT "CsvFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config"
(
    "id"        SERIAL       NOT NULL,
    "key"       TEXT         NOT NULL,
    "value"     TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CsvFile_name_key" ON "CsvFile" ("name");

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config" ("key");

INSERT INTO "Config" ("key", "value")
VALUES ('REPORTING_VARIABLE_SYMBOL', '0000603481'),
       ('REPORTING_SPECIFIC_SYMBOL', '2260001048'),
       ('REPORTING_CONSTANT_SYMBOL', '0000000608'),
       ('REPORTING_USER_CONSTANT_SYMBOL', '8148'),
       ('REPORTING_SEND_EMAIL', 'false')
ON CONFLICT ("key") DO NOTHING;