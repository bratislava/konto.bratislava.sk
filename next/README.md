# Bratislava.sk

This readme should get you up & running. For more detailed documentation, check the /docs file in the root of the repo.

## First-time setup

You need `node` and `npm` installed locally.

To install dependencies run:

```
npm install
```

### VSCode support

VSCode supports this plugin out of the box. However, sometimes it can use its own typescript version instead of the project one, resulting in not reading the local tsconfig. If you are using VSCode be sure to have `Use workspace version` option selected in `Typescript: Select Typescript Version...` command available in the [command pallete](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).

<img width="729" alt="image" src="https://user-images.githubusercontent.com/35625949/153884371-e0f488d4-05b8-4b88-93d2-1caa7e6081f7.png">

## Run project locally

```
npm run dev
```

## Run project for e2e testing

Tests need captcha disabled, are run against staging backend & staging cognito, and may have other env changes - see `.env.e2e`. Otherwise they behave as a production build - to build & run the app in this setup

```bash
# only if you need to rebuild - this rewrites local .env.production.local
npm run build:e2e
# start the same way as you would start the app in production
npm run start
```

## FOP

Apache™ FOP (Formatting Objects Processor) is a print formatter driven by XSL formatting objects (XSL-FO) and an output independent formatter. It is a Java application that reads a formatting object (FO) tree and renders the resulting pages to a specified output.

We are using [FOP](https://xmlgraphics.apache.org/fop/) to transform eForms to pdf. If you'd like to use this feature, Java 1.7 or later RE must be installed on your system. See [FOP Quick start guide](https://xmlgraphics.apache.org/fop/quickstartguide.html)

## API clients generation

We are using [openapi-generator-cli](https://openapi-generator.tech/) to generate API clients based on OpenAPI specification provided by our BEs.

We are using [graphql-codegen](https://the-guild.dev/graphql/codegen) to generate GraphQL client from our Strapi (CMS) schema.

To generate API clients run `npm run generate-clients`. `--skip-validate-spec` flag is required until all errors in the specification are resolved.

Forms:

- [Swagger](https://nest-forms-backend.staging.bratislava.sk/api)
- [API JSON](https://nest-forms-backend.staging.bratislava.sk/api-json)

City account:

- [Swagger](https://nest-city-account.staging.bratislava.sk/api)
- [API JSON](https://nest-city-account.staging.bratislava.sk/api-json)

Tax:

- [Swagger](https://nest-tax-backend.staging.bratislava.sk/api)
- [API JSON](https://nest-tax-backend.staging.bratislava.sk/api-json)

City account Strapi:

- [GraphQL playground](https://city-account-strapi.staging.bratislava.sk/graphql)

## TODOs

After removing a snackbar plugin, these overrides can be safely removed from package.json:

```json
"overrides": {
"react": "18.3.1",
"react-dom": "18.3.1"
}
```

## `react-simple-snackbar` patched package
Unfortunately, `react-transition-group` which is used by `react-simple-snackbar` uses `findDOMNode` that was removed in React 19.

It allows bypassing this feature by providing [`nodeRef`](https://github.com/reactjs/react-transition-group/issues/559). However, the snackbar package doesn't implement it so we need to patch it. 

The patch is built version of `react-simple-snackbar` with the following changes:
```
diff --git a/src/Snackbar.js b/src/Snackbar.js
--- a/src/Snackbar.js	(revision f1ea5e49cf59e6cdf834f6e8015f016ba6918f68)
+++ b/src/Snackbar.js	(date 1738591704284)
@@ -1,4 +1,4 @@
-import React, { createContext, useState } from 'react'
+import React, { createContext, useState, useRef } from 'react'
 import { CSSTransition } from 'react-transition-group'
 import styles from './Snackbar.css'
 
@@ -61,6 +61,8 @@
     setOpen(false)
   }
 
+  const nodeRef = useRef(null)
+
   // Returns the Provider that must wrap the application
   return (
     <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
@@ -90,9 +92,10 @@
             styles[`snackbar-exit-active-${position}`]
           }`,
         }}
+        nodeRef={nodeRef}
       >
         {/* This div will be rendered with CSSTransition classNames */}
-        <div>
+        <div ref={nodeRef}>
           <div className={styles.snackbar} style={customStyles}>
             {/* Snackbar's text */}
             <div className={styles.snackbar__text}>{text}</div>

```
