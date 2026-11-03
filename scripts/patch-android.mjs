import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.join(
  process.cwd(),
  'android',
  'app',
  'src',
  'main',
  'AndroidManifest.xml'
);

if (!fs.existsSync(manifestPath)) {
  console.error(
    'AndroidManifest.xml not found. Run "npx cap add android" first.'
  );
  process.exit(1);
}

let xml = fs.readFileSync(manifestPath, 'utf8');
let changed = false;

if (!xml.includes('android.permission.RECORD_AUDIO')) {
  xml = xml.replace(
    '<application',
    '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n\n    <application'
  );
  changed = true;
}

if (!xml.includes('android.permission.INTERNET')) {
  xml = xml.replace(
    '<application',
    '    <uses-permission android:name="android.permission.INTERNET" />\n\n    <application'
  );
  changed = true;
}

if (changed) {
  fs.writeFileSync(manifestPath, xml, 'utf8');
  console.log('Patched AndroidManifest.xml with RECORD_AUDIO / INTERNET.');
} else {
  console.log('AndroidManifest.xml already has the required permissions.');
}