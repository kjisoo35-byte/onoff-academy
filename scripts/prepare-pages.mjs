import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'dist');
const entries = ['.nojekyll', '404.html', 'academy.js', 'index.html', 'manifest.json', 'print.css', 'robots.txt', 'sitemap.xml', 'assets', 'components', 'css', 'pages'];
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of entries) fs.cpSync(path.join(root, entry), path.join(output, entry), { recursive: true });
console.log(`Prepared ${entries.length} Academy static entries in dist.`);
