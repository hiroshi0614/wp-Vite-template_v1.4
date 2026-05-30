# Claude AI との協働コーディング ワークフロー

このドキュメントは、Claude Code を使ってこのプロジェクト（および同構成の次回プロジェクト）を
効率的に進めるための実践ガイドです。

---

## 1. プロジェクト起動時のチェックリスト

```bash
# 1. WordPress 環境の起動
yarn wp-start

# 2. ビルド済みCSSが適用されているか確認
yarn build:wp

# 3. ブラウザで表示確認
open http://localhost:8888
```

起動後、必ず `http://localhost:8888` が表示されることを確認してから作業を開始する。

---

## 2. Figmaカンプ実装の依頼方法

### 2-1. 新規ページを実装してもらう場合

```
「[ページ名]ページを実装してください。
Figmaカンプは figma/[ファイル名].png です。
対応するPHPテンプレートは [ファイル名].php、SCSSは _p-[ページ名].scss です。」
```

**ポイント：**
- Figmaファイルは事前に `figma/` ディレクトリにPNG形式で保存しておく
- カンプにSP版がある場合は `figma/[ファイル名]_sp.png` も保存する
- 「スクリーンショットで確認してほしい」と伝えると自動で比較・修正してくれる

### 2-2. 既存ページの修正を依頼する場合

```
「サイトのスクリーンショットを撮影し、Figmaカンプと照らし合わせてズレを修正してください。
90%以上の一致率になるまで繰り返してください。許可不要で進めてください。」
```

---

## 3. Figmaカンプの準備方法

### 保存場所と命名規則

```
figma/
  top.png              # TOPページ（PC）
  top_sp.png           # TOPページ（SP）
  blog_list.png        # ブログ一覧（PC）
  blog_list_sp.png     # ブログ一覧（SP）
  blog_details.png     # ブログ詳細（PC）
  blog_details_sp.png  # ブログ詳細（SP）
  result_list.png      # 卒業実績一覧
  result_details.png   # 卒業実績詳細
  [ページ名].png       # その他ページ
```

### Figmaからエクスポートする手順

1. Figmaでフレームを選択
2. 右パネル「Export」→ PNG形式、2x 推奨
3. `figma/` ディレクトリに保存

---

## 4. スクリーンショット撮影コマンド

```bash
# 基本形
yarn screenshot <URL> <保存名>

# 各ページの例
yarn screenshot http://localhost:8888/ top
yarn screenshot http://localhost:8888/blog/ blog-list
yarn screenshot http://localhost:8888/blog4/ blog-single        # 実在するスラッグに変更
yarn screenshot http://localhost:8888/result/ result-archive
yarn screenshot "http://localhost:8888/result/[スラッグ]/" result-single

# 投稿のスラッグを調べる
curl -s "http://localhost:8888/wp-json/wp/v2/posts?per_page=3&_fields=id,slug,link"
curl -s "http://localhost:8888/wp-json/wp/v2/result?per_page=3&_fields=id,slug,link"
```

撮影結果は `logs/screenshots/<名前>-<日時>-pc.png` / `-sp.png` に保存される。

---

## 5. ページ別：実装で注意すること

### TOPページ (`front-page.php`)

| 注意点 | 詳細 |
|--------|------|
| ブログ取得 | `have_posts()` は静的フロントページで使えない → `WP_Query` を使う |
| ブログレイアウト | `l-blog l-blog--top` クラスで3列グリッドになる |
| カスタム投稿 | `result` 投稿は `WP_Query(['post_type' => 'result'])` で取得 |
| Splide | `js-result-splide` クラスでスライダー初期化される |

### ブログ詳細 (`single.php`)

| 注意点 | 詳細 |
|--------|------|
| SNSボタン | アイキャッチ画像の「後」に表示（`template-parts/single/body.php` 内） |
| サイドバー順序 | メールマガジン → バナー広告 → 検索 → おすすめ → カテゴリー |
| 関連記事 | `template-parts/single/related.php`（ACF → 同カテゴリ → 最新のフォールバック付き） |

### 卒業実績一覧 (`archive-result.php`)

| 注意点 | 詳細 |
|--------|------|
| グリッド列数 | PC: 2列（`repeat(2, 1fr)`）。3列ではない |
| カテゴリーバッジ | ACFの `genre` フィールドを使う |

### 卒業実績詳細 (`single-result.php`)

| 注意点 | 詳細 |
|--------|------|
| 関連記事 | 縦リスト（画像左・テキスト右）。ブログ詳細と異なる |
| プロフィール表 | ACFフィールド（`profession`, `genre`, `achievement`, `sns_url`）が空なら非表示 |
| ナビ共有 | `template-parts/single/navigation.php` をブログ詳細と共用 |

---

## 6. SCSSを書くときのルール

このプロジェクト固有のルール（CODING_RULES.md の補足）。

```scss
/* ✅ このプロジェクトの書き方 */
font-size: calc(16 * var(--to-rem));
padding: calc(24 * var(--to-rem)) calc(32 * var(--to-rem));
gap: calc(16 * var(--to-rem));

/* ❌ 使わない */
font-size: rem(16);       /* rem()関数は使わない */
font-size: 1rem;          /* 直接remも使わない */
margin-top: 24px;         /* pxも使わない */
```

```scss
/* レスポンシブ */
.p-example {
  /* SP（デフォルト） */
  font-size: calc(14 * var(--to-rem));

  @include mq(md) {
    /* PC：768px以上 */
    font-size: calc(16 * var(--to-rem));
  }
}
```

### FLOCSSファイル配置

| スタイルの対象 | ファイル |
|---|---|
| TOPページ固有 | `src/assets/styles/projects/_p-front-page.scss` |
| ブログ一覧・TOP内ブログ | `src/assets/styles/layouts/_l-blog.scss` |
| ブログ詳細 | `src/assets/styles/projects/_p-single.scss` |
| 卒業実績 | `src/assets/styles/projects/_p-result.scss` |
| 卒業実績一覧 | `src/assets/styles/projects/_p-result-archive.scss` |
| 共通ボタン | `src/assets/styles/components/_c-btn.scss` |

---

## 7. よくある問題と解決策

### `have_posts()` がTOPページで動かない

**原因：** 静的フロントページでは `have_posts()` はページ自体を返す。  
**解決：** `WP_Query` で明示的に投稿を取得する。

```php
$blog_query = new WP_Query([
  'post_type'      => 'post',
  'posts_per_page' => 3,
  'post_status'    => 'publish',
  'orderby'        => 'date',
  'order'          => 'DESC',
]);
if ($blog_query->have_posts()): ...
```

### カスタム投稿のURLが文字化けしている

**原因：** 日本語スラッグがパーセントエンコードされている。  
**解決：** WP REST APIで正しいURLを取得してから使う。

```bash
curl -s "http://localhost:8888/wp-json/wp/v2/result?per_page=3&_fields=link"
```

### SCSSを修正してもブラウザに反映されない

**原因：** ビルドが古い。  
**解決：** `yarn build:wp` を実行してからブラウザをリロード。

### `get_template_part()` が期待通り動かない

**原因：** 引数のパスが `template-parts/` からの相対パス。  
**正しい形：**
```php
get_template_part('template-parts/single/header');   // ✅
get_template_part('/template-parts/single/header');  // ❌ 先頭スラッシュ不要
```

### ACFフィールドが表示されない

**原因：** テストデータにACF値が設定されていない（コードのバグではない）。  
**解決：** WordPress管理画面で対象投稿を開き、ACFフィールドに値を入力する。  
または `function_exists('get_field')` でガードしてフォールバック表示を実装。

---

## 8. 新規プロジェクトへの転用手順

このテンプレートを新規プロジェクトに使う場合の手順：

```bash
# 1. リポジトリをクローン
git clone [リポジトリURL] [新プロジェクト名]
cd [新プロジェクト名]

# 2. 依存パッケージのインストール
yarn

# 3. WordPress環境の初期化
yarn wp-start
yarn wp-init

# 4. ブラウザで確認
open http://localhost:8888
```

転用時に変更が必要な箇所：
- `package.json` の `name` フィールド
- `CLAUDE.md` 内のプロジェクト固有設定
- `figma/` ディレクトリに新しいカンプを配置
- `src/assets/styles/global/_variables.scss` のブランドカラー

---

## 9. Claude への効果的な指示パターン

### パターン1：全ページ一括レビュー（推奨）

```
「figmaディレクトリのすべてのカンプと現在のブラウザ表示を比較して、
ズレが大きい箇所を優先的に修正してください。
修正後はスクリーンショットで確認し、90%以上の一致率になるまで繰り返してください。
許可不要で進めてください。」
```

### パターン2：特定ページの実装

```
「figma/[ページ名].png のデザインカンプを実装してください。
- PHPテンプレート: [テンプレートファイル名]
- SCSSファイル: [SCSSファイル名]
実装後はスクリーンショットを撮ってFigmaと比較し、差異があれば修正してください。」
```

### パターン3：特定箇所の修正

```
「[ページ名]の[セクション名]部分が Figma と異なります。
ブラウザでは[現状]、Figmaでは[あるべき姿]になっています。
修正してスクリーンショットで確認してください。」
```

### ポイント

- 「許可不要で進めてください」と伝えると、確認待ちなしで連続作業してくれる
- 「スクリーンショットで確認してください」を毎回付けると視覚的な確認が行われる
- 大きな修正（PHPテンプレートの構造変更等）は作業前に確認を求めることもある

---

## 10. スクリーンショット保管・管理

```
logs/screenshots/
  [ページ名]-[日時]-pc.png  # PC幅（1280px）
  [ページ名]-[日時]-sp.png  # SP幅（375px）
```

日時が付くので過去の状態も残る。比較時は最新の `*-pc.png` を参照。  
大量に溜まったら古いものは削除して構わない（Figmaカンプは `figma/` に残る）。
