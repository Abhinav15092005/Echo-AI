import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const root = process.cwd();
const envPath = path.join(root, '.env');

if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env not found. Create E:\\auralis-app\\.env first.');
  process.exit(1);
}

dotenv.config({ path: envPath });

const names = (process.env.GROQ_API_KEYS_NAMES || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (names.length === 0) {
  console.error('ERROR: GROQ_API_KEYS_NAMES is empty in .env');
  process.exit(1);
}

const keys = names.map((name) => {
  const key = process.env[`GROQ_API_KEY_${name}`];
  if (!key || !key.trim()) {
    console.error(`ERROR: missing GROQ_API_KEY_${name} in .env`);
    process.exit(1);
  }
  return { name, key: key.trim() };
});

const outDir = path.join(root, 'src', 'generated');
fs.mkdirSync(outDir, { recursive: true });

const content = `// AUTO-GENERATED FILE. DO NOT COMMIT.
// Generated from .env at build time.
export const GROQ_KEYS = ${JSON.stringify(keys, null, 2)};

export const PRIMARY_MODEL = ${JSON.stringify(
  process.env.LLAMA_MODEL || 'openai/gpt-oss-120b'
)};

export const FALLBACK_MODEL = ${JSON.stringify(
  process.env.QWEN_MODEL || 'qwen/qwen3.8-27b'
)};

export const TARGET_LANG = ${JSON.stringify(
  process.env.TARGET_LANG || 'eng_Latn'
)};
`;

fs.writeFileSync(path.join(outDir, 'env.js'), content, 'utf8');
console.log(`Injected ${keys.length} Groq keys into src/generated/env.js`);