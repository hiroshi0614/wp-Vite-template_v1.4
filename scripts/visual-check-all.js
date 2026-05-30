/**
 * visual-check-all.js
 *
 * figma/ フォルダのカンプPNGとブラウザ実装を全ページ一括比較する。
 *
 * 使い方:
 *   yarn check:design
 *   yarn check:design http://localhost:8888
 *
 * 出力:
 *   checks/diff/          差分画像（赤ハイライト）
 *   checks/reports/       Markdownレポート
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const BASE_URL     = process.argv[2] || 'http://localhost:8888';
const DIFF_DIR     = path.join('checks', 'diff');
const COMPARE_DIR  = path.join('checks', 'compare');   // 詳細並列比較画像
const SS_DIR       = path.join('checks', 'screenshots');
const REPORT_DIR   = path.join('checks', 'reports');
const TIMESTAMP    = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// 差異率がこの%を超えたら❌
const ALERT_PERCENT = 5.0;
// この%以下になったとき、詳細な3枚並列比較画像を生成する（90%一致 = 差異10%以下）
const FINE_CHECK_THRESHOLD = 10.0;
// ピクセル感度（0〜1、低いほど厳しい）
const THRESHOLD = 0.15;

[DIFF_DIR, COMPARE_DIR, SS_DIR, REPORT_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// =============================================
// Figmaファイル → URL のマッピング
// =============================================
const PAGE_MAP = [
  // cropTop: Figma・ブラウザ両方をこのY座標から下だけ比較する（ヒーローアニメなど動的部分を除外）
  { name: 'top',              figma: 'figma/top.png',              path: '/',          width: 1080, cropTop: 4200 },
  { name: 'top_sp',           figma: 'figma/top_sp.png',           path: '/',          width: 375,  cropTop: 5400 },
  { name: 'plan',             figma: 'figma/plan.png',             path: '/about/',    width: 1080 },
  { name: 'plan_sp',          figma: 'figma/plan_sp.png',          path: '/about/',    width: 375  },
  { name: 'blog_list',        figma: 'figma/blog_list.png',        path: '/blog/',     width: 1080 },
  { name: 'blog_list_sp',     figma: 'figma/blog_list_sp.png',     path: '/blog/',     width: 375  },
  { name: 'blog_details',     figma: 'figma/blog_details.png',     path: null,         width: 1080, resolveLatest: 'posts'   },
  { name: 'blog_details_sp',  figma: 'figma/blog_details_sp.png',  path: null,         width: 375,  resolveLatest: 'posts'   },
  { name: 'result_list',      figma: 'figma/result_list.png',      path: '/result/',   width: 1080 },
  { name: 'result_list_sp',   figma: 'figma/result_list_sp.png',   path: '/result/',   width: 375  },
  { name: 'result_details',   figma: 'figma/result_details.png',   path: null,         width: 1080, resolveLatest: 'result'  },
  { name: 'result_details_sp',figma: 'figma/result_details_sp.png',path: null,         width: 375,  resolveLatest: 'result'  },
  { name: 'contact_form',     figma: 'figma/contact_form.png',     path: '/contact/',  width: 1080 },
  { name: 'contact_form_sp',  figma: 'figma/contact_form_sp.png',  path: '/contact/',  width: 375  },
  { name: '404',              figma: 'figma/404.png',              path: '/this-page-does-not-exist-xyz/', width: 1080 },
  { name: '404_sp',           figma: 'figma/404_sp.png',           path: '/this-page-does-not-exist-xyz/', width: 375  },
];

// =============================================
// 3枚横並び比較画像を生成（Figma | Browser | Diff）
// =============================================
function buildSideBySide(figmaImg, browserImg, diffImg, cmpW, cmpH) {
  const GAP    = 8;   // 境界線の幅（px）
  const totalW = cmpW * 3 + GAP * 2;
  const out    = new PNG({ width: totalW, height: cmpH });

  // 背景を薄いグレーで塗る（境界線になる）
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 200; out.data[i+1] = 200; out.data[i+2] = 200; out.data[i+3] = 255;
  }

  const copyRegion = (src, dstOffsetX) => {
    for (let y = 0; y < cmpH; y++) {
      for (let x = 0; x < cmpW; x++) {
        const si = (y * src.width  + x) * 4;
        const di = (y * totalW + dstOffsetX + x) * 4;
        out.data[di]     = src.data[si];
        out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2];
        out.data[di + 3] = src.data[si + 3];
      }
    }
  };

  copyRegion(figmaImg,   0);
  copyRegion(browserImg, cmpW + GAP);
  copyRegion(diffImg,    cmpW * 2 + GAP * 2);

  return out;
}

// =============================================
// 最新投稿URLを取得
// =============================================
async function resolveLatestUrl(postType) {
  try {
    const res  = await fetch(`${BASE_URL}/wp-json/wp/v2/${postType}?per_page=1&status=publish`);
    const data = await res.json();
    return data[0]?.link ?? null;
  } catch {
    return null;
  }
}

// =============================================
// 1ページ比較
// =============================================
async function comparePage(browser, entry) {
  const figmaPath = entry.figma;
  if (!fs.existsSync(figmaPath)) {
    return { name: entry.name, skipped: true, reason: `Figmaファイルなし: ${figmaPath}` };
  }

  // URL解決
  let url = entry.path ? `${BASE_URL}${entry.path}` : null;
  if (entry.resolveLatest) {
    url = await resolveLatestUrl(entry.resolveLatest);
    if (!url) return { name: entry.name, skipped: true, reason: `${entry.resolveLatest} の投稿が見つかりません` };
  }

  // Figma PNG 読み込み
  const figmaImgRaw = PNG.sync.read(fs.readFileSync(figmaPath));

  // ブラウザでスクリーンショット撮影
  const page = await browser.newPage();
  // ページ高さを Figma に合わせる（縦スクロールを防ぎ全体を撮る）
  await page.setViewportSize({ width: entry.width, height: figmaImgRaw.height });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(500);

  const ssPath = path.join(SS_DIR, `${entry.name}-${TIMESTAMP}.png`);
  await page.screenshot({ path: ssPath, fullPage: true });
  await page.close();

  // ブラウザ PNG 読み込み
  const browserImgRaw = PNG.sync.read(fs.readFileSync(ssPath));

  // cropTop: 指定Y座標より上を除外（動的なヒーロー領域などを比較対象から外す）
  const cropTopOffset = entry.cropTop || 0;
  const sliceImage = (src, yOffset) => {
    if (yOffset <= 0) return src;
    const newH = Math.max(src.height - yOffset, 1);
    const dst  = new PNG({ width: src.width, height: newH });
    for (let y = 0; y < newH; y++) {
      for (let x = 0; x < src.width; x++) {
        const si = ((y + yOffset) * src.width + x) * 4;
        const di = (y * src.width + x) * 4;
        dst.data[di]     = src.data[si];
        dst.data[di + 1] = src.data[si + 1];
        dst.data[di + 2] = src.data[si + 2];
        dst.data[di + 3] = src.data[si + 3];
      }
    }
    return dst;
  };

  const figmaImg   = sliceImage(figmaImgRaw,   cropTopOffset);
  const browserImg = sliceImage(browserImgRaw, cropTopOffset);

  // 比較サイズ = 両画像の小さい方に合わせてクロップ
  const cmpW = Math.min(figmaImg.width,  browserImg.width);
  const cmpH = Math.min(figmaImg.height, browserImg.height);

  const cropImage = (src, w, h) => {
    const dst = new PNG({ width: w, height: h });
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const srcIdx = (y * src.width + x) * 4;
        const dstIdx = (y * w + x) * 4;
        dst.data[dstIdx]     = src.data[srcIdx];
        dst.data[dstIdx + 1] = src.data[srcIdx + 1];
        dst.data[dstIdx + 2] = src.data[srcIdx + 2];
        dst.data[dstIdx + 3] = src.data[srcIdx + 3];
      }
    }
    return dst;
  };

  const figmaCropped   = cropImage(figmaImg,   cmpW, cmpH);
  const browserCropped = cropImage(browserImg, cmpW, cmpH);

  const diffImg    = new PNG({ width: cmpW, height: cmpH });
  const diffPixels = pixelmatch(
    figmaCropped.data,
    browserCropped.data,
    diffImg.data,
    cmpW,
    cmpH,
    { threshold: THRESHOLD, includeAA: true },
  );

  const diffPath = path.join(DIFF_DIR, `${entry.name}-diff-${TIMESTAMP}.png`);
  fs.writeFileSync(diffPath, PNG.sync.write(diffImg));

  const totalPx  = cmpW * cmpH;
  const diffPct  = ((diffPixels / totalPx) * 100).toFixed(2);
  const hasError = parseFloat(diffPct) > ALERT_PERCENT;
  const isFine   = parseFloat(diffPct) <= FINE_CHECK_THRESHOLD;

  // 差異10%以下 → 詳細並列比較画像（Figma | Browser | Diff）を生成
  let comparePath = null;
  if (isFine) {
    const sbs = buildSideBySide(figmaCropped, browserCropped, diffImg, cmpW, cmpH);
    comparePath = path.join(COMPARE_DIR, `${entry.name}-compare-${TIMESTAMP}.png`);
    fs.writeFileSync(comparePath, PNG.sync.write(sbs));
  }

  return {
    name:        entry.name,
    url,
    figmaPath,
    ssPath,
    diffPath,
    comparePath,
    isFine,
    diffPixels,
    totalPx,
    diffPct,
    hasError,
    figmaSize:   `${figmaImg.width}×${figmaImg.height}`,
    browserSize: `${browserImg.width}×${browserImg.height}`,
  };
}

// =============================================
// メイン
// =============================================
async function run() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎨 全ページ デザイン比較チェック開始');
  console.log(`   対象: ${BASE_URL}`);
  console.log(`   閾値: 差異率 ${ALERT_PERCENT}% 超でエラー`);
  console.log(`${'='.repeat(60)}\n`);

  const browser = await chromium.launch();
  const results = [];

  for (const entry of PAGE_MAP) {
    process.stdout.write(`📋 ${entry.name.padEnd(22)} `);
    try {
      const r = await comparePage(browser, entry);
      if (r.skipped) {
        console.log(`⏭  スキップ: ${r.reason}`);
      } else if (r.hasError) {
        console.log(`❌ 差異 ${r.diffPct}%  → ${r.diffPath}`);
      } else if (r.isFine) {
        console.log(`✅ 差異 ${r.diffPct}%  🔍 並列比較: ${r.comparePath}`);
      } else {
        console.log(`✅ 差異 ${r.diffPct}%`);
      }
      results.push(r);
    } catch (err) {
      console.log(`💥 エラー: ${err.message}`);
      results.push({ name: entry.name, skipped: true, reason: err.message });
    }
  }

  await browser.close();

  // =============================================
  // レポート生成
  // =============================================
  const checked  = results.filter(r => !r.skipped);
  const failed   = checked.filter(r => r.hasError);
  const passed   = checked.filter(r => !r.hasError);
  const skipped  = results.filter(r => r.skipped);

  const rows = checked.map(r =>
    `| ${r.name} | ${r.figmaSize} | ${r.browserSize} | ${r.diffPct}% | ${r.hasError ? '❌' : '✅'} |`
  ).join('\n');

  const finePages  = checked.filter(r => r.isFine && !r.hasError);

  const failDetails = failed.map(r => `
### ❌ ${r.name}
- URL: \`${r.url}\`
- 差異率: **${r.diffPct}%**（閾値: ${ALERT_PERCENT}%）
- Figmaサイズ: ${r.figmaSize} / ブラウザサイズ: ${r.browserSize}
- 差分画像: \`${r.diffPath}\`
- スクショ: \`${r.ssPath}\`
`).join('\n');

  const fineDetails = finePages.length === 0 ? '（まだ差異10%以下のページはありません）' : finePages.map(r => `
### 🔍 ${r.name}（差異 ${r.diffPct}%）
- URL: \`${r.url}\`
- 並列比較画像（左: Figma / 中央: ブラウザ / 右: 差分）:
  \`${r.comparePath}\`
`).join('\n');

  const md = `# デザイン比較レポート

- **対象**: ${BASE_URL}
- **実行日時**: ${new Date().toLocaleString('ja-JP')}
- **閾値**: 差異率 ${ALERT_PERCENT}% 超でエラー
- **結果**: ✅ ${passed.length}件OK / ❌ ${failed.length}件NG / ⏭ ${skipped.length}件スキップ

---

## 結果一覧

| ページ | Figmaサイズ | ブラウザサイズ | 差異率 | 判定 |
|---|---|---|---|---|
${rows}

---

## 🔍 詳細比較（差異10%以下・90%一致達成）

${fineDetails}

---

## ❌ 差異あり詳細（差異10%超・要修正）

${failed.length === 0 ? '（なし）' : failDetails}

---

## ⏭ スキップ

${skipped.length === 0 ? '（なし）' : skipped.map(r => `- ${r.name}: ${r.reason}`).join('\n')}

---

> 🎨 差分画像（赤いハイライト）は \`${DIFF_DIR}/\` フォルダを確認してください。
> 閾値を調整する場合は \`ALERT_PERCENT\` を変更してください（現在: ${ALERT_PERCENT}%）。
`;

  const reportPath = path.join(REPORT_DIR, `design-${TIMESTAMP}.md`);
  fs.writeFileSync(reportPath, md, 'utf-8');

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 比較完了');
  console.log(`   ✅ OK     : ${passed.length} ページ`);
  console.log(`   ❌ NG     : ${failed.length} ページ`);
  console.log(`   ⏭  スキップ: ${skipped.length} ページ`);
  if (failed.length > 0) {
    console.log('\n   ❌ 差異があったページ:');
    failed.forEach(r => console.log(`      - ${r.name}  差異率 ${r.diffPct}%`));
  }
  console.log(`\n📝 レポート: ${reportPath}`);
  console.log(`🖼  差分画像: ${DIFF_DIR}/`);
  console.log(`${'='.repeat(60)}\n`);

  if (failed.length > 0) process.exit(1);
}

run().catch(err => {
  console.error('予期しないエラー:', err);
  process.exit(1);
});
