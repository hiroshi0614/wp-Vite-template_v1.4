# CLAUDE.md — マルチエージェント コーディングプロジェクト

---

## ⚠️ 最重要指示（全エージェント共通・必ず遵守）

デザインカンプ通りに実装できなかった箇所は、なぜ実装できなかったのか、**徹底的に原因をリサーチし、解明してください。**

原因が解明した後に修正を行ってください。修正については、原因が確認できた段階で承認を得る必要はなく、**修正はそのまま進めてください。**

**すべての修正項目について、修正後に必ずブラウザで該当箇所を表示し、スクリーンショットを撮って、修正が正しく反映されていることを自分で確認してください。確認して問題があれば、再度修正してください。**

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

1. `npx playwright screenshot` または `npx puppeteer` でブラウザキャプチャ
2. キャプチャを `logs/screenshots/[component名]-[日時].png` に保存
3. Figmaカンプ画像と目視比較
4. 差異があれば再修正 → 再スクリーンショット → 確認のループ
5. 問題なければ `task-manifest.json` のstatusを `done` に更新

---

## コーディング規則

> 詳細は **`doc/CODING_RULES.md`** を参照すること。
> コーディング担当・Fix Coder・Reviewer は作業前に必ず読む。

### 技術スタック（概要）

| 項目 | 採用技術 |
|---|---|
| ビルド環境 | Vite + WP env |
| CSS設計 | FLOCSS |
| CSSプリプロセッサ | Sass / SCSS |
| JavaScript | ES Modules（`"type": "module"`）|
| スライダー | Splide（`@splidejs/splide`）|
| 画像最適化 | PNG/JPEG → WebP 自動変換（sharp）|
| テンプレート | WordPress（PHP） |

---

### ディレクトリ構成

```
src/assets/
  styles/
    style.scss              # エントリーポイント（globでimport）
    foundation/
      _index.scss
      _reset.scss
      _variables.scss       # CSS変数・@font-face
      _breakpoints.scss     # $breakpoints・@mixin mq()
      _base.scss
    layouts/                # l- レイヤー
    components/             # c- レイヤー
    projects/               # p- レイヤー
    utilities/              # u- レイヤー
  js/
    script.js               # エントリーポイント
    _drawer.js
    _mv-slider.js
    _faq.js
    _viewport.js
    _works-filter.js
  images/

wordpress/themes/{THEME_NAME}/
  assets/
  acf-json/
  *.php
  style.css

scripts/
  auto-check.js             # Playwright自動チェック（node scripts/auto-check.js [URL]）
  visual-check.js           # Figmaカンプ vs ブラウザ差分チェック
  run-visual-checks.sh      # 全コンポーネント一括ビジュアルチェック
```

---

### FLOCSSクラス命名規則

| レイヤー | プレフィックス | 実例 |
|---|---|---|
| Layout | `l-` | `l-header` `l-footer` `l-breadcrumb` |
| Component | `c-` | `c-btn` `c-category` `c-date` |
| Project | `p-` | `p-header` `p-mv` `p-about-list` |
| Utility | `u-` | `u-underline__black` `u-bg__gray` |
| JavaScript用 | `js-` | `js-hamburger` `js-drawer` `js-splide` |
| 状態変化 | `is-` | `is-open` `is-inview` |

**命名ルール：**
- Element は `__`（アンダースコア2つ）：`p-header__inner`
- Modifier は `--`（ハイフン2つ）：`c-btn--prev`
- ケバブケース統一

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
