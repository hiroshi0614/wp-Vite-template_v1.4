<?php get_header(); ?>
<main>
  <?php while (have_posts()): the_post(); ?>
  <nav class="p-breadcrumb" aria-label="パンくずリスト">
    <div class="l-inner">
      <ol class="p-breadcrumb__list">
        <li><a href="<?php echo esc_url(home_url('/')); ?>" class="p-breadcrumb__link">ホーム</a></li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><a href="<?php echo esc_url(home_url('/news')); ?>" class="p-breadcrumb__link">ニュース</a></li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><span class="p-breadcrumb__current"><?php the_title(); ?></span></li>
      </ol>
    </div>
  </nav>

  <article class="p-single" itemscope itemtype="https://schema.org/Article">
    <div class="l-inner p-single__inner">
      <?php get_template_part('template-parts/single/header'); ?>
      <?php get_template_part('template-parts/single/body'); ?>
      <?php get_template_part('template-parts/single/navigation'); ?>
      <div class="p-single__back">
        <a href="<?php echo esc_url(home_url('/news')); ?>" class="c-btn">ニュース一覧へ戻る</a>
      </div>
    </div>
  </article>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>
