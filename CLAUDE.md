# CLAUDE.md — マルチエージェント コーディングプロジェクト

---

## ⚠️ 最重要指示（全エージェント共通・必ず遵守）

デザインカンプ通りに実装できなかった箇所は、なぜ実装できなかったのか、**徹底的に原因をリサーチし、解明してください。**

原因が解明した後に修正を行ってください。修正については、原因が確認できた段階で承認を得る必要はなく、**修正はそのまま進めてください。**

**すべての修正項目について、修正後に必ずブラウザで該当箇所を表示し、スクリーンショットを撮って、修正が正しく反映されていることを自分で確認してください。確認して問題があれば、再度修正してください。**

---

## 📐 デザイン精度チェック（実装・修正時に必ず実行）

Figmaカンプとブラウザ表示を比較する際は、**以下の項目を必ずこの順番でチェックすること。**
目視で済ませず、スクリーンショットを撮って1項目ずつ確認する。

### チェック順序

**1. フォントサイズ・行間・フォントウェイト**
- `font-size` の値がカンプと一致しているか
- `line-height` が指定されているか（未指定でデフォルト値になっていないか）
- `font-weight` が bold / medium / regular で合っているか

**2. 余白（margin / padding）**
- セクション間の `margin-block`（上下余白）
- 要素内の `padding`
- SP と PC で余白が正しく切り替わっているか

**3. カラー**
- テキスト色・背景色・ボーダー色がカンプと一致しているか
- ホバー時の色変化が実装されているか

**4. グリッド・レイアウト構造**
- 列数・カード幅がカンプと一致しているか（特に PC 2列 vs 3列の違い）
- 要素の並び順がカンプと一致しているか
- サイドバーがある場合、幅・位置・内部の並び順が正しいか

**5. SP 表示のズレ**
- SP（375px）でスクリーンショットを撮り、カンプ SP 版と比較する
- 折り返し・スタック方向・フォントサイズの SP 値が正しいか

### 修正フロー

```
1. yarn screenshot <URL> <名前>    ← 現状を撮影
2. figma/[ページ名].png と並べて比較（Readツールで両方表示）
3. 上記5項目を順番にチェック
4. ズレがあれば SCSS または PHP を修正
5. yarn build:wp
6. yarn screenshot <URL> <名前>-fix1  ← 修正後を撮影
7. 再比較 → 問題なければ次の項目へ
8. 全項目クリアで次のページへ
```

> **目標：** 各ページで Figma との一致率 90% 以上。達成できるまで修正サイクルを繰り返す。

---

## 🚨 絶対に守るルール（違反した場合は即座に修正すること）

### ルールA：Figmaカンプを必ず実装すること

Figmaのデザインカンプ（URLまたは画像）が与えられた場合、**そのページを必ず新規ファイルとして実装すること。**

- 「似たページがあるから省略する」は禁止
- 「一部だけ実装する」は禁止
- カンプに存在するすべてのセクション・要素を実装すること
- 下層ページの指示があれば、対応するPHPテンプレートファイル（`page-{slug}.php` 等）とSCSSファイルを新規作成すること

### ルールB：SCSSファイルはFLOCSSの構成に従うこと

**絶対に守ること：**

```
✅ フッターのスタイル → src/assets/styles/projects/_footer.scss に書く
✅ ヘッダーのスタイル → src/assets/styles/projects/_header.scss に書く
✅ ボタンのスタイル   → src/assets/styles/components/_btn.scss に書く
✅ TOPページ固有スタイル → src/assets/styles/projects/_top.scss に書く

❌ フッターのスタイルを _front-page.scss に書く → 絶対禁止
❌ 複数コンポーネントのスタイルを1ファイルにまとめる → 絶対禁止
❌ ページ名のファイルにページ固有以外のスタイルを書く → 絶対禁止
❌ layoutsファイルに p- クラスのスタイルを書く → 絶対禁止
```

**layoutsファイルの責務（重要）：**

`layouts/` フォルダのファイルは **上下の余白（margin-block / padding-block）の設定のみ** を担当する。
`p-` で始まるクラスのスタイルは **必ず `projects/` フォルダのファイルに書くこと。**

```
✅ layouts/_blog.scss → l-blog のセクション間余白のみ記述
✅ projects/_blog.scss → p-blog__* のコンポーネントスタイルを記述

❌ layouts/_blog.scss に .p-blog__title { ... } を書く → 絶対禁止
```

**FLOCSSのレイヤーとファイルの対応：**

| スタイルの対象 | 置くべきファイル |
|---|---|
| ヘッダー全体 | `projects/_header.scss` |
| フッター全体 | `projects/_footer.scss` |
| ドロワーメニュー | `projects/_drawer.scss` |
| ボタン | `components/_btn.scss` |
| カテゴリータグ | `components/_category.scss` |
| セクションタイトル | `components/_section-title.scss` |
| TOPページ固有 | `projects/_top.scss` |
| 下層ページ固有 | `projects/_{ページ名}.scss` |
| レイアウト（上下余白のみ） | `layouts/_{レイアウト名}.scss` |
| ユーティリティ | `utilities/_utility.scss` |

### ルールC：HTMLタグ内にインラインスタイルを書かないこと

**`style="..."` 属性の使用は原則禁止。**

```html
❌ 禁止
<div style="margin-top: 20px; color: red;">

❌ 禁止
<p style="display: none;">

✅ 正しい書き方（SCSSでクラスを定義する）
<div class="p-section__lead">

✅ JSで動的に表示切り替えする場合はis-クラスを使う
<p class="js-target is-hidden">
```

**唯一の例外：** `adjust-admin-bar.php` 等、WordPressの管理バー対応で動的な値が必要な場合のみ `<style>` ブロックを使用可（`style=""` 属性は例外なし）。

---

## エージェント構成と役割分担

| エージェント | 役割 | 担当ファイル範囲 |
|---|---|---|
| Orchestrator | タスク分解・起動・完了管理 | `task-manifest.json` |
| Coder Agent A | コンポーネント実装 | `src/components/` |
| Coder Agent B | スタイル実装 | `src/styles/` |
| Coder Agent C | ロジック・状態管理実装 | `src/hooks/`, `src/store/` |
| Reviewer Agent | コード品質・デザイン整合性チェック | 全体（読み取り専用） |
| Error Analyzer | エラー原因の特定・レポート作成 | `logs/error-report.md` |
| Fix Coder Agent | エラーレポートを元に修正 | 該当ファイルのみ |

---

## ルール1：ファイル競合の防止

### 担当範囲は必ず守ること

各エージェントは **自分の担当ディレクトリ以外のファイルを編集してはならない。**

```
src/
  components/   ← Coder Agent A のみ編集可
  styles/       ← Coder Agent B のみ編集可
  hooks/        ← Coder Agent C のみ編集可
  store/        ← Coder Agent C のみ編集可
logs/
  error-report.md  ← Error Analyzer のみ書き込み可
task-manifest.json ← Orchestrator のみ更新可
```

### 着手前に必ずtask-manifest.jsonを確認する

各エージェントは作業開始前に `task-manifest.json` を読み込み、自分のタスクが `pending` であることを確認してから `in_progress` に更新する。

```json
{
  "tasks": {
    "ComponentA": {
      "status": "pending",
      "agent": "CoderA",
      "files": ["src/components/ComponentA.tsx"]
    },
    "StyleSheet": {
      "status": "pending",
      "agent": "CoderB",
      "files": ["src/styles/main.css"]
    },
    "StateLogic": {
      "status": "pending",
      "agent": "CoderC",
      "files": ["src/hooks/useStore.ts"]
    }
  }
}
```

**ステータス定義：**
- `pending` — 未着手
- `in_progress` — 作業中（他エージェントは触らない）
- `done` — 完了
- `error` — エラーあり（Error Analyzerへ引き渡し）
- `fixing` — Fix Coder対応中

---

## ルール2：コンテキスト共有

各エージェントは作業完了時に以下を `task-manifest.json` の該当タスクに追記する。

```json
"ComponentA": {
  "status": "done",
  "agent": "CoderA",
  "files": ["src/components/ComponentA.tsx"],
  "exports": ["ComponentA"],
  "notes": "propsはvariantとonClickのみ。Bに依存するclassNameあり。"
}
```

これにより他のエージェントが依存関係を把握できる。

---

## ルール3：Reviewerの起動タイミング

Orchestratorは **全Coderエージェントのstatusが `done` になったことを確認してから** Reviewerを起動する。

```bash
# Orchestratorの起動スクリプト例
claude --headless "CoderA タスクを実行" &
claude --headless "CoderB タスクを実行" &
claude --headless "CoderC タスクを実行" &
wait  # 全プロセスの完了を待つ

# 全タスクがdoneであることを確認
claude --headless "Reviewer タスクを実行"
```

---

## ルール4：エラーループの上限

Fix Coder → Reviewer のサイクルは **最大3回** までとする。

Orchestratorは `task-manifest.json` の `retry_count` を管理し、上限に達した場合は作業を停止してエラーレポートを出力する。

```json
"retry_count": 0,
"max_retry": 3
```

---

## ルール5：Figmaデザイン整合性チェック（Reviewer必須項目）

Reviewerは以下を必ず確認する。

1. **色・フォントサイズ・余白** がFigmaトークンと一致しているか
2. **レスポンシブ対応** がデザインカンプ通りか
3. **インタラクション**（hover・focus・disabled状態）が実装されているか
4. **ブラウザ表示のスクリーンショット** を撮影し、Figmaカンプと並べて差異を確認する
5. 差異があれば `logs/error-report.md` に記録し、Error Analyzerへ引き渡す

---

## Error Analyzerのレポートフォーマット

`logs/error-report.md` に以下の形式で記録する。

```markdown
## エラーレポート — [日時]

### 対象ファイル
- src/components/ComponentA.tsx

### 症状
ボタンのpadding-topがFigmaカンプ（16px）と異なり8pxになっている。

### 原因
Tailwindのデフォルトクラス `py-2` を使用したため。デザイントークンの `spacing-4` に対応するクラスの指定が必要だった。

### 修正方針
`py-2` → `py-4` に変更。またはデザイントークンをCSS変数として定義し直す。

### 修正担当
Fix Coder Agent
```

---

## スクリーンショット確認フロー（全エージェント共通）

修正後は以下の手順を必ず実行する。

1. 以下のコマンドでSP/PC両方のスクリーンショットを撮影する

```bash
# yarn screenshot <URL> <名前>
yarn screenshot http://localhost:8888 front-page
yarn screenshot http://localhost:8888/about page-about
```

2. キャプチャは `logs/screenshots/<名前>-<日時>-sp.png` / `-pc.png` に自動保存される
3. Figmaカンプ画像と目視比較
4. 差異があれば再修正 → 再スクリーンショット → 確認のループ
5. 問題なければ `task-manifest.json` のstatusを `done` に更新

---

## コーディング規則

> 詳細は **`CODING_RULES.md`** を参照すること。
> コーディング担当・Fix Coder・Reviewer は作業前に必ず読む。

### 技術スタック（概要）

| 項目 | 採用技術 |
|---|---|
| ビルド環境 | Vite + WP env |
| CSS設計 | FLOCSS |
| CSSプリプロセッサ | Sass / SCSS |
| JavaScript | jQuery（3.6.4） + Vanilla JS |
| ライブラリ | Swiper@8、jquery.inview |
| フォント | Noto Sans JP / Oswald / Roboto（Google Fonts） |
| アイコン | Font Awesome 6.5.1 |
| テンプレート | WordPress（PHP） |

---

### ディレクトリ構成

```
src/
  styles/
    foundation/
      _reset.scss       # Modern CSS Reset ベース
      _variables.scss   # 変数（色・フォント・ブレークポイント・mixin）
      _base.scss        # html / body / a / img など基本スタイル
    layout/
      _header.scss      # l-header
      _footer.scss      # l-footer
      _breadcrumb.scss  # l-breadcrumb
      _two-column.scss  # l-two-column（サイドバーレイアウト）
      _section.scss     # l-about / l-service / l-works / l-news 等
    object/
      component/
        _btn.scss        # c-btn（バリエーション含む）
        _category.scss   # c-category
        _date.scss       # c-date
        _sns.scss        # c-sns__list
        _sub-mv.scss     # c-sub-mv（サブページ共通MV）
        _news-item.scss  # c-news-item
        _works-item.scss # c-works-item
        _aside-menu.scss # c-aside-menu
        _section-title.scss # c-section-title
        _fadeUp.scss     # js-fadeUp__* アニメーション定義
      project/
        _header.scss     # p-header（ハンバーガー含む）
        _mv.scss         # p-mv（トップMV・Swiper）
        _about.scss      # p-about-list
        _service.scss    # p-service-list
        _works.scss      # p-works / p-works-detail
        _news.scss       # p-news / p-news-detail
        _contact.scss    # p-contact / p-sub-contact
        _footer.scss     # p-footer
        _breadcrumb.scss # p-breadcrumb
        _404.scss        # p-404
      utility/
        _utility.scss    # u-underline__black / u-underline__white / u-bg__gray
    style.scss            # 全ファイルの @use / @forward エントリーポイント
  js/
    modules/
      swiper.js          # Swiper初期化
      hamburger.js       # ハンバーガーメニュー
      fadeUp.js          # inviewアニメーション
      truncate.js        # 文字数制限・省略
      smooth-scroll.js   # スムーススクロール
      tel-disable.js     # 電話ボタンPC無効化
    script.js            # エントリーポイント（各モジュールをまとめる）
```

---

### FLOCSSクラス命名規則

このプロジェクトで使われているプレフィックスと実例。

| レイヤー | プレフィックス | 実例 |
|---|---|---|
| Layout | `l-` | `l-header` `l-footer` `l-breadcrumb` `l-two-column` |
| Component | `c-` | `c-btn` `c-category` `c-date` `c-sns__list` `c-sub-mv` |
| Project | `p-` | `p-header` `p-mv` `p-about-list` `p-footer` `p-contact` |
| Utility | `u-` | `u-underline__black` `u-underline__white` `u-bg__gray` |
| JavaScript用 | `js-` | `js-hamburger` `js-drawer` `js-mv-swiper` `js-fadeUp__bottom` |
| 状態変化 | `is-` | `is-open` `is-inview` |

**命名ルール：**
- Element は `__`（アンダースコア2つ）：`p-header__inner` `c-btn__icon`
- Modifier は `--`（ハイフン2つ）：`c-btn--prev` `c-category--news` `l-breadcrumb--detail`
- 複数クラスを重ねる場合はLayoutとProjectを併記する（実例：`class="p-header l-header"`）
- ケバブケース統一（`p-about-list__item-title`）

---

### `js-` クラスの扱い（重要）

`js-` クラスは **JavaScriptのフック専用** で、CSSスタイルを直接当てない。

**ただしこのプロジェクト固有の例外：**
`js-fadeUp__bottom` などアニメーション用クラスはCSSで初期状態・アニメーション定義を持つ。これはinviewライブラリとの連携のためであり、意図的な例外として認める。

```scss
// OK（アニメーション定義は例外として許可）
.js-fadeUp__bottom {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s, transform 0.6s;

  &.is-inview {
    opacity: 1;
    transform: translateY(0);
  }
}

// NG（通常のスタイルをjs-クラスに当てる）
.js-hamburger {
  background-color: #000; // ← これは p-header__hamburger に書くべき
}
```

---

### `is-` クラスの扱い

`is-` クラス単体ではスタイルを持たず、必ず親クラスと組み合わせる。

```scss
// OK
.p-header__hamburger.is-open span { ... }
.js-fadeUp__bottom.is-inview { ... }
.is-inview.delay { transition-delay: 0.9s; } // delayとの組み合わせも可

// NG
.is-open { display: block; } // 単体定義は禁止
```

---

### SCSS変数・mixin定義

`_variables.scss` に以下を定義して全ファイルで使用する。

```scss
@use 'sass:math';

// ===== ブレークポイント =====
$bp-sp:  767px;
$bp-tab: 1150px;

// ===== 色 =====
$color-black:   #000;
$color-white:   #fff;
$color-gray:    #f5f5f5;
$color-accent:  #e60012; // プロジェクトに合わせて変更

// ===== フォント =====
$font-base: 'Noto Sans JP', 'Oswald', 'Roboto', sans-serif;
$font-size-base: 16px;

// ===== rem変換mixin =====
// html font-size: 16px 基準
@function rem($px) {
  @return math.div($px, 16) * 1rem;
}

// ===== vw変換mixin =====
@function vw($px, $base: 375) {
  @return math.div($px, $base) * 100vw;
}

// ===== メディアクエリ =====
@mixin mq-sp {
  @media screen and (max-width: $bp-sp) { @content; }
}
@mixin mq-tab {
  @media screen and (max-width: $bp-tab) { @content; }
}
```

**SCSS記述ルール：**
- スペーシングや font-size は `rem()` 関数を使う（マジックナンバー禁止）
- SPのfont-sizeは `vw()` 関数を使う
- ネストは **3階層まで**。`&` を活用する
- `@extend` 禁止。`@mixin` を使う
- `!important` は `u-` クラス以外では使用禁止

```scss
// プロパティ記述順（ポジション → ボックス → テキスト → 装飾）
.c-btn {
  // ポジション
  position: relative;
  z-index: 1;

  // ボックス
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: rem(240);
  padding: rem(16) rem(24);

  // テキスト
  font-size: rem(14);
  font-weight: 700;
  color: $color-white;
  text-align: center;
  text-decoration: none;
  letter-spacing: 0.1em;

  // 装飾
  background-color: $color-black;
  border: 1px solid $color-black;
  cursor: pointer;
  transition: opacity 0.3s;

  // 疑似要素・状態
  &::before { ... }
  &:hover { ... }

  // Modifier
  &--prev { ... }
  &--works-detail { ... }
}
```

---

### JavaScript（jQuery）記述ルール

このプロジェクトはjQuery 3.6.4を使用する。

```
js/
  modules/
    swiper.js
    hamburger.js
    fadeUp.js
    truncate.js
    smooth-scroll.js
    tel-disable.js
  script.js   # jQuery(function($) { } でラップしてまとめる
```

**記述ルール：**
- `jQuery(function($) { ... })` でラップする（`$(document).ready()` と同義）
- `const` / `let` のみ使用。`var` は使用禁止
- セミコロンあり、シングルクォート統一
- DOM操作は `js-` クラスで行い、`p-` `c-` クラスはJSで操作しない
- イベントは `$(...).on('event', handler)` で登録する（`onclick属性` 禁止）
- アロー関数を使う

```js
// script.js の基本構造
jQuery(function ($) {
  // ===== Swiper初期化 =====
  new Swiper('.js-mv-swiper', {
    direction: 'vertical',
    loop: true,
    speed: 2000,
    autoplay: { delay: 4000, disableOnInteraction: false },
  });

  // ===== ハンバーガーメニュー =====
  $('.js-hamburger').on('click', function () {
    $(this).toggleClass('is-open');
    $('.js-drawer').fadeToggle();
  });

  // ===== フェードアップ =====
  $('.js-fadeUp__right, .js-fadeUp__left, .js-fadeUp__top, .js-fadeUp__bottom')
    .on('inview', function () {
      $(this).addClass('is-inview');
    });
});
```

---

### HTML記述ルール

実際のHTMLファイルに合わせたルール。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>ページタイトル | ExciteCode Automobile</title>
    <link rel="icon" href="images/common/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="./css/style.css" />
    <!-- 外部ライブラリ（Swiper・Google Fonts・Font Awesome）-->
  </head>
```

**HTMLルール：**
- インデントはスペース2つ
- 属性順：`class` → `id` → `type` → `src/href` → `alt` → その他
- 自己終了タグは `/` をつける（`<meta />` `<link />` `<img />`）
- `alt` 属性は必須。装飾目的の画像は `alt=""`
- `<picture>` + `<source>` でレスポンシブ画像を実装する（SP/PC切り替え）
- `768px以上` はPC用、`それ以外` はSP用の画像を使う
- ハンバーガーボタンには `aria-label="メニューを開く"` を付与する
- `<button>` には `type="button"` を明示する（submit誤爆防止）

```html
<!-- レスポンシブ画像の書き方（このプロジェクトの標準） -->
<picture>
  <source
    srcset="./images/common/hero.png"
    media="(min-width: 768px)"
    type="image/jpg"
  />
  <img src="./images/common/hero-sp.png" alt="画像の説明" />
</picture>

<!-- ボタンの書き方 -->
<button class="p-header__hamburger js-hamburger" type="button" aria-label="メニューを開く">
  <span></span>
  <span></span>
  <span></span>
</button>
```

---

### 外部ライブラリの読み込み順（JS）

```html
<!-- bodyの閉じタグ直前に記述 -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"></script>
<script src="./js/jquery.inview.min.js"></script>
<script src="./js/script.js"></script>
```

読み込み順は変更しない。jQuery → Swiper → inview → script.js の順を守る。

---

### ファイル命名規則

| 種類 | 命名規則 | 実例 |
|---|---|---|
| SCSSファイル | `_` 始まり・ケバブケース | `_btn.scss` `_sub-mv.scss` |
| JSファイル | ケバブケース | `smooth-scroll.js` |
| 画像ファイル | ケバブケース・SP用は末尾に `_SP` または `-sp` | `hero.png` `hero-sp.png` `works-detail__SP.png` |
| PHPテンプレート | ケバブケース | `template-top.php` |

---

### Reviewerのチェックリスト

- [ ] FLOCSSのプレフィックスが正しく使われているか（`l-` `c-` `p-` `u-` `js-` `is-`）
- [ ] `js-` アニメーション系クラス以外にCSSが当たっていないか
- [ ] `is-` クラスが単体でスタイルを持っていないか
- [ ] スペーシング・font-sizeに `rem()` 関数が使われているか（マジックナンバーがないか）
- [ ] SCSSのネストが3階層以内か
- [ ] `var` `@extend` `!important`（`u-` 以外）が使われていないか
- [ ] `onclick属性` が使われていないか
- [ ] `<picture>` + `<source>` でSP/PC画像が切り替わっているか
- [ ] `alt` 属性がすべての `<img>` に設定されているか
- [ ] JSの読み込み順が正しいか（jQuery → Swiper → inview → script.js）
- [ ] `<button>` に `type="button"` が付いているか

---

## Orchestratorの全体フロー

```
[Figma MCP] デザインカンプ取得
    ↓
[Orchestrator] タスク分解 → task-manifest.json 生成
    ↓
[Coder A / B / C] 並列実装（各自の担当範囲のみ）
    ↓（全員done後）
[Reviewer] コード＋スクリーンショットでチェック
    ↓
  エラーなし → 完了
  エラーあり → [Error Analyzer] 原因解明 → [Fix Coder] 修正 → [Reviewer] 再チェック
              （最大3回リトライ）
```