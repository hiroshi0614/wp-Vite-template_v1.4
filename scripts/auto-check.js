/**
 * auto-check.js
 * 
 * 🤖 自動チェック実行スクリプト
 * Playwrightでブラウザを起動し、各チェック項目を自動検証して
 * スクリーンショット＋Markdownレポートを生成する。
 *
 * 使い方:
 *   node scripts/auto-check.js [URL]
 *   node scripts/auto-check.js http://localhost:8888
 *   node scripts/auto-check.js https://example.com
 *
 * 出力先:
 *   checks/screenshots/  - スクリーンショット
 *   checks/reports/      - チェックレポート（Markdown）
 *
 * 必要パッケージ:
 *   npm install playwright axe-playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ========== 設定 ==========
const TARGET_URL = process.argv[2] || 'http://localhost:8888';
const CHECKS_DIR = 'checks';
const SCREENSHOTS_DIR = path.join(CHECKS_DIR, 'screenshots');
const REPORTS_DIR = path.join(CHECKS_DIR, 'reports');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// チェック対象のビューポートサイズ
const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];
// ==========================

// ディレクトリ準備
[CHECKS_DIR, SCREENSHOTS_DIR, REPORTS_DIR].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// レポート蓄積用
const report = {
  url: TARGET_URL,
  timestamp: new Date().toLocaleString('ja-JP'),
  pass: [],
  fail: [],
  warn: [],
};

const pass  = (msg) => { console.log(`  ✅ ${msg}`); report.pass.push(msg); };
const fail  = (msg) => { console.log(`  ❌ ${msg}`); report.fail.push(msg); };
const warn  = (msg) => { console.log(`  ⚠️  ${msg}`); report.warn.push(msg); };
const info  = (msg) => console.log(`\n📋 ${msg}`);

async function run() {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 自動チェック開始`);
  console.log(`   対象URL: ${TARGET_URL}`);
  console.log(`   日時: ${report.timestamp}`);
  console.log(`${'='.repeat(50)}\n`);

  const browser = await chromium.launch();

  // ==========================================
  // 1. レスポンシブ スクリーンショット
  // ==========================================
  info('レスポンシブ スクリーンショット');
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const ssPath = path.join(SCREENSHOTS_DIR, `${vp.name}-${TIMESTAMP}.png`);
    await page.screenshot({ path: ssPath, fullPage: true });
    pass(`スクリーンショット保存: ${ssPath}`);

    // 水平スクロール検出
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasHorizontalScroll) {
      const errPath = path.join(SCREENSHOTS_DIR, `horizontal-scroll-${vp.name}-${TIMESTAMP}.png`);
      await page.screenshot({ path: errPath, fullPage: false });
      fail(`[${vp.name}] 水平スクロールあり → ${errPath}`);
    } else {
      pass(`[${vp.name}] 水平スクロールなし`);
    }

    await page.close();
  }

  // メインページをデスクトップで開いて各チェックを実施
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // コンソールエラーを収集
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // ネットワークエラーを収集
  const networkErrors = [];
  page.on('requestfailed', req => {
    networkErrors.push(`${req.failure()?.errorText} - ${req.url()}`);
  });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // ==========================================
  // 2. HTML構造チェック
  // ==========================================
  info('HTML構造・メタ情報チェック');

  // titleタグ
  const title = await page.title();
  if (title && title.length > 0) {
    pass(`<title> あり: "${title}"`);
  } else {
    fail('<title> タグが空または存在しない');
  }

  // meta description
  const metaDesc = await page.$eval(
    'meta[name="description"]',
    el => el.getAttribute('content'),
  ).catch(() => null);
  if (metaDesc) {
    pass(`meta description あり（${metaDesc.length}文字）`);
    if (metaDesc.length < 50) warn(`meta description が短い（${metaDesc.length}文字 / 推奨: 70〜120文字）`);
    if (metaDesc.length > 160) warn(`meta description が長い（${metaDesc.length}文字 / 推奨: 70〜120文字）`);
  } else {
    fail('meta description が存在しない');
  }

  // h1タグ
  const h1Count = await page.$$eval('h1', els => els.length);
  if (h1Count === 1) {
    pass('h1 が1つ存在する');
  } else if (h1Count === 0) {
    fail('h1 が存在しない');
  } else {
    fail(`h1 が${h1Count}個存在する（1つであるべき）`);
    const ssPath = path.join(SCREENSHOTS_DIR, `multiple-h1-${TIMESTAMP}.png`);
    await page.screenshot({ path: ssPath });
  }

  // 見出し構造チェック（h1→h2→h3 の順番が飛んでいないか）
  const headings = await page.$$eval('h1,h2,h3,h4,h5,h6', els =>
    els.map(el => ({ tag: el.tagName, text: el.textContent.trim().slice(0, 30) }))
  );
  let prevLevel = 0;
  let headingJump = false;
  for (const h of headings) {
    const level = parseInt(h.tag[1]);
    if (level > prevLevel + 1) { headingJump = true; break; }
    prevLevel = level;
  }
  if (headingJump) {
    fail('見出しレベルが飛んでいる（例: h1→h3）');
  } else {
    pass('見出し構造は正しい');
  }

  // favicon
  const favicon = await page.$('link[rel="icon"]');
  if (favicon) {
    pass('ファビコンが設定されている');
  } else {
    fail('ファビコンが設定されていない');
  }

  // viewport meta
  const viewport = await page.$('meta[name="viewport"]');
  if (viewport) {
    pass('viewport meta タグが設定されている');
  } else {
    fail('viewport meta タグが存在しない');
  }

  // ==========================================
  // 3. 画像チェック
  // ==========================================
  info('画像チェック');

  // alt属性のない画像
  const imagesWithoutAlt = await page.$$eval('img', imgs =>
    imgs.filter(img => img.getAttribute('alt') === null)
      .map(img => img.src)
  );
  if (imagesWithoutAlt.length === 0) {
    pass('すべての img に alt 属性あり');
  } else {
    fail(`alt 属性がない img が ${imagesWithoutAlt.length} 件`);
    imagesWithoutAlt.forEach(src => fail(`  alt なし: ${src}`));
    const ssPath = path.join(SCREENSHOTS_DIR, `missing-alt-${TIMESTAMP}.png`);
    await page.screenshot({ path: ssPath });
  }

  // 表示されていない画像の検出
  const brokenImages = await page.evaluate(() => {
    return Array.from(document.images)
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src);
  });
  if (brokenImages.length === 0) {
    pass('表示されていない画像なし');
  } else {
    fail(`表示されていない画像が ${brokenImages.length} 件`);
    brokenImages.forEach(src => fail(`  表示エラー: ${src}`));
    const ssPath = path.join(SCREENSHOTS_DIR, `broken-images-${TIMESTAMP}.png`);
    await page.screenshot({ path: ssPath });
  }

  // ==========================================
  // 4. OGP チェック
  // ==========================================
  info('OGP チェック');

  const ogChecks = [
    { name: 'og:title',       selector: 'meta[property="og:title"]' },
    { name: 'og:description', selector: 'meta[property="og:description"]' },
    { name: 'og:image',       selector: 'meta[property="og:image"]' },
    { name: 'og:url',         selector: 'meta[property="og:url"]' },
  ];
  for (const og of ogChecks) {
    const el = await page.$(og.selector);
    if (el) {
      const content = await el.getAttribute('content');
      pass(`${og.name}: "${(content || '').slice(0, 50)}"`);
    } else {
      fail(`${og.name} が存在しない`);
    }
  }

  // ==========================================
  // 5. パンくずリストチェック
  // ==========================================
  info('パンくずリスト・構造化データ チェック');

  const breadcrumb = await page.$('[aria-label="パンくずリスト"], .p-breadcrumb, nav[class*="breadcrumb"]');
  if (breadcrumb) {
    pass('パンくずリストが実装されている');
  } else {
    warn('パンくずリストが見当たらない（トップページは不要な場合あり）');
  }

  // 構造化データ（JSON-LD）
  const jsonLd = await page.$$eval('script[type="application/ld+json"]', els => els.length);
  if (jsonLd > 0) {
    pass(`構造化データ（JSON-LD）が ${jsonLd} 件存在する`);
  } else {
    fail('構造化データ（JSON-LD）が存在しない');
  }

  // ==========================================
  // 6. リンクチェック
  // ==========================================
  info('リンクチェック（同一オリジン）');

  const links = await page.$$eval('a[href]', els =>
    els.map(el => el.href).filter(href =>
      href.startsWith(window.location.origin) &&
      !href.includes('#') &&
      !href.includes('mailto:') &&
      !href.includes('tel:')
    )
  );
  const uniqueLinks = [...new Set(links)].slice(0, 20); // 最大20件

  let brokenLinks = 0;
  for (const link of uniqueLinks) {
    try {
      const res = await page.request.get(link);
      if (res.status() === 404) {
        fail(`リンク切れ (404): ${link}`);
        brokenLinks++;
      } else if (res.status() >= 400) {
        warn(`リンクエラー (${res.status()}): ${link}`);
      }
    } catch {
      warn(`リンク確認エラー: ${link}`);
    }
  }
  if (brokenLinks === 0) {
    pass(`リンク切れなし（${uniqueLinks.length} 件確認）`);
  }

  // ==========================================
  // 7. パフォーマンス計測
  // ==========================================
  info('パフォーマンス計測');

  const perfMetrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
    };
  });
  const loadTime = perfMetrics.load;
  if (loadTime < 3000) {
    pass(`ページ読み込み: ${loadTime}ms（良好）`);
  } else if (loadTime < 5000) {
    warn(`ページ読み込み: ${loadTime}ms（やや遅い）`);
  } else {
    fail(`ページ読み込み: ${loadTime}ms（遅い・要最適化）`);
    const ssPath = path.join(SCREENSHOTS_DIR, `slow-load-${TIMESTAMP}.png`);
    await page.screenshot({ path: ssPath });
  }

  // ==========================================
  // 8. コンソール・ネットワークエラー
  // ==========================================
  info('コンソール・ネットワークエラー');

  if (consoleErrors.length === 0) {
    pass('コンソールエラーなし');
  } else {
    consoleErrors.forEach(err => fail(`コンソールエラー: ${err}`));
    const ssPath = path.join(SCREENSHOTS_DIR, `console-errors-${TIMESTAMP}.png`);
    await page.screenshot({ path: ssPath });
  }

  if (networkErrors.length === 0) {
    pass('ネットワークエラーなし');
  } else {
    networkErrors.forEach(err => fail(`ネットワークエラー: ${err}`));
  }

  // ==========================================
  // 9. 404ページチェック
  // ==========================================
  info('404ページチェック');

  const notFoundPage = await browser.newPage();
  await notFoundPage.goto(`${TARGET_URL}/this-page-should-not-exist-xyz123`, {
    waitUntil: 'networkidle',
  });
  const notFoundStatus = notFoundPage.url();
  const notFoundContent = await notFoundPage.content();
  const ssPath404 = path.join(SCREENSHOTS_DIR, `404-page-${TIMESTAMP}.png`);
  await notFoundPage.screenshot({ path: ssPath404, fullPage: true });

  if (notFoundContent.includes('404') || notFoundContent.includes('Not Found') || notFoundContent.includes('見つかりません')) {
    pass(`404ページが正しく表示される → ${ssPath404}`);
  } else {
    warn(`404ページの内容を確認してください → ${ssPath404}`);
  }
  await notFoundPage.close();

  // ==========================================
  // 10. アクセシビリティ（基本）
  // ==========================================
  info('アクセシビリティ（基本）');

  // リンクテキスト「こちら」「詳しく」禁止チェック
  const badLinkTexts = await page.$$eval('a', els =>
    els.filter(el => {
      const text = el.textContent.trim();
      return ['こちら', '詳しく', 'もっと見る', 'click here', 'here'].includes(text.toLowerCase());
    }).map(el => el.textContent.trim())
  );
  if (badLinkTexts.length === 0) {
    pass('不適切なリンクテキスト（「こちら」等）なし');
  } else {
    fail(`不適切なリンクテキストが ${badLinkTexts.length} 件: ${badLinkTexts.join(', ')}`);
  }

  // aria-label のないボタンチェック
  const buttonsWithoutLabel = await page.$$eval('button', btns =>
    btns.filter(btn => !btn.textContent.trim() && !btn.getAttribute('aria-label'))
      .length
  );
  if (buttonsWithoutLabel === 0) {
    pass('ラベルのないボタンなし');
  } else {
    fail(`ラベル（テキストまたはaria-label）のないボタンが ${buttonsWithoutLabel} 件`);
  }

  // https確認
  if (TARGET_URL.startsWith('https://')) {
    pass('https化されている');
  } else if (TARGET_URL.startsWith('http://localhost') || TARGET_URL.startsWith('http://127.')) {
    warn('ローカル環境のためhttpsチェックをスキップ（本番環境で要確認）');
  } else {
    fail('https化されていない');
  }

  await page.close();
  await browser.close();

  // ==========================================
  // レポート生成
  // ==========================================
  const total  = report.pass.length + report.fail.length + report.warn.length;
  const passed = report.pass.length;
  const failed = report.fail.length;
  const warned = report.warn.length;

  const md = `# 自動チェックレポート

- **対象URL**: ${report.url}
- **実行日時**: ${report.timestamp}
- **結果**: ✅ ${passed}件合格 / ❌ ${failed}件失敗 / ⚠️ ${warned}件警告 / 合計 ${total}件

---

## ❌ 失敗（${failed}件）

${report.fail.length > 0 ? report.fail.map(m => `- ${m}`).join('\n') : '（なし）'}

## ⚠️ 警告（${warned}件）

${report.warn.length > 0 ? report.warn.map(m => `- ${m}`).join('\n') : '（なし）'}

## ✅ 合格（${passed}件）

${report.pass.map(m => `- ${m}`).join('\n')}

---

## スクリーンショット一覧

\`${SCREENSHOTS_DIR}/\` フォルダを確認してください。

| ファイル名 | 内容 |
|---|---|
| mobile-375-*.png | SP表示（375px）|
| tablet-768-*.png | タブレット表示（768px）|
| desktop-1440-*.png | PC表示（1440px）|
| 404-page-*.png | 404ページ表示 |
| horizontal-scroll-*.png | 水平スクロールが検出されたページ |
| broken-images-*.png | 表示されていない画像があるページ |
| console-errors-*.png | コンソールエラーがあるページ |
| slow-load-*.png | 読み込みが遅いページ |

---

> 🤖 このレポートは自動生成されました。
> 👁 目視確認が必要な項目は CODING_RULES.md の「納品前総合チェックリスト」を参照してください。
`;

  const reportPath = path.join(REPORTS_DIR, `report-${TIMESTAMP}.md`);
  fs.writeFileSync(reportPath, md, 'utf-8');

  // サマリー表示
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 チェック完了');
  console.log(`   ✅ 合格: ${passed}件`);
  console.log(`   ❌ 失敗: ${failed}件`);
  console.log(`   ⚠️  警告: ${warned}件`);
  console.log(`\n📝 レポート: ${reportPath}`);
  console.log(`📸 スクショ: ${SCREENSHOTS_DIR}/`);
  console.log(`${'='.repeat(50)}\n`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('予期しないエラー:', err);
  process.exit(1);
});
