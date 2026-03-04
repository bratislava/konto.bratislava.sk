import fs from 'fs';
import path from 'path';

const packagesToPatch = ['@rjsf/core', '@rjsf/utils', '@rjsf/validator-ajv8'];
const nodeModulesPath = path.resolve(__dirname, '../node_modules');

packagesToPatch.forEach(pkg => {
    const pkgPath = path.join(nodeModulesPath, pkg);

    if (!fs.existsSync(pkgPath)) {
        console.warn(`Package ${pkg} not found in node_modules.`);
        return;
    }

    const packageJsonPath = path.join(pkgPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(packageJsonContent);

            let changed = false;
            if (packageJson.type === 'module') {
                delete packageJson.type;
                changed = true;
            }

            if (packageJson.exports) {
                delete packageJson.exports;
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
                console.log(`Patched package.json for ${pkg}`);
            }
        } catch (e) {
            console.error(`Error patching package.json for ${pkg}:`, e);
        }
    }

    const distPath = path.join(pkgPath, 'dist');
    if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        files.forEach(file => {
            if (file.endsWith('.cjs')) {
                const oldPath = path.join(distPath, file);
                const newPath = path.join(distPath, file.replace(/\.cjs$/, '.js'));
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed ${file} to ${path.basename(newPath)} in ${pkg}/dist`);
            } else if (file.endsWith('.cjs.map')) {
                const oldPath = path.join(distPath, file);
                const newPath = path.join(distPath, file.replace(/\.cjs\.map$/, '.js.map'));
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed ${file} to ${path.basename(newPath)} in ${pkg}/dist`);
            }
        });
    }
});
