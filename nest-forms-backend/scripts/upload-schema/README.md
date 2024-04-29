## Prerequisities

You must install all necessary pip packages, by running `pip install -r py-requirements.txt`. The requirements file is in the root folder.

Also there must be a folder containing all of the schema files necessary, that being:

- data.json
- data.xml (optional)
- form.fo.xslt
- form.html.sef.json
- form.html.xslt
- for.sb.sef.json
- form.sb.xslt
- schema.json
- schema.xsd
- uiSchema.json
- xmlTemplate.xml

These files can be generated using `@bratislava/jsxt`, detailed instructions can be seen [here](https://bratislava.github.io/konto.bratislava.sk/forms-general#adding-new-eform). Note that this will create the desired files, however you need to have the json schema ready (schema.json), and also uiSchema.json, because this script will create empty uiSchema, so you should overwrite it.

The next thing with the `@bratislava/jsxt` script is that it creates few of the files in a .ts format, so it is just a typescript file with a default export of the content. You should rename these files as follows:
- form.fo.xslt.ts -> form.fo.xslt
- schema.xsd.ts -> schema.xsd
- xmlTemplate.ts -> xmlTemplate.xml

and also remove the typescript stuff like `export default`, so only the real contents will stay in the file.

## Running the script

There are two possible cases to run this script: creating a schema along with a version, or adding a new schema version to an existing schema.

### Creating a schema with a version

The format of this command is
```
python3 <path to the script> true <path to the root of schema files> <schema version description> <version of the schema, e.g. v0.0.1> <if it must be signed (true/false)> <schema name> <schema slug> <category, string or NULL>
```

for example it may look like this:

```
python3 scripts/upload-schema/upload-schema.py true /Users/erehulka/bratislava/nest-forms-backend/src/utils/global-forms/kontajneroveStojiska "form na kontajnerove stojiska" "v0.0.1" false "Kontajnerové stojiská" "kontajnerove-stojiska" NULL
```

Instead of NULL some real category can be used, for example "Dane" (taxes).

## Adding a new version to an existing schema

In this case the format is similar to the one before, however without the schema details, just the id of the schema

```
python3 <path to the script> true <path to the root of schema files> <schema version description> <version of the schema, e.g. v0.0.1> <if it must be signed (true/false)> <schema id>
```

An example may be

```
python3 scripts/upload-schema/upload-schema.py false /Users/erehulka/bratislava/nest-forms-backend/src/utils/global-forms/kontajneroveStojiska "form na kontajnerove stojiska" "v0.0.2" false 2a6f6984-6f31-443f-ad17-4169888f423c
```