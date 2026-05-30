<?php get_header(); ?>
<main>
  <section class="p-error-hero">
    <img
      src="<?php echo esc_url(get_theme_file_uri('/assets/images/404/headline-404.webp')); ?>"
      alt=""
      width="1080"
      height="400"
      class="p-error-hero__img"
    />
    <div class="p-error-hero__overlay"></div>
    <h1 class="p-error-hero__text">404 not found</h1>
  </section>

  <section class="p-error">
    <div class="l-inner">
      <p class="p-error__lead">申し訳ございませんが、お探しのページが見つかりませんでした。</p>
      <p class="p-error__body">
        お探しのページは一時的に表示ができない状態にあるか、<br>
        移動または削除された可能性があります。
      </p>
      <p class="p-error__cta">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="c-btn">ホームへ戻る</a>
      </p>
    </div>
  </section>
</main>
<?php get_footer(); ?>
