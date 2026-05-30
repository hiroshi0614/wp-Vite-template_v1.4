<?php get_header(); ?>
<?php while (have_posts()): the_post(); ?>
<main>
  <nav class="p-breadcrumb" aria-label="パンくずリスト">
    <div class="l-inner">
      <ol class="p-breadcrumb__list">
        <li><a href="<?php echo esc_url(home_url('/')); ?>" class="p-breadcrumb__link">ホーム</a></li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><a href="<?php echo esc_url(home_url('/blog')); ?>" class="p-breadcrumb__link">ブログ</a></li>
        <?php $cat = get_the_category(); if (!empty($cat)): ?>
          <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
          <li><a href="<?php echo esc_url(get_category_link($cat[0]->term_id)); ?>" class="p-breadcrumb__link"><?php echo esc_html($cat[0]->name); ?></a></li>
        <?php endif; ?>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><span class="p-breadcrumb__current"><?php the_title(); ?></span></li>
      </ol>
    </div>
  </nav>

  <div class="l-inner p-single-wrap">
    <article class="p-single p-single--post" itemscope itemtype="https://schema.org/Article">
      <?php get_template_part('template-parts/single/header'); ?>
      <?php get_template_part('template-parts/single/body'); ?>
      <?php get_template_part('template-parts/single/navigation'); ?>
      <?php get_template_part('template-parts/single/related'); ?>
      <div class="p-single__cta">
        <a href="<?php echo esc_url(home_url('/contact/')); ?>" class="c-btn">お問い合わせ</a>
      </div>
    </article>

    <aside class="p-single__sidebar">
      <div class="p-single__sidebar-block">
        <p class="p-single__sidebar-heading">最新メールマガジン</p>
        <div class="p-single__sidebar-magazine">
          <?php
            $magazine_img = function_exists('get_field') ? get_field('sidebar_magazine_image') : null;
            if ($magazine_img && is_array($magazine_img)):
          ?>
            <img src="<?php echo esc_url($magazine_img['url']); ?>" alt="<?php echo esc_attr($magazine_img['alt'] ?? '最新メールマガジン'); ?>" loading="lazy" class="p-single__sidebar-magazine-img" />
          <?php else: ?>
            <div class="p-single__sidebar-magazine-placeholder"></div>
          <?php endif; ?>
        </div>
      </div>

      <div class="p-single__sidebar-block">
        <p class="p-single__sidebar-heading">バナー広告</p>
        <div class="p-single__sidebar-banner">
          <?php
            $banner_img = function_exists('get_field') ? get_field('sidebar_banner_image') : null;
            if ($banner_img && is_array($banner_img)):
          ?>
            <img src="<?php echo esc_url($banner_img['url']); ?>" alt="<?php echo esc_attr($banner_img['alt'] ?? 'バナー広告'); ?>" loading="lazy" class="p-single__sidebar-banner-img" />
          <?php else: ?>
            <div class="p-single__sidebar-banner-placeholder"></div>
          <?php endif; ?>
        </div>
      </div>

      <div class="p-single__sidebar-block">
        <p class="p-single__sidebar-heading">ブログを検索</p>
        <?php get_search_form(); ?>
      </div>

      <div class="p-single__sidebar-block">
        <p class="p-single__sidebar-heading">おすすめの記事</p>
        <?php
          $recent = get_posts(['numberposts' => 4, 'post_status' => 'publish']);
          foreach ($recent as $rp):
            setup_postdata($rp);
        ?>
          <a href="<?php echo esc_url(get_permalink($rp->ID)); ?>" class="p-single__sidebar-item">
            <?php if (has_post_thumbnail($rp->ID)): ?>
              <div class="p-single__sidebar-thumb">
                <?php echo get_the_post_thumbnail($rp->ID, 'thumbnail', ['loading' => 'lazy', 'alt' => esc_attr(get_the_title($rp->ID))]); ?>
              </div>
            <?php endif; ?>
            <p class="p-single__sidebar-title"><?php echo esc_html(get_the_title($rp->ID)); ?></p>
          </a>
        <?php endforeach; wp_reset_postdata(); ?>
      </div>

      <div class="p-single__sidebar-block">
        <p class="p-single__sidebar-heading">カテゴリー</p>
        <ul class="p-single__sidebar-cats">
          <?php
            $cats = get_categories(['hide_empty' => false]);
            foreach ($cats as $cat):
          ?>
            <li>
              <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>">
                <?php echo esc_html($cat->name); ?>
              </a>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </aside>
  </div>
</main>
<?php endwhile; ?>
<?php get_footer(); ?>
