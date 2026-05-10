#!/bin/bash
# scripts/run-visual-checks.sh
#
# task-manifest.jsonを読み込み、doneになった全コンポーネントに対して
# visual-check.jsを実行する。Fix Coderとのループも管理する。
#
# 使い方:
#   bash scripts/run-visual-checks.sh
#
# 前提:
#   - figma/ ディレクトリにFigmaカンプPNGが保存されている
#     例: figma/ComponentA.png, figma/StyleSheet.png
#   - 開発サーバーが http://localhost:3000 で起動済み
#   - node, playwright, pixelmatch, pngjs がインストール済み

set -e

BASE_URL="http://localhost:3000"
MANIFEST="task-manifest.json"
MAX_RETRY=$(node -e "const m=require('./${MANIFEST}'); console.log(m.max_retry)")
REPORT="logs/error-report.md"

echo "==============================="
echo "  ビジュアル整合性チェック 開始"
echo "==============================="

# ログディレクトリ初期化
mkdir -p logs/screenshots

# エラーレポートのヘッダ
echo "# ビジュアルチェック レポート — $(date '+%Y-%m-%d %H:%M:%S')" > "$REPORT"
echo "" >> "$REPORT"

retry=0
has_error=true

while [ $retry -lt $MAX_RETRY ] && [ "$has_error" = true ]; do
  echo ""
  echo "--- チェック試行 $((retry + 1)) / $MAX_RETRY ---"
  has_error=false

  # task-manifest.jsonからdoneのタスクを取得して順にチェック
  components=$(node -e "
    const m = require('./${MANIFEST}');
    const done = Object.entries(m.tasks)
      .filter(([,v]) => v.status === 'done' || v.status === 'fixing')
      .map(([k]) => k);
    console.log(done.join('\n'));
  ")

  if [ -z "$components" ]; then
    echo "⚠️  チェック対象のdoneタスクがありません。Coderエージェントの完了を待ってください。"
    exit 1
  fi

  for component in $components; do
    figma_path="figma/${component}.png"
    url="${BASE_URL}"

    echo ""
    echo "🔍 チェック中: ${component}"

    if [ ! -f "$figma_path" ]; then
      echo "⚠️  Figmaカンプが見つかりません: ${figma_path}（スキップ）"
      continue
    fi

    # visual-check.jsを実行
    if node scripts/visual-check.js "$component" "$figma_path" "$url"; then
      echo "✅ ${component}: 問題なし"
    else
      echo "❌ ${component}: 差異あり → Fix Coder Agentに引き渡します"
      has_error=true

      # task-manifest.jsonのステータスをerrorに更新
      node -e "
        const fs = require('fs');
        const m = require('./${MANIFEST}');
        if (m.tasks['${component}']) {
          m.tasks['${component}'].status = 'error';
        }
        fs.writeFileSync('${MANIFEST}', JSON.stringify(m, null, 2));
      "
    fi
  done

  if [ "$has_error" = true ]; then
    retry=$((retry + 1))

    if [ $retry -ge $MAX_RETRY ]; then
      echo ""
      echo "==============================="
      echo "❌ 最大リトライ回数(${MAX_RETRY})に達しました。"
      echo "   手動確認が必要です: ${REPORT}"
      echo "==============================="
      exit 1
    fi

    echo ""
    echo "🔧 Fix Coder Agentを起動して修正を実行中..."
    # Fix Coder AgentをClaude Codeで起動
    claude --headless "
      logs/error-report.mdを読み込み、
      task-manifest.jsonでstatusがerrorになっているコンポーネントを確認し、
      エラー内容を元に該当ファイルを修正してください。
      修正後、task-manifest.jsonのstatusをfixingに更新してください。
    "

    # task-manifest.jsonのretry_countを更新
    node -e "
      const fs = require('fs');
      const m = require('./${MANIFEST}');
      m.retry_count = ${retry};
      fs.writeFileSync('${MANIFEST}', JSON.stringify(m, null, 2));
    "

    echo "✅ 修正完了。再チェックを実行します..."
  fi
done

if [ "$has_error" = false ]; then
  echo ""
  echo "==============================="
  echo "✅ 全コンポーネントのチェック完了"
  echo "   差異はありませんでした。"
  echo "==============================="
  exit 0
fi
