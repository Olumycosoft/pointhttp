// scripts/build-assets.js
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function compileAssets() {
  const entry = path.join(__dirname, './src/core/scripts/script.ts');
  const output = path.join(__dirname, './src/core/scripts/script.generated.ts');

  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    write: false,
    format: 'iife',
    target: 'es2020',
  });

  const minifiedJs = result.outputFiles[0].text.trim();
  const fileContent = `// Automatically generated. Do not edit manually.\nexport const clientScriptRaw = ${JSON.stringify(minifiedJs)};\n`;

  fs.writeFileSync(output, fileContent, 'utf8');
  console.log('Asset string layer generated successfully!');
}

compileAssets().catch((err) => {
  console.error(err);
  process.exit(1);
});