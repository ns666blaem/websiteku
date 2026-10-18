import { cpSync, copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'dist');

if (!existsSync(output)) {
  throw new Error('Astro output directory does not exist. Run this script after astro build.');
}

cpSync(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });

for (const file of ['favicon.ico', 'robots.txt', 'sitemap.xml', 'google4216d7a4a1279073.html']) {
  copyFileSync(resolve(root, file), resolve(output, file));
}
