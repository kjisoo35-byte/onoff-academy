import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8');
const productionId = 'c8d5a5ff-711b-410f-892c-160f116eb7cd';
const previewId = '4088b06d-8b81-4dcf-a27f-2b636c20bac7';

const section = name => {
  const marker = `[[env.${name}.d1_databases]]`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`${name}_db_binding_missing`);
  const next = source.indexOf('\n[[', start + marker.length);
  return source.slice(start, next < 0 ? source.length : next);
};

const production = section('production');
const preview = section('preview');
const requires = (value, pattern, message) => {
  if (!pattern.test(value)) throw new Error(message);
};

requires(production, /binding\s*=\s*"DB"/, 'production_db_binding_invalid');
requires(production, /database_name\s*=\s*"onoff-academy-production"/, 'production_db_name_invalid');
requires(production, new RegExp(`database_id\\s*=\\s*"${productionId}"`), 'production_db_id_invalid');
requires(preview, /binding\s*=\s*"DB"/, 'preview_db_binding_invalid');
requires(preview, /database_name\s*=\s*"onoff-academy-staging"/, 'preview_db_name_invalid');
requires(preview, new RegExp(`database_id\\s*=\\s*"${previewId}"`), 'preview_db_id_invalid');
if (productionId === previewId) throw new Error('production_preview_db_not_isolated');
if (/ACADEMY_ASSERTION_SECRET\s*=|WORK_ACADEMY_ASSERTION_SECRET\s*=/.test(source)) throw new Error('secret_must_not_be_plaintext');

console.log(JSON.stringify({
  status: 'PASS',
  production: { binding: 'DB', databaseId: productionId },
  preview: { binding: 'DB', databaseId: previewId },
  secrets: 'dashboard-managed'
}));
