<?php get_header(); ?>
<main>
  <section class="p-page-hero">
    <div class="p-page-hero__img">
      <img
        src="<?php echo esc_url(get_theme_file_uri('/assets/images/result/headline-result.webp')); ?>"
        alt=""
        width="1080"
        height="400"
        loading="lazy"
      />
    </div>
    <div class="p-page-hero__overlay"></div>
    <h1 class="p-page-hero__title">卒業実績</h1>
  </section>

  <nav class="p-breadcrumb" aria-label="パンくずリスト">
    <div class="l-inner">
      <ol class="p-breadcrumb__list">
        <li>
          <a href="<?php echo esc_url(home_url('/')); ?>" class="p-breadcrumb__link">ホーム</a>
        </li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><span class="p-breadcrumb__current" aria-current="page">卒業実績</span></li>
      </ol>
    </div>
  </nav>

  <div class="p-result-archive">
    <div class="l-inner">
      <h2 class="p-result-archive__heading">卒業実績一覧</h2>
      <?php if (have_posts()): ?>
        <ul class="p-result-archive__list">
          <?php while (have_posts()): the_post(); ?>
            <li>
              <a href="<?php the_permalink(); ?>" class="p-result-archive__link">
                <div class="p-result-archive__img">
                  <?php
                    $cats = get_the_terms(get_the_ID(), 'category');
                    if ($cats && !is_wp_error($cats)):
                  ?>
                    <span class="p-result-archive__cat"><?php echo esc_html($cats[0]->name); ?></span>
                  <?php endif; ?>
                  <?php if (has_post_thumbnail()): ?>
                    <?php the_post_thumbnail('medium_large', ['loading' => 'lazy', 'alt' => esc_attr(get_the_title())]); ?>
                  <?php else: ?>
                    <img src="<?php echo esc_url(get_theme_file_uri('/assets/images/top/FV-sp.webp')); ?>" alt="" width="400" height="400" loading="lazy" />
                  <?php endif; ?>
                </div>
                <div class="p-result-archive__body">
                  <p class="p-result-archive__title"><?php the_title(); ?></p>
                  <time class="p-result-archive__date" datetime="<?php echo esc_attr(get_the_date('Y-m-d')); ?>"><?php echo esc_html(get_the_date('Y.m.d')); ?></time>
                  <p class="p-result-archive__excerpt"><?php echo esc_html(wp_trim_words(get_the_excerpt(), 40, '...')); ?></p>
                </div>
              </a>
            </li>
          <?php endwhile; ?>
        </ul>
        <div class="p-result-archive__pagination">
          <?php get_template_part('template-parts/pagination'); ?>
        </div>
        <div class="p-result-archive__cta">
          <a href="<?php echo esc_url(home_url('/contact/')); ?>" class="c-btn">お問い合わせ</a>
        </div>
      <?php else: ?>
        <p class="p-result-archive__empty">まだ投稿がありません。</p>
      <?php endif; ?>
    </div>
  </div>
</main>
<?php get_footer(); ?>
