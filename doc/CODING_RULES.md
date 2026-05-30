# CODING_RULES.md — コーディング担当エージェント向け規則

> このドキュメントはコーディング担当・Fix Coder・Reviewer が作業前に必ず読むこと。
> CLAUDE.md の最重要指示と併せて遵守する。

---

## 1. 環境・技術スタック

| 項目 | 内容 |
|---|---|
| ビルド | Vite 5 + `@wordpress/env` 11 |
| CSSプリプロセッサ | Sass 1.70（SCSS記法）|
| CSS設計 | FLOCSS |
| リセットCSS | `kiso.css`（`style.scss` で読み込み済み。JS側で二重読み込みしない）|
| JavaScript | ES Modules（`"type": "module"`）|
| スライダー | Splide（`@splidejs/splide`）|
| 画像最適化 | PNG/JPEG → WebP 自動変換（sharp）|
| Linter | ESLint 8 + Stylelint 16 + Prettier 3 |
| テンプレート | WordPress PHP |

### 開発コマンド

```bash
yarn dev           # Vite開発サーバー + SCSS監視を同時起動
yarn build:wp      # WordPressテーマ用ビルド出力
yarn wp-start      # WordPress環境起動（Docker）
yarn wp-init       # WordPress初期設定適用（初回のみ）
yarn format        # ESLint + Stylelint + Prettier 自動修正
yarn format:check  # フォーマットチェックのみ（修正なし）
yarn validate:acf  # ACFフィールドグループJSONの検証
```

---

## 2. ディレクトリ構成

```
src/assets/
  styles/
    style.scss              # エントリーポイント（globでimport）
    foundation/
      _index.scss           # @use "reset"; @use "base"; をまとめる
      _reset.scss           # hタグ・pタグのmarginリセット（kiso.cssの補完）
      _variables.scss       # CSS変数・@font-face・@use "sass:math"
      _breakpoints.scss     # $breakpoints・$mediaqueries・@mixin mq()
      _base.scss            # html/a/img/body 等の基本スタイル
    layouts/                # l- レイヤー（レイアウト構造のみ）
      _header.scss          # l-header
      _footer.scss          # l-footer
      _inner.scss           # l-inner（コンテナ幅）
      _main.scss            # l-main
    components/             # c- レイヤー（再利用可能な小さなUI部品）
      _btn.scss             # c-btn
      _category.scss        # c-category
      _section-title.scss   # c-section-title
      _pagination.scss      # c-pagination
      _sns.scss             # c-sns
      ...
    projects/               # p- レイヤー（ページ・セクション固有）
      _header.scss          # p-header（ナビ・ロゴ・ハンバーガー）
      _footer.scss          # p-footer（フッターコンテンツ）
      _drawer.scss          # p-drawer（ドロワーメニュー）
      _top.scss             # p-mv, p-about等（TOPページ固有）
      _about.scss           # aboutページ固有
      _news.scss            # newsページ固有
      _contact.scss         # contactページ固有
      _{ページ名}.scss      # 下層ページ追加時はここに新規作成
    utilities/              # u- レイヤー
      _utility.scss
```

### ⚠️ SCSSファイルの配置ルール（絶対厳守）

**「どのコンポーネント・セクションのスタイルか」でファイルを決める。「どのページで使うか」で決めない。**

```
✅ フッターのスタイル   → projects/_footer.scss
✅ ヘッダーのスタイル   → projects/_header.scss
✅ ボタンのスタイル     → components/_btn.scss
✅ TOPのMVスタイル      → projects/_top.scss
✅ aboutページ固有      → projects/_about.scss

❌ フッターを _front-page.scss に書く     → 絶対禁止
❌ ヘッダーを _top.scss に書く            → 絶対禁止
❌ 複数ページ共通スタイルを1ページのファイルに書く → 絶対禁止
❌ layouts/ ファイルに p- クラスを書く   → 絶対禁止
```

新しいページを追加する場合は `projects/_{ページ名}.scss` を新規作成する。
既存コンポーネントのスタイルを新ページのファイルに書き足すことは禁止。

### ⚠️ layoutsファイルの責務（重要）

`layouts/` フォルダのファイルは **上下の余白（margin-block / padding-block）の設定のみ** を担当する。
`p-` で始まるクラスのスタイルは **必ず `projects/` フォルダのファイルに書くこと。**

```scss
// ✅ layouts/_blog.scss の正しい書き方（l- クラスの上下余白のみ）
.l-blog {
  margin-block-start: calc(80 * var(--to-rem));

  @include mq() {
    margin-block-start: calc(120 * var(--to-rem));
  }
}

// ❌ layouts/_blog.scss に p- クラスを書くのは絶対禁止
.p-blog__title {   // ← これは projects/_blog.scss に書くこと
  font-size: calc(24 * var(--to-rem));
}
```
  js/
    script.js               # エントリーポイント（_ なしファイルのみViteがバンドル対象）
    _drawer.js              # _ 始まり = モジュール（script.jsからimport）
    _mv-slider.js
    _faq.js
    _result-slider.js
    _viewport.js
    _works-filter.js
  images/                   # 画像置き場（PNG/JPEGはWebP自動変換）

wordpress/themes/{THEME_NAME}/
  assets/                   # ビルド成果物の出力先
  acf-json/                 # ACFフィールドグループJSON
  *.php                     # WordPressテンプレート
  style.css                 # テーマ情報（Theme Name等）
```

### パスエイリアス（`vite.config.js` で定義済み）

```js
'@'   → src/assets/styles/
'@js' → src/assets/js/
```

---

## 3. CSS変数・SCSS変数の使い分け

このプロジェクトは **CSS変数（カスタムプロパティ）を中心** に設計されている。
SCSSの `$変数` はブレークポイント管理のみ使用する。

### CSS変数（`_variables.scss` の `:root` に定義済み）

```scss
:root {
  /* コンテナ幅 */
  --inner: min(930px, 100%);
  --inner-sp: min(500px, 100%);
  --padding-inner: 25px;

  /* z-index */
  --z-index-header: 900;

  /* color */
  --color-white: #fff;
  --color-text: #0d2936;
  --color-black: #000;
  --color-gray: #f0f0f0;
  --color-border: #aaaaaf;
  --color-accent: #CB0000;
  --color-primary: #234f5e;
  --color-orange: #de8430;
  --color-red: #CB0000;

  /* font-weight */
  --fw-light: 300;
  --fw-regular: 400;
  --fw-medium: 500;
  --fw-bold: 700;

  /* font-family */
  --base-font-family: "YuGothic", "Local Noto Sans JP", "Noto Sans JP", sans-serif;
  --title-font-family: "Lato", "YuGothic", "Local Noto Sans JP", "Noto Sans JP", sans-serif;

  /* rem変換用（16px基準） */
  --to-rem: calc(tan(atan2(1px, var(--root-font-size))) * 1rem);

  /* transition */
  --duration: 0.3s;

  /* header height */
  --header-height: 64px;

  @media screen and (width >= 768px) {
    --header-height: 80px;
  }
}
```

### rem の書き方（重要・マジックナンバー禁止）

```scss
// OK
font-size: calc(16 * var(--to-rem));
padding-block-start: calc(24 * var(--to-rem));
margin-inline: calc(25 * var(--to-rem));

// NG（マジックナンバー・直接px指定）
font-size: 16px;
padding-top: 24px;
```

### ブレークポイント（`_breakpoints.scss` の `@include mq()` を使う）

**SPファースト**設計。デフォルトは `md`（768px以上）。

```scss
// ブレークポイント: sm=600px, md=768px, lg=1024px, xl=1440px

.c-btn {
  font-size: calc(14 * var(--to-rem));  // SP

  @include mq() {       // 768px以上（PC）
    font-size: calc(16 * var(--to-rem));
  }

  @include mq(lg) {     // 1024px以上
    font-size: calc(18 * var(--to-rem));
  }
}
```

---

## 4. FLOCSS クラス命名規則

| レイヤー | プレフィックス | SCSSフォルダ |
|---|---|---|
| Layout | `l-` | `layouts/` |
| Component | `c-` | `components/` |
| Project | `p-` | `projects/` |
| Utility | `u-` | `utilities/` |
| JavaScript用 | `js-` | CSSを当てない（原則） |
| 状態 | `is-` | 単体でスタイルを持たない |

- Element：`__`（`p-header__inner`）
- Modifier：`--`（`c-btn--prev`）
- 複数レイヤー同時付与あり：`class="p-header l-header"`
- クラス名は **略さず書く**（NG: `.ttl` / OK: `.title`）

### `is-` の扱い

```scss
// OK：親クラスと組み合わせる
.p-header__hamburger.is-open span { ... }

// NG：単体定義
.is-open { display: block; }
```

---

## 5. SCSS 記述ルール

- **ネストは書かない**（FLOCSSの方針）。`&` 疑似要素・疑似クラスのみ可
- `@extend` 禁止 → `@mixin` を使う
- `!important` は `u-` クラス以外使用禁止
- `margin/padding` は方向を明示する（`block-start` / `inline-start`）
- 等間隔配置は `gap` を使う
- 画像の縦横比は `aspect-ratio` で指定する
- インライン `style` 属性は使わない

### プロパティ記述順

```scss
.c-btn {
  // 1. ポジション
  position: relative;
  z-index: 1;

  // 2. ボックス
  display: inline-flex;
  align-items: center;
  width: calc(240 * var(--to-rem));
  padding-block: calc(16 * var(--to-rem));
  padding-inline: calc(24 * var(--to-rem));

  // 3. テキスト
  font-size: calc(14 * var(--to-rem));
  font-weight: var(--fw-bold);
  color: var(--color-white);
  letter-spacing: 0.1em;

  // 4. 装飾
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary);
  cursor: pointer;
  transition: opacity var(--duration);

  // 5. 疑似要素・状態（ネスト可）
  &::before { ... }
  &:hover { opacity: 0.8; }

  // 6. Modifier
  &--secondary { ... }
}
```

---

## 6. JavaScript 記述ルール

### script.js の書き方

```js
// CSSはstyle.scssで読み込み済みのため、ここではimportしない（二重読み込み禁止）
import './_drawer.js';
import './_mv-slider.js';
import './_faq.js';
import './_viewport.js';
import './_works-filter.js';

// 開発環境でのみCSSをJS経由でインポート（HMR対応）
if (import.meta.env.DEV) {
  import('../styles/style.scss');
}
```

### モジュールの書き方（`_drawer.js` の例）

```js
const hamburger = document.querySelector('.js-hamburger');
const drawer = document.querySelector('.js-drawer');
if (!hamburger || !drawer) return;  // 要素がなければ即return

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!isOpen));
  hamburger.classList.toggle('is-open');
  drawer.setAttribute('aria-hidden', String(isOpen));
  drawer.classList.toggle('is-open');
});
```

### viewport制御（`_viewport.js` のパターン）

```js
/* 360px以下はviewport固定 */
!(function () {
  const viewport = document.querySelector('meta[name="viewport"]');

  function switchViewport() {
    const value =
      window.outerWidth > 360
        ? 'width=device-width,initial-scale=1'
        : 'width=360';
    if (viewport.getAttribute('content') !== value) {
      viewport.setAttribute('content', value);
    }
  }
  addEventListener('resize', switchViewport, false);
  switchViewport();
})();
```

### ルール

- `const` / `let` のみ。**`var` 禁止**
- ES Modules（`import` / `export`）で記述
- セミコロンあり、シングルクォート統一
- アロー関数で統一
- DOM操作は `js-` クラスで行う（`p-` `c-` クラスは操作しない）
- `addEventListener` を使う（`onclick` 属性禁止）
- 要素が存在しない場合のガード節を必ず書く
- スライダーは **Splide**（jQueryのSwiperは使わない）

### Splide の書き方

```js
// _mv-slider.js
import Splide from '@splidejs/splide';

const el = document.querySelector('.js-splide');
if (el) {
  new Splide(el, {
    type: 'loop',
    autoplay: true,
    interval: 4000,
  }).mount();
}
```

---

## 7. HTML 記述ルール

実際の `index.html` の書き方を基準にする。

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ページタイトル | サイト名</title>
  </head>
  <body>
    ...
    <script type="module" src="/assets/js/script.js"></script>
  </body>
</html>
```

- インデント：スペース2つ
- **`<main>` タグにはクラスを付与しない**（セマンティクス要素として素のタグで使う）
- 属性順：`class` → `id` → `type` → `src/href` → `width` → `height` → `alt` → その他
- 自己終了タグは `/` をつける（`<meta />` `<link />` `<img />`）
- **パスはルート相対**（`/` 始まり）。相対パス（`./`）は使わない
- **文字はUTF-8で直接書く**（`&copy;` → `©`）
- `<img>` には `width` と `height` を必ず指定する
- メインビジュアル以外の `<img>` には `loading="lazy"` を付ける
- `<button>` には `type="button"` を明示する
- ハンバーガーには `aria-label` `aria-expanded` `aria-controls` を付与する
- ドロワーには `id` と `aria-hidden` を付与する

### ⚠️ インラインスタイル（`style="..."`）は原則禁止

HTMLタグ内に直接スタイルを書くことを禁止する。すべてSCSSのクラスで定義すること。

```html
❌ 禁止
<div style="margin-top: 20px;">
<p style="color: red; font-size: 14px;">
<span style="display: none;">

✅ 正しい書き方
<div class="p-section__lead">       ← SCSSでスタイル定義
<p class="p-section__text--alert">  ← Modifierで対応
<span class="is-hidden">            ← is-クラスで状態管理
```

唯一の例外：`adjust-admin-bar.php` のようにWordPress管理バー対応で動的な値が必要な場合のみ `<style>` ブロックを使用可。`style=""` 属性は例外なし。

```html
<!-- ハンバーガー・ドロワー（index.html 準拠） -->
<button
  class="p-header__hamburger js-hamburger"
  type="button"
  aria-label="メニューを開く"
  aria-expanded="false"
  aria-controls="drawer-menu"
>
  <span></span><span></span><span></span>
</button>

<div id="drawer-menu" class="p-header__drawer js-drawer" aria-hidden="true">
  ...
</div>

<!-- 画像（SP/PC切り替え + WebP） -->
<picture>
  <source srcset="/assets/images/hero.webp" media="(min-width: 768px)" type="image/webp" />
  <img src="/assets/images/hero-sp.webp" alt="説明文" width="375" height="500" loading="lazy" />
</picture>
```

---

## 8. 画像ルール

- **配置先**：`src/assets/images/`（ページ別フォルダには分けない）
- **ファイル名**：英小文字・数字・ハイフン・アンダースコアのみ
- **命名形式**：`カテゴリ[_名前][_連番][_状態].拡張子`（例：`image_mv_01.webp`、`icon_arrow.svg`）
- PNG/JPEGは自動でWebPに変換される。HTMLでは `.webp` を参照する
- SVG/GIFはそのままコピーされる
- `copyOriginal: false` のため、元のPNG/JPEGはテーマに含まれない

---

## 9. ファイル命名規則

| 種類 | 命名規則 | 例 |
|---|---|---|
| SCSSファイル | `_` 始まり・ケバブケース | `_btn.scss` |
| JSモジュール | `_` 始まり・ケバブケース | `_drawer.js` |
| JSエントリー | ケバブケース（`_` なし） | `script.js` |
| 画像 | アンダースコア区切り or ケバブケース | `image_mv_01.webp` |
| PHPテンプレート | WordPressの命名規則に従う | `page-contact.php` |

---

## 10. Git・ブランチ運用

```
# ブランチ命名
feature/add-header-component
fix/resolve-drawer-scroll-issue
update/optimize-image-loading
style/adjust-hero-spacing

# コミットメッセージ
add: ヘッダーコンポーネント追加
fix: ドロワーメニューのスクロール問題を修正
update: 画像読み込み最適化
style: ヒーローセクションの余白調整
```

- `main` への直接pushは禁止。必ずPR経由でマージ
- コミット前に `yarn format` を実行する
- 1PRは1テーマに集中する

---

## 11. WordPress / PHP テンプレート規則

### functions-lib/ の構成

`functions.php` は直接編集せず、`functions-lib/` に機能ごとに分割されたファイルを `require_once` で読み込む構成。

```
functions-lib/
  func-acf.php                # ACF Local JSON設定
  func-add-posttype-post.php  # 通常投稿のラベル変更・スラッグ設定
  func-base.php               # テーマの基本設定（add_theme_support等）
  func-enqueue.php            # CSS/JSのエンキュー（Vite対応）
  func-helpers.php            # 共通ヘルパー関数
  func-plugins.php            # TGMPA必須プラグイン設定
  func-security.php           # セキュリティ設定
  func-structured-data.php    # 構造化データ（JSON-LD）
  func-url.php                # URLヘルパー関数
  lib/
    class-tgm-plugin-activation.php  # TGMPAライブラリ（編集禁止）
```

新しい機能は `func-xxx.php` として追加して `functions.php` で読み込む。`functions.php` を直接膨らませない。

---

### テンプレートファイルの構成

```
wordpress/themes/{THEME_NAME}/
  header.php                        # ヘッダー（get_header()で呼び出す）
  footer.php                        # フッター（get_footer()で呼び出す）
  template-parts/
    adjust-admin-bar.php            # 管理バー表示時のCSS調整（header.phpでinclude）
    section-title.php               # セクションタイトル共通パーツ
    pagination.php                  # ページネーション共通パーツ
    page-news-list.php              # ニュース一覧コンテンツ（home.phpから呼び出す）
    archive/
      news-list.php                 # ニュース一覧ループ
    ...
  home.php                          # ブログトップ（投稿ページ設定時）
  archive-{post_type}.php           # カスタム投稿アーカイブ
  single-{post_type}.php            # カスタム投稿詳細
  page-{slug}.php                   # 固定ページ個別テンプレート
```

---

### PHPテンプレートの基本構造

```php
<?php get_header(); ?>

<main>
  <div class="p-works__inner l-inner">

    <?php if (have_posts()) : ?>
      <?php while (have_posts()) : the_post(); ?>

        <article class="c-works-item">
          <a href="<?php the_permalink(); ?>">

            <?php if (has_post_thumbnail()) : ?>
              <?php
              $thumbnail_id = get_post_thumbnail_id();
              $thumbnail    = wp_get_attachment_image_src($thumbnail_id, 'full');
              ?>
              <img
                src="<?php echo esc_url($thumbnail[0]); ?>"
                alt="<?php the_title_attribute(); ?>"
                width="<?php echo esc_attr($thumbnail[1]); ?>"
                height="<?php echo esc_attr($thumbnail[2]); ?>"
                loading="lazy"
              />
            <?php endif; ?>

            <h2 class="c-works-item__title"><?php the_title(); ?></h2>
          </a>
        </article>

      <?php endwhile; ?>
    <?php endif; ?>

  </div>
</main>

<?php get_footer(); ?>
```

**基本ルール：**
- 条件分岐は `if : ... endif;` 形式（波括弧より読みやすい）
- インデントはスペース2つ
- `echo` する値は必ずエスケープする（後述）

---

### URLヘルパー関数（`func-url.php`）

テンプレート内のURL・パスは必ずヘルパー関数を使う。`get_template_directory_uri()` を直接書かない。

```php
// 画像パスを出力（echo済み）
img_path('/common/logo.svg');
// → .../assets/images/common/logo.svg

// ページURLを出力（echo済み）
page_path('contact');  // → .../contact/
page_path();           // → .../ （トップ）
page_path('#section'); // → .../#section

// ページURLを変数に代入（returnのみ）
$url = get_page_url('works');

// カテゴリーURLを取得（returnのみ・echoしない）
$cat_url = category_path('news');

// アセットパスを出力（echo済み）
assets_path('/images/icon_arrow.svg');

// メディアフォルダURLを出力
uploads_path();
```

**実際の `footer.php` の書き方（正しい例）：**
```php
<li class="p-footer__nav-item">
  <a href="<?php page_path('contact'); ?>">お問い合わせ</a>
</li>
```

**注意：** `header.php` の実例で `get_theme_file_uri()` を直接使っている箇所があるが、これは `img_path()` に統一するのが望ましい。新規作成時はヘルパー関数を使うこと。

---

### header.php の書き方（実例準拠）

トップページとそれ以外でロゴのタグを切り替える。

```php
<?php if (is_front_page()) : ?>
  <h1 class="p-header__logo">
    <a href="<?php echo esc_url(home_url('/')); ?>">
      <picture>
        <source srcset="<?php img_path('/common/logo.svg'); ?>" media="(min-width: 768px)" type="image/svg+xml" />
        <img src="<?php img_path('/common/logo-sp.svg'); ?>" alt="サイト名" width="120" height="40" />
      </picture>
    </a>
  </h1>
<?php else : ?>
  <div class="p-header__logo">
    <a href="<?php echo esc_url(home_url('/')); ?>">
      <picture>
        <source srcset="<?php img_path('/common/logo.svg'); ?>" media="(min-width: 768px)" type="image/svg+xml" />
        <img src="<?php img_path('/common/logo-sp.svg'); ?>" alt="サイト名" width="120" height="40" />
      </picture>
    </a>
  </div>
<?php endif; ?>
```

**注意：** `header.php` の実例では `<img>` に `alt` `width` `height` が抜けている箇所がある。新規作成・修正時は必ず付与すること。また `<span style="display:none;">` のインラインスタイルも禁止。SCSSで `.u-visually-hidden` などを使うこと。

---

### テンプレートパーツの呼び出し方

```php
// 引数なし
get_template_part('template-parts/pagination');

// 引数あり（$argsを第3引数で渡す）
get_template_part('template-parts/section-title', null, [
  'main'  => 'NEWS',
  'sub'   => 'ニュース',
  'align' => 'left',   // 'center' | 'left' | 'right'
  'tag'   => 'h1',     // 'h1' | 'h2'（デフォルト: 'h2'）
]);

// ニュース一覧コンテンツ（home.php / archive-news.php から呼び出す）
get_template_part('template-parts/page-news-list');
```

**テンプレートパーツ側での引数受け取り方（`section-title.php` 準拠）：**

```php
// get_template_part の第3引数は $args として受け取る
if (!isset($args) || !is_array($args)) {
  $args = get_query_var('args');
}
$args  = is_array($args) ? $args : [];
$main  = isset($args['main'])  ? (string) $args['main']  : '';
$sub   = isset($args['sub'])   ? (string) $args['sub']   : '';
$align = isset($args['align']) ? (string) $args['align'] : 'center';
$tag   = isset($args['tag'])   ? (string) $args['tag']   : 'h2';
```

---

### ページネーション（`pagination.php`）

```php
// 呼び出し方（親要素でwrapする）
<div class="p-news-list__pagination">
  <?php get_template_part('template-parts/pagination'); ?>
</div>
```

ページネーションのスタイルは `data-state` 属性で管理する（`class` ではなく）。

```html
<!-- 出力例 -->
<nav class="c-pagination" aria-label="ページネーション">
  <a class="c-pagination__item" data-state="prev" href="...">前へ</a>
  <a class="c-pagination__item" data-state="page" href="...">1</a>
  <span class="c-pagination__item" data-state="current" aria-current="page">2</span>
  <a class="c-pagination__item" data-state="next" href="...">次へ</a>
</nav>
```

```scss
// SCSSでの状態管理
.c-pagination__item {
  &[data-state="current"] { ... }
  &[data-state="prev"]    { ... }
  &[data-state="next"]    { ... }
  &[data-state="dots"]    { ... }
}
```

---

### エスケープルール（XSS対策）

| 用途 | 関数 |
|---|---|
| URL | `esc_url()` |
| HTML属性値 | `esc_attr()` |
| テキスト（HTML外） | `esc_html()` |
| タイトル属性 | `the_title_attribute()` |
| HTML含む出力 | `wp_kses_post()` |
| 整数 | `intval()` / `absint()` |

```php
// OK
<a href="<?php echo esc_url(get_permalink()); ?>">
<img alt="<?php the_title_attribute(); ?>" />
<p><?php echo esc_html(get_bloginfo('name')); ?></p>
<p><?php echo esc_html(date('Y')); ?></p>

// NG（エスケープなし）
<a href="<?php the_permalink(); ?>">       ← the_permalink() はecho済みだがURLエスケープなし
<p><?php echo get_bloginfo('name'); ?></p>  ← エスケープなし
```

---

### ACF フィールドの使い方

フィールドグループはすべて `acf-json/` に JSON で管理する。

```php
// 画像フィールド（return_format: array）
$mv_sp = get_field('main_visual__sp');
$mv_pc = get_field('main_visual__pc');

if ($mv_sp) : ?>
  <img
    src="<?php echo esc_url($mv_sp['url']); ?>"
    alt="<?php echo esc_attr($mv_sp['alt']); ?>"
    width="<?php echo esc_attr($mv_sp['width']); ?>"
    height="<?php echo esc_attr($mv_sp['height']); ?>"
    loading="lazy"
  />
<?php endif;
```

**ACF運用ルール：**
- 管理画面でフィールドグループを変更したら `acf-json/` のJSONを必ずGitにコミットする
- `yarn validate:acf` でJSON整合性を確認する
- ACFの自動同期は行わない（管理画面の「同期が利用できます」から手動で同期）

---

### カスタム投稿タイプ（CPT）の運用

CPTは **Custom Post Type UI プラグイン** で作成し、`acf-json/` のJSONと同様に `post_type_xxx.json` で管理する。

```
投稿タイプスラッグ: result（英小文字・アンダースコアのみ）
アーカイブ一覧: archive-result.php
詳細: single-result.php
```

CPT追加後は必ず **設定 → パーマリンク → 変更を保存** でリライトルールをフラッシュする。

---

### 管理バー対応（`adjust-admin-bar.php`）

`header.php` の `<head>` 内で読み込む。ログイン時のみ管理バー分の `top` を補正する。

```php
// header.php 内 <head> 閉じタグ前に記述
<?php get_template_part('template-parts/adjust-admin-bar'); ?>
```

このファイルは編集不要。ヘッダーの `position: fixed` の `top` 値を変更した場合のみ合わせて調整する。

---

### 構造化データのカスタマイズ

構造化データは自動出力される。変更が必要な場合は `func-structured-data.php` にフィルターを追加する。

```php
add_filter('simple_structured_data_config', function ($config) {
  $config['organization_name'] = '株式会社サンプル';
  $config['organization_logo'] = get_template_directory_uri() . '/assets/images/logo.svg';
  return $config;
});
```

---

### アーカイブタイトルの取得

```php
$title_parts = get_archive_title_parts();
// $title_parts['title_text']  → "ブログ" / "2024年1月" 等
// $title_parts['title_label'] → "BLOG" / "MONTH" 等
```

---

## 12. Reviewer チェックリスト

### HTML
- [ ] パスがルート相対（`/` 始まり）か
- [ ] `<main>` タグにクラスが付いていないか
- [ ] `<img>` に `width` `height` `alt` があるか
- [ ] メインビジュアル以外に `loading="lazy"` があるか
- [ ] `<button>` に `type="button"` があるか
- [ ] ハンバーガーに `aria-label` `aria-expanded` `aria-controls` があるか
- [ ] ドロワーに `id` と `aria-hidden` があるか
- [ ] `onclick` 属性が使われていないか
- [ ] `&copy;` 等の文字実体参照が使われていないか

### SCSS
- [ ] FLOCSSのプレフィックスが正しいか（`l-` `c-` `p-` `u-`）
- [ ] クラス名が略さず書かれているか
- [ ] ネストが書かれていないか（疑似要素・クラスは除く）
- [ ] スペーシング・font-sizeに `calc(値 * var(--to-rem))` が使われているか
- [ ] 色・フォントに CSS変数（`var(--color-xxx)`）が使われているか
- [ ] `margin/padding` が方向を明示しているか（`block-start` 等）
- [ ] `@extend` が使われていないか
- [ ] `!important` が `u-` 以外で使われていないか
- [ ] `is-` クラスが単体でスタイルを持っていないか
- [ ] SPファーストで `@include mq()` が使われているか

### JavaScript
- [ ] `var` が使われていないか
- [ ] `style.scss` を `script.js` で二重読み込みしていないか
- [ ] DOM操作が `js-` クラスで行われているか
- [ ] 要素存在チェックのガード節があるか
- [ ] `onclick` 属性が使われていないか
- [ ] スライダーにSplideが使われているか
- [ ] `aria-expanded` / `aria-hidden` をJSで更新しているか

### PHP / WordPress
- [ ] URLに `img_path()` `page_path()` 等のヘルパー関数が使われているか（`get_template_directory_uri()` 直書き禁止）
- [ ] DB値・ユーザー入力が `esc_url()` `esc_attr()` `esc_html()` でエスケープされているか
- [ ] 属性値に `the_title_attribute()` が使われているか（`the_title()` は本文中のみ）
- [ ] `<img>` に `alt` `width` `height` があるか（テンプレートパーツ含む）
- [ ] インラインスタイル（`style="..."` 属性）が使われていないか
- [ ] テンプレートパーツを `get_template_part()` で呼び出しているか
- [ ] `get_template_part()` に引数を渡す場合、第3引数（`$args`）を使っているか
- [ ] ページネーションに `pagination.php` が使われているか（`data-state` 属性で状態管理）
- [ ] ACFフィールドを変更した場合、`acf-json/` のJSONがコミットされているか
- [ ] `yarn validate:acf` がエラーなしで通るか
- [ ] CPTを追加した場合、パーマリンクをフラッシュしたか
- [ ] `functions.php` を直接編集していないか（`functions-lib/` に分割しているか）

### フォーマット
- [ ] `yarn format:check` がエラーなしで通るか

---

## 13. 納品前 総合チェックリスト

> 🤖 = Playwrightで自動チェック可能
> 👁 = 目視・人間が判断

### テキスト・コード品質
- [ ] 👁 テキストに誤字脱字がないか
- [ ] 👁 テキストに意図的でない表記ゆれがないか
- [ ] 🤖 コードにスペルミスがないか
- [ ] 🤖 閉じタグの書き忘れはないか
- [ ] 🤖 属性の書き忘れ（`alt` `width` `height` `type` 等）はないか
- [ ] 🤖 `<head>` 内に `<title>` タグや `<meta>` タグが書かれているか
- [ ] 🤖 HTML構造は正しいか
- [ ] 🤖 HTMLやCSSの文法は正しいか

### デザイン再現性
- [ ] 👁 サイトの見た目はデザインカンプ通りか
- [ ] 👁 色はデザインカンプ通りか
- [ ] 👁 フォントはデザインカンプ通りか
- [ ] 👁 画像はデザインカンプ通りか
- [ ] 🤖 レスポンシブサイズで表示崩れがないか（375px / 768px / 1440px でスクリーンショット）
- [ ] 🤖 水平スクロールがないか
- [ ] 👁 記事のサムネイル画像サイズが不規則でも表示が崩れないか
- [ ] 👁 記事のタイトルや本文の文字数を増やしても表示が崩れないか
- [ ] 🤖 表示されていない画像がないか
- [ ] 👁 ダミーで入れた画像やテキストが残っていないか

### 動作・機能
- [ ] 🤖 リンク切れがないか
- [ ] 👁 アニメーションの挙動は正しいか
- [ ] 👁 お問い合わせフォームは正しく動作するか
- [ ] 👁 各種OSやブラウザで表示崩れがないか（Chrome / Firefox / Safari / Edge）
- [ ] 🤖 読み込みスピードが遅いページはないか
- [ ] 👁 処理に時間がかかる動作はないか
- [ ] 👁 システムは正しく動いているか
- [ ] 🤖 404エラーページは正しく表示されるか
- [ ] 👁 適切なページに301リダイレクトされるか

### パフォーマンス・最適化
- [ ] 🤖 画像や動画の最適化ができているか（WebP変換・圧縮）
- [ ] 🤖 ファビコンは設定されているか
- [ ] 🤖 構造化マークアップは記述されているか
- [ ] 🤖 コンソールエラーが起きていないか
- [ ] 🤖 ネットワークエラーが起きていないか

### セキュリティ
- [ ] 👁 サイトに脆弱性がないか（XSS・SQLインジェクション等）

### SEO
- [ ] 🤖 `<title>` にサイト全体で狙うキーワードが含まれているか
- [ ] 🤖 `<h1>` にページ単体で狙うキーワードが含まれているか
- [ ] 🤖 `<meta name="description">` は適切に使用されているか
- [ ] 🤖 見出しタグ（h1〜h6）の構造に問題はないか（h1が複数ないか等）
- [ ] 👁 URLはシンプルでページ内容がパッと見で分かるか
- [ ] 👁 URLは階層構造が反映されているか
- [ ] 👁 内部リンクは最適化されているか
- [ ] 🤖 テキストリンクは適切に記述されているか
- [ ] 👁 ナビゲーションは階層構造が反映されているか
- [ ] 🤖 パンくずリストは実装されているか
- [ ] 👁 投稿ページには目次が実装されているか
- [ ] 🤖 画像や動画は軽量化されているか
- [ ] 🤖 画像には内容に適したファイル名が設定されているか
- [ ] 🤖 画像の `alt` タグは適切に記述されているか
- [ ] 👁 CSSやJavaScriptの記述量を最適化したか
- [ ] 🤖 構造化データをマークアップしているか
- [ ] 🤖 モバイルファーストに対応しているか（viewport設定）
- [ ] 👁 文字サイズは適切か（最小16px以上を推奨）
- [ ] 👁 リンクのクリック領域は適切か（最小44×44px以上を推奨）
- [ ] 👁 XMLサイトマップを作成しているか
- [ ] 👁 検索結果への表示が不要なページに `noindex` 処理をしたか
- [ ] 🤖 `robots.txt` は適切に設置されているか
- [ ] 🤖 https化されているか
- [ ] 👁 URLは正規化したか（`canonical` タグ）
- [ ] 👁 リダイレクト処理は正しく動作しているか
- [ ] 🤖 リンク切れしている箇所はないか
- [ ] 🤖 404ページは設定されているか
- [ ] 🤖 OGPは適切に設定されているか（`og:title` `og:description` `og:image`）

### アクセシビリティ
- [ ] 👁 音声を自動再生させない
- [ ] 👁 袋小路に陥らせない（行き止まりのページがない）
- [ ] 👁 光の点滅は危険（3回/秒以上の点滅を使わない）
- [ ] 👁 自動でコンテンツを切り替えない（カルーセル等は手動操作を優先）
- [ ] 🤖 ロゴ・写真・イラストなどの画像に代替テキスト（`alt`）が付与されているか
- [ ] 👁 キーボード操作だけで全機能にアクセスできるか
- [ ] 👁 操作に制限時間を設けていないか
- [ ] 👁 赤字・太字・下線・拡大など単一の表現のみで情報を伝えていないか
- [ ] 👁 スクリーンリーダーで順に読み上げたときに意味が通じる順序か
- [ ] 🤖 見出し要素（`h1`〜`h6`）でセクション構造が表現されているか
- [ ] 🤖 文字と背景の間に十分なコントラスト比があるか（WCAG AA: 4.5:1以上）
- [ ] 👁 テキストを200%拡大しても情報が読み取れるか
- [ ] 🤖 ページの内容を示す `<title>` が適切に表現されているか
- [ ] 🤖 リンクテキストがリンク先を適切に表現しているか（「こちら」「詳しく」禁止）
- [ ] 👁 ナビゲーションに一貫性があるか（全ページで同じ位置・順序）
- [ ] 👁 同じ機能には同じラベルや説明が付いているか
- [ ] 👁 入力フォームが様々な使い方でも使えるか（`autocomplete` 属性等）
- [ ] 👁 音声・映像コンテンツに代替コンテンツ（字幕・書き起こし）が付与されているか
- [ ] 👁 動きや点滅のあるコンテンツを利用者が停止・非表示にできるか
- [ ] 🤖 コンテンツの変化が `aria-live` 等でスクリーンリーダーに伝わるか
- [ ] 👁 アクセシビリティ・オーバーレイ系プラグインを使用していないか（支援技術と干渉するため）