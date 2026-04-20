import path from 'node:path'
import fs from 'node:fs'
import { get as getAppRootDir } from 'app-root-dir'

/**
 * Custom adapter that copies the iframe-resizer script to the public folder before every run.
 *
 * https://nextjs.org/docs/app/api-reference/config/next-config-js/adapterPath
 *
 * @type {import('next').NextAdapter}
 */
const adapter = {
  name: 'iframe-resizer-adapter',

  modifyConfig(config) {
    const appRootDir = getAppRootDir()
    const packagePath = path.join(appRootDir, './node_modules/@iframe-resizer/child/package.json')
    const { version } = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    if (!version) {
      throw new Error('Iframe resizer child package version not found')
    }

    // The path must contain the version so that the browser does not serve the old cached version when the package is updated.
    const publicPath = `/scripts/iframe-resizer-child-${version}.js`

    const sourcePath = path.join(appRootDir, './node_modules/@iframe-resizer/child/index.umd.js')
    if (!fs.existsSync(sourcePath)) {
      throw new Error('Iframe resizer child script not found')
    }

    const targetPath = path.join(appRootDir, 'public', publicPath)

    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.copyFileSync(sourcePath, targetPath)

    return {
      ...config,
      env: {
        ...config.env,
        IFRAME_RESIZER_PUBLIC_PATH: publicPath,
      },
    }
  },
}

export default adapter
