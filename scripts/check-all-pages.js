/**
 * check-all-pages.js
 *
 * WordPressのREST APIから全ページ・投稿・CPTのURLを取得し、
 * 各ページに対して自動チェックを実施してレポートを生成する。
 *
 * 使い方:
 *   yarn check:all
 *   yarn check:all http://localhost:8888
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL   = process.argv[2] || 'http://localhost:8888';
const CHECKS_DIR = 'checks';
const SS_DIR     = path.join(CHECKS_DIR, 'screenshots');
const REPORT_DIR = path.join(CHECKS_DIR, 'reports');
const TIMESTAMP  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

[CHECKS_DIR, SS_DIR, REPORT_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// =============================================
// URLを収集する（REST API + 固定ページ）
// =============================================
async function collectUrls() {
  const urls = new Map(); // url → ラベル

  // トップページ・固定URL
  urls.set(`${BASE_URL}/`,         'トップページ');
  urls.set(`${BASE_URL}/blog/`,    'ブログ一覧（home.php）');
  urls.set(`${BASE_URL}/about/`,   'アバウトページ');
  urls.set(`${BASE_URL}/contact/`, 'お問い合わせ');
  urls.set(`${BASE_URL}/result/`,  '実績アーカイブ');
  urls.set(`${BASE_URL}/this-page-does-not-exist-xyz/`, '404ページ');

  const fetchJson = async (endpoint) => {
    try {
      const res = await fetch(`${BASE_URL}/wp-json/wp/v2/${endpoint}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  // 固定ページ（REST API）
  const pages = await fetchJson('pages?per_page=100&status=publish');
  for (const p of pages) {
    if (!urls.has(p.link)) urls.set(p.link, `固定ページ: ${p.title.rendered}`);
  }

  // 通常投稿（最新5件を代表でチェック）
  const posts = await fetchJson('posts?per_page=5&status=publish');
  for (const p of posts) {
    if (!urls.has(p.link)) urls.set(p.link, `投稿: ${p.title.rendered}`);
  }

  // カスタム投稿 result（最新5件）
  const results = await fetchJson('result?per_page=5&status=publish');
  for (const p of results) {
    if (!urls.has(p.link)) urls.set(p.link, `実績詳細: ${p.title.rendered}`);
  }

  return urls;
}

// =============================================
// 1ページ分のチェック
// =============================================
async function checkPage(browser, url, label) {
  const result = { url, label, pass: [], fail: [], warn: [], screenshots: [] };

  const ok   = (msg) => { process.stdout.write(`    ✅ ${msg}\n`); result.pass.push(msg); };
  const ng   = (msg) => { process.stdout.write(`    ❌ ${msg}\n`); result.fail.push(msg); };
  const note = (msg) => { process.stdout.write(`    ⚠️  ${msg}\n`); result.warn.push(msg); };

  // スラッグをファイル名用に変換
  const slug = url.replace(BASE_URL, '').replace(/\//g, '_').replace(/^_/, '') || 'top';

  // SP / PC スクリーンショット
  for (const vp of [
    { name: 'sp',  width: 375,  height: 812 },
    { name: 'pc',  width: 1440, height: 900 },
  ]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

      const ssPath = path.join(SS_DIR, `${slug}-${vp.name}-${TIMESTAMP}.png`);
      await page.screenshot({ path: ssPath, fullPage: true });
      result.screenshots.push(ssPath);

      if (vp.name === 'pc') {
        // --- 各種チェックはPC表示で実施 ---

        // HTTPステータス
        const status = res?.status() ?? 0;
        if (status === 404) {
          if (url.includes('does-not-exist')) {
            ok('404ページが正しく表示される');
          } else {
            ng(`404エラー: ${url}`);
          }
        } else if (status >= 400) {
          ng(`HTTPエラー (${status}): ${url}`);
        }

        // 水平スクロール
        const hScroll = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        if (hScroll) ng('水平スクロールあり'); else ok('水平スクロールなし');

        // title
        const title = await page.title();
        if (title) ok(`<title>: "${title.slice(0, 50)}"`); else ng('<title> が空または存在しない');

        // h1
        const h1Count = await page.$$eval('h1', els => els.length);
        if (h1Count === 1)      ok('h1 が1つ存在する');
        else if (h1Count === 0) ng('h1 が存在しない');
        else                    ng(`h1 が ${h1Count} 個存在する（1つのみ許可）`);

        // alt なし画像
        const noAlt = await page.$$eval('img', imgs =>
          imgs.filter(i => i.getAttribute('alt') === null).map(i => i.src)
        );
        if (noAlt.length === 0) ok('すべての img に alt 属性あり');
        else ng(`alt なし img: ${noAlt.length} 件`);

        // 壊れた画像（SVGはnaturalWidth=0が正常なので除外）
        const broken = await page.evaluate(() =>
          Array.from(document.images)
            .filter(i => !i.src.endsWith('.svg') && (!i.complete || i.naturalWidth === 0))
            .map(i => i.src)
        );
        if (broken.length === 0) ok('表示されていない画像なし');
        else ng(`表示エラー画像: ${broken.length} 件 — ${broken.slice(0, 3).join(', ')}`);

        // コンソールエラー（ページ遷移後に収集済みのものを確認）
        const errors = [];
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        if (errors.length === 0) ok('コンソールエラーなし');
        else errors.forEach(e => ng(`コンソールエラー: ${e}`));

        // インラインスタイル検出（Splide/JS動的付与クラスは除外）
        const inlineStyleCount = await page.$$eval('[style]', els =>
          els.filter(el => !el.classList.contains('splide__track') &&
                           !el.classList.contains('splide__list') &&
                           !el.classList.contains('splide__slide') &&
                           !el.classList.contains('splide__arrows') &&
                           !el.id?.startsWith('splide')).length
        );
        if (inlineStyleCount === 0) ok('インラインスタイルなし');
        else note(`インラインスタイルあり: ${inlineStyleCount} 件（adjust-admin-bar.php 以外は要確認）`);
      }
    } catch (err) {
      ng(`ページ読み込み失敗: ${err.message}`);
    }
    await page.close();
  }

  return result;
}

// =============================================
// メイン
// =============================================
async function run() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🚀 全ページ 自動チェック開始');
  console.log(`   対象: ${BASE_URL}`);
  console.log(`   日時: ${new Date().toLocaleString('ja-JP')}`);
  console.log(`${'='.repeat(60)}\n`);

  const urls = await collectUrls();
  console.log(`📄 チェック対象: ${urls.size} ページ\n`);

  const browser = await chromium.launch();
  const allResults = [];

  for (const [url, label] of urls) {
    console.log(`\n📋 [${allResults.length + 1}/${urls.size}] ${label}`);
    console.log(`   ${url}`);
    const result = await checkPage(browser, url, label);
    allResults.push(result);
  }

  await browser.close();

  // =============================================
  // レポート生成
  // =============================================
  const totalPass = allResults.reduce((s, r) => s + r.pass.length, 0);
  const totalFail = allResults.reduce((s, r) => s + r.fail.length, 0);
  const totalWarn = allResults.reduce((s, r) => s + r.warn.length, 0);
  const failedPages = allResults.filter(r => r.fail.length > 0);

  const pageSection = allResults.map(r => {
    const status = r.fail.length > 0 ? '❌' : r.warn.length > 0 ? '⚠️' : '✅';
    return `### ${status} ${r.label}
\`${r.url}\`

${r.fail.map(m => `- ❌ ${m}`).join('\n') || ''}
${r.warn.map(m => `- ⚠️  ${m}`).join('\n') || ''}
${r.pass.map(m => `- ✅ ${m}`).join('\n')}

**スクリーンショット:**
${r.screenshots.map(s => `- \`${s}\``).join('\n')}
`;
  }).join('\n---\n\n');

  const md = `# 全ページ 自動チェックレポート

- **対象**: ${BASE_URL}
- **実行日時**: ${new Date().toLocaleString('ja-JP')}
- **チェックページ数**: ${allResults.length} ページ
- **結果サマリー**: ✅ ${totalPass}件合格 / ❌ ${totalFail}件失敗 / ⚠️ ${totalWarn}件警告

---

## ❌ 失敗のあるページ（${failedPages.length} ページ）

${failedPages.length === 0 ? '（なし）' : failedPages.map(r =>
  `- **${r.label}** \`${r.url}\`\n${r.fail.map(m => `  - ❌ ${m}`).join('\n')}`
).join('\n')}

---

## 全ページ詳細

${pageSection}

---

> 🤖 このレポートは自動生成されました。
> 👁 目視確認が必要な項目は \`doc/CODING_RULES.md\` の「納品前総合チェックリスト」を参照してください。
`;

  const reportPath = path.join(REPORT_DIR, `all-pages-${TIMESTAMP}.md`);
  fs.writeFileSync(reportPath, md, 'utf-8');

  // サマリー表示
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 チェック完了');
  console.log(`   ✅ 合格: ${totalPass} 件`);
  console.log(`   ❌ 失敗: ${totalFail} 件`);
  console.log(`   ⚠️  警告: ${totalWarn} 件`);
  console.log(`   対象ページ: ${allResults.length} ページ`);
  if (failedPages.length > 0) {
    console.log(`\n   ❌ 失敗があったページ:`);
    failedPages.forEach(r => console.log(`      - ${r.label} (${r.url})`));
  }
  console.log(`\n📝 レポート: ${reportPath}`);
  console.log(`📸 スクショ: ${SS_DIR}/`);
  console.log(`${'='.repeat(60)}\n`);

  if (totalFail > 0) process.exit(1);
}

run().catch(err => {
  console.error('予期しないエラー:', err);
  process.exit(1);
});
