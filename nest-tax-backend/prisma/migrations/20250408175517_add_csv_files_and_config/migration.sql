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
    "validSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CsvFile_name_key" ON "CsvFile" ("name");


INSERT INTO "Config" ("key", "value")
VALUES ('REPORTING_VARIABLE_SYMBOL', '0000603481'),
       ('REPORTING_SPECIFIC_SYMBOL', '2260001048'),
       ('REPORTING_CONSTANT_SYMBOL', '0000000608'),
       ('REPORTING_USER_CONSTANT_SYMBOL', '8148'),
       ('REPORTING_RECIPIENT_EMAIL', 'invalid@bratislava.sk'),
       ('REPORTING_GENERATE_REPORT', 'false');
