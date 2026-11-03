import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const wwwDir = path.join(root, 'www');
const envFile = path.join(srcDir, 'generated', 'env.js');

if (!fs.existsSync(envFile)) {
  console.error('ERROR: src/generated/env.js not found. Run "npm run env" first.');
  process.exit(1);
}

fs.mkdirSync(wwwDir, { recursive: true });

fs.copyFileSync(
  path.join(srcDir, 'index.html'),
  path.join(wwwDir, 'index.html')
);

await build({
  entryPoints: [path.join(srcDir, 'main.js')],
  bundle: true,
  format: 'iife',
  target: ['chrome100'],
  platform: 'browser',
  outfile: path.join(wwwDir, 'app.js'),
  minify: false,
  sourcemap: false,
  logLevel: 'info'
});

console.log('Web build complete: www/index.html + www/app.js');