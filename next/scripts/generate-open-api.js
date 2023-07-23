const child_process =  require('node:child_process');

const helpMessage = `
  Usage: generate-open-api --url {url} --folder {folder}
  
  Options:
  --url           URL from which we can create a client       [string] [required]
  --folder        folder path to save a client to                      [required]
`;

(function generateOpenApi() {
  if (process.argv.length <= 2) {
    console.info("Please provide an API url and folder arguments! Use flag --help/-h for more info")
    return;
  }

  if (process.argv.includes("--help")) {
    console.info(helpMessage);
    if (process.argv.length === 3) {
      return;
    }
  }

  const urlParamIndex = process.argv.indexOf("--url");
  const folderParamIndex = process.argv.indexOf("--folder");
  if (!urlParamIndex) {
    throw new Error("Missing argument: url. Please provide API url to generate!");
  }

  if (!folderParamIndex) {
    throw new Error("Missing argument: folder. Please provide folder to generate OpenAPI content to!");
  }

  const url = process.argv[urlParamIndex + 1];
  const folder = process.argv[folderParamIndex + 1];

  console.info(`Started generating content for ${url} in ${folder} path.`);

  child_process.exec(`yarn openapi-generator-cli generate -i ${url} -g typescript-axios -o ${folder} --skip-validate-spec && node ./fix-client.js &&  prettier --write ${folder}`, (error, stdout) => {
    if (error) {
      throw new Error(error.message);
    }

    console.log(stdout);
    console.info(`Finished generating OpenAPI for ${url}`);
  });
})();