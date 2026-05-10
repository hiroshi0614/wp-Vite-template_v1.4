/**
 * visual-check.js
 *
 * Figmaカンプ画像 vs ブラウザ実装のスクリーンショットを自動比較し、
 * 差分をハイライトした画像とレポートを出力するスクリプト。
 *
 * 使い方:
 *   node scripts/visual-check.js [コンポーネント名] [FigmaカンプPNG] [対象URL]
 *
 * 例:
 *   node scripts/visual-check.js Header figma/Header.png http://localhost:3000
 *
 * 必要パッケージ:
 *   yarn add -D playwright pixelmatch pngjs
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

// ========== 設定 ==========
const THRESHOLD = 0.1;          // 差異とみなすピクセル感度（0〜1、低いほど厳しい）
const DIFF_ALERT_PERCENT = 1.0; // 差異がこの%を超えたらエラー扱い
const SCREENSHOT_DIR = 'logs/screenshots';
const REPORT_PATH = 'logs/error-report.md';
const VIEWPORT = { width: 1440, height: 900 };
// ==========================

async function run() {
  const [componentName, figmaImagePath, targetUrl] = process.argv.slice(2);

  if (!componentName || !figmaImagePath || !targetUrl) {
    console.error('使い方: node scripts/visual-check.js [コンポーネント名] [FigmaカンプPNG] [URL]');
    process.exit(1);
  }

  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(SCREENSHOT_DIR, `${componentName}-${timestamp}.png`);
  const diffPath = path.join(SCREENSHOT_DIR, `${componentName}-diff-${timestamp}.png`);

  // ===== 1. ブラウザでスクリーンショット撮影 =====
  console.log(`📸 ブラウザを起動して ${targetUrl} を撮影中...`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await browser.close();
  console.log(`✅ スクリーンショット保存: ${screenshotPath}`);

  // ===== 2. Figmaカンプ画像を読み込む =====
  if (!fs.existsSync(figmaImagePath)) {
    console.error(`❌ Figmaカンプ画像が見つかりません: ${figmaImagePath}`);
    process.exit(1);
  }

  const figmaImg = PNG.sync.read(fs.readFileSync(figmaImagePath));
  const browserImg = PNG.sync.read(fs.readFileSync(screenshotPath));

  // ===== 3. サイズを合わせる（Figmaカンプ基準にリサイズ） =====
  const { width, height } = figmaImg;

  if (browserImg.width !== width || browserImg.height !== height) {
    console.warn(`⚠️  画像サイズ不一致: Figma(${width}x${height}) vs Browser(${browserImg.width}x${browserImg.height})`);
    console.warn('   Figmaカンプのサイズに合わせてViewportを調整してください。');
    console.warn(`   推奨: VIEWPORT = { width: ${width}, height: ${height} }`);
  }

  const compareWidth = Math.min(width, browserImg.width);
  const compareHeight = Math.min(height, browserImg.height);

  // ===== 4. Pixelmatchで差分検出 =====
  const diffImg = new PNG({ width: compareWidth, height: compareHeight });

  const diffPixels = pixelmatch(
    figmaImg.data,
    browserImg.data,
    diffImg.data,
    compareWidth,
    compareHeight,
    { threshold: THRESHOLD, includeAA: false },
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diffImg));

  const totalPixels = compareWidth * compareHeight;
  const diffPercent = ((diffPixels / totalPixels) * 100).toFixed(2);
  const hasError = parseFloat(diffPercent) > DIFF_ALERT_PERCENT;

  // ===== 5. 結果出力 =====
  console.log('\n========== 比較結果 ==========');
  console.log(`コンポーネント : ${componentName}`);
  console.log(`差異ピクセル数 : ${diffPixels} / ${totalPixels}`);
  console.log(`差異率         : ${diffPercent}%`);
  console.log(`差分画像       : ${diffPath}`);
  console.log(`判定           : ${hasError ? '❌ 差異あり（要修正）' : '✅ 問題なし'}`);
  console.log('===============================\n');

  // ===== 6. エラーレポートへ追記 =====
  if (hasError) {
    const report = `
## 視覚差異レポート — ${new Date().toLocaleString('ja-JP')}

### 対象コンポーネント
- ${componentName}

### 差異の概要
- 差異ピクセル数: ${diffPixels} px
- 差異率: ${diffPercent}%（閾値: ${DIFF_ALERT_PERCENT}%）

### ファイル
- スクリーンショット: ${screenshotPath}
- 差分画像（赤ハイライト）: ${diffPath}
- Figmaカンプ: ${figmaImagePath}

### 次のアクション
1. 差分画像（赤いハイライト箇所）を確認する
2. 原因を特定する（色・余白・フォントサイズ・レイアウトのズレ等）
3. Fix Coder Agent が該当箇所を修正する
4. 修正後、このスクリプトを再実行して差異率が閾値以下になることを確認する

---
`;
    fs.appendFileSync(REPORT_PATH, report, 'utf-8');
    console.log(`📝 エラーレポートに追記しました: ${REPORT_PATH}`);
    process.exit(1);
  } else {
    console.log('差異は閾値以内です。修正不要です。');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('予期しないエラー:', err);
  process.exit(1);
});
