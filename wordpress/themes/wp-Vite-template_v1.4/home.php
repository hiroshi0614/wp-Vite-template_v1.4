<?php get_header(); ?>
<main>
  <section class="p-page-hero">
    <div class="p-page-hero__img">
      <img
        src="<?php echo esc_url(get_theme_file_uri('/assets/images/blog/headline-blog-list.webp')); ?>"
        alt=""
        width="1080"
        height="400"
        loading="lazy"
      />
    </div>
    <div class="p-page-hero__overlay"></div>
    <h1 class="p-page-hero__title">ブログ</h1>
  </section>

  <nav class="p-breadcrumb" aria-label="パンくずリスト">
    <div class="l-inner">
      <ol class="p-breadcrumb__list">
        <li>
          <a href="<?php echo esc_url(home_url('/')); ?>" class="p-breadcrumb__link">ホーム</a>
        </li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><span class="p-breadcrumb__current" aria-current="page">ブログ</span></li>
      </ol>
    </div>
  </nav>

  <div class="l-blog">
    <div class="l-inner">
      <h2 class="p-blog__heading">ブログ一覧</h2>
      <?php if (have_posts()): ?>
        <ul class="p-blog__list">
          <?php while (have_posts()): the_post(); ?>
            <li class="p-blog__item">
              <a href="<?php the_permalink(); ?>" class="p-blog__item-link">
                <div class="p-blog__item-img">
                  <?php if (has_post_thumbnail()): ?>
                    <?php the_post_thumbnail('medium_large', ['loading' => 'lazy']); ?>
                  <?php else: ?>
                    <img src="<?php echo esc_url(get_theme_file_uri('/assets/images/top/blog01.webp')); ?>" alt="" width="300" height="200" loading="lazy" />
                  <?php endif; ?>
                </div>
                <div class="p-blog__item-body">
                  <?php
                    $category = get_the_category();
                    if (!empty($category)):
                  ?>
                    <span class="p-blog__item-cat"><?php echo esc_html($category[0]->name); ?></span>
                  <?php endif; ?>
                  <time class="p-blog__item-date" datetime="<?php echo esc_attr(get_the_date('Y-m-d')); ?>"><?php echo esc_html(get_the_date('Y.m.d')); ?></time>
                  <p class="p-blog__item-title"><?php the_title(); ?></p>
                  <p class="p-blog__item-excerpt"><?php echo esc_html(wp_trim_words(get_the_excerpt(), 60, '...')); ?></p>
                </div>
              </a>
            </li>
          <?php endwhile; ?>
        </ul>
        <?php get_template_part('template-parts/pagination'); ?>
        <div class="p-blog__cta">
          <a href="<?php echo esc_url(home_url('/contact/')); ?>" class="c-btn">お問い合わせ</a>
        </div>
      <?php else: ?>
        <p class="p-blog__empty">記事が投稿されていません。</p>
      <?php endif; ?>
    </div>
  </div>
</main>
<?php get_footer(); ?>
