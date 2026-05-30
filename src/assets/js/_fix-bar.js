document.addEventListener('DOMContentLoaded', function () {
  // .js-fix-bar要素を全て取得
  const fixBars = document.querySelectorAll('.js-fix-bar');
  // メインビジュアル要素の取得
  const mv = document.querySelector('.p-mv');
  // フッター要素の取得
  const footer = document.querySelector('.p-footer');

  // デフォルトの下余白(px)
  const DEFAULT_BOTTOM = 20;
  // フッターとの隙間(px)
  const FOOTER_GAP = 0;

  // fixBarの下余白（--fix-bar-bottom）を更新
  function updateFixBarBottom(fixBar) {
    if (!footer) {
      fixBar.style.setProperty('--fix-bar-bottom', `${DEFAULT_BOTTOM}px`);
      return;
    }

    // フッターの上端のウィンドウ内位置を取得
    const footerTop = footer.getBoundingClientRect().top;
    // フッターとウィンドウの隙間を計算
    const minBottom = window.innerHeight - footerTop + FOOTER_GAP;
    // デフォルトと比較して大きい方を下余白値として決定
    const bottom = Math.max(DEFAULT_BOTTOM, minBottom);

    // CSS変数として下余白値を設定
    fixBar.style.setProperty('--fix-bar-bottom', `${bottom}px`);
  }

  // 全てのfixBarの下余白位置を更新
  function updateAllFixBarPositions() {
    fixBars.forEach(updateFixBarBottom);
  }

  // 各fixBarに「ページトップに戻る」イベントを設定
  fixBars.forEach(function (fixBar) {
    // .p-page-topボタンを取得
    const pageTopBtn = fixBar.querySelector('.p-page-top');
    if (!pageTopBtn) return;

    // ボタン押下時ページ先頭までスムーススクロール
    pageTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  });

  if (fixBars.length) {
    // パフォーマンス向上のためrequestAnimationFrameで処理を最適化
    let ticking = false;

    // スクロール・リサイズ時のコールバック（多重実行防止）
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateAllFixBarPositions();
        ticking = false;
      });
    }

    // スクロール・リサイズイベントにハンドラ登録
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // フッターサイズが変わった際にも再計算（ResizeObserverを使用可能な場合）
    if (footer && typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(onScrollOrResize);
      resizeObserver.observe(footer);
    }

    // 初期表示時に一度位置をセット
    updateAllFixBarPositions();
  }

  // メインビジュアルが存在、かつfixBarがある場合
  if (mv && fixBars.length) {
    // IntersectionObserverによりメインビジュアルの表示・非表示を監視
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        fixBars.forEach(function (fixBar) {
          if (entry.isIntersecting) {
            // メインビジュアルが画面内ならfixBar非表示
            fixBar.classList.remove('is-visible');
          } else {
            // 画面外ならfixBar表示
            fixBar.classList.add('is-visible');
            // 表示にともない下余白を更新
            updateFixBarBottom(fixBar);
          }
        });
      });
    });

    // メインビジュアル要素の監視開始
    observer.observe(mv);
  } else if (fixBars.length) {
    // メインビジュアルが無い場合は常にfixBarを表示
    fixBars.forEach(function (fixBar) {
      fixBar.classList.add('is-visible');
    });
  }
});
