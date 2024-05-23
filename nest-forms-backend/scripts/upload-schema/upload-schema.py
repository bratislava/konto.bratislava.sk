import json
from typing import Optional
from uuid import uuid4
import psycopg2
import os
import sys
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

load_dotenv()

parsedUrl = urlparse(os.environ['DATABASE_URL'])

username = parsedUrl.username
password = parsedUrl.password
database = parsedUrl.path[1:]
hostname = parsedUrl.hostname
port = parsedUrl.port
schema = parse_qs(parsedUrl.query).get('schema', ['public'])[0]

conn = psycopg2.connect(database=database,
                        host=hostname,
                        user=username,
                        password=password,
                        port=port,
                        options=f'-c search_path={schema}')
cursor = conn.cursor()

"""
Params:
1. if also schema should be created (true/false)
2. path to the schemas
3. form description
4. version
5. isSigned

6. schema Id (if only version should be added) or formName (if schema should be created)
from now on only if schema is created
7. slug
8. category
"""

schemaId: Optional[str] = None

if len(sys.argv) < 6:
    print('You must pass all arguments')
    exit(1)

createSchema = sys.argv[1] == 'true'
path = sys.argv[2]
formDescription = sys.argv[3]
version = sys.argv[4]
isSigned = sys.argv[5] == 'true'

if createSchema:
    if len(sys.argv) < 9:
        print('You must pass all arguments')
        exit(1)
    formName = sys.argv[6]
    slug = sys.argv[7]
    category: Optional[str] = sys.argv[8]
    category = None if category == 'NULL' else category
else:
    if len(sys.argv) < 7:
        print('You must pass all arguments')
        exit(1)
    schemaId = sys.argv[6]

if schemaId is None:
    schemaId = str(uuid4())
schemaVersionId = str(uuid4())

with open(path + "/data.json", "r") as f:
    data = f.read()
dataXml: Optional[str]
try:
    with open(path + "/data.xml", "r") as f:
        dataXml = f.read()
except FileNotFoundError:
    dataXml = None
with open(path + "/form.fo.xslt", "r") as f:
    formFo = f.read()
with open(path + "/schema.json", "r") as f:
    jsonSchema = f.read()
with open(path + "/uiSchema.json", "r") as f:
    uiSchema = f.read()
with open(path + "/xmlTemplate.xml", "r") as f:
    xmlTemplate = f.read()

if createSchema:
    cursor.execute("""INSERT INTO "Schema"
                (id, "formName", slug, category, "messageSubject", "updatedAt")
                VALUES (%s, %s, %s, %s, 'Podanie', CURRENT_TIMESTAMP)
                RETURNING id""", (schemaId, formName, slug, category))

jsonSchemaDict = json.loads(jsonSchema)

cursor.execute("""INSERT INTO "SchemaVersion"
               (id, version, "pospID", "pospVersion", "formDescription", data, "dataXml", "formFo", "jsonSchema", "uiSchema", "xmlTemplate", "schemaId", "isSigned", "updatedAt")
               VALUES
               (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
               """, (schemaVersionId, version, jsonSchemaDict['pospID'], jsonSchemaDict['pospVersion'], formDescription, data, dataXml, formFo, jsonSchema, uiSchema, xmlTemplate, schemaId, isSigned))

cursor.execute("""UPDATE "Schema"
               SET "latestVersionId" = %s
               WHERE id = %s
               """, (schemaVersionId, schemaId))
conn.commit()

exit(0)
