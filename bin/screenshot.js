#!/usr/bin/env node
/**
 * Usage: node bin/screenshot.js <url> <name>
 * Example: node bin/screenshot.js http://localhost:8888 front-page
 *
 * Saves to: logs/screenshots/<name>-<timestamp>.png
 */

import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const [url, name] = process.argv.slice(2);

if (!url || !name) {
  console.error('Usage: node bin/screenshot.js <url> <name>');
  console.error('Example: node bin/screenshot.js http://localhost:8888 front-page');
  process.exit(1);
}

const dir = join(process.cwd(), 'logs/screenshots');
mkdirSync(dir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outPath = join(dir, `${name}-${timestamp}.png`);

const browser = await chromium.launch();
const page = await browser.newPage();

// SP
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: outPath.replace('.png', '-sp.png'), fullPage: true });

// PC
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: outPath.replace('.png', '-pc.png'), fullPage: true });

await browser.close();

console.log(`Saved: ${outPath.replace('.png', '-sp.png')}`);
console.log(`Saved: ${outPath.replace('.png', '-pc.png')}`);
