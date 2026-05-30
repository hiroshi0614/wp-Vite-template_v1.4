<?php get_header(); ?>
<main>
  <?php while (have_posts()): the_post(); ?>
  <nav class="p-breadcrumb" aria-label="パンくずリスト">
    <div class="l-inner">
      <ol class="p-breadcrumb__list">
        <li><a href="<?php echo esc_url(home_url('/')); ?>" class="p-breadcrumb__link">ホーム</a></li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><a href="<?php echo esc_url(get_post_type_archive_link('result')); ?>" class="p-breadcrumb__link">卒業実績</a></li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><span class="p-breadcrumb__current"><?php the_title(); ?></span></li>
      </ol>
    </div>
  </nav>

  <article class="p-single" itemscope itemtype="https://schema.org/Article">
    <div class="l-inner p-single__inner">
      <?php get_template_part('template-parts/single/header'); ?>

      <?php
        if (function_exists('get_field')) {
          $profession  = get_field('profession');
          $genre       = get_field('genre');
          $achievement = get_field('achievement');
          $sns_url     = get_field('sns_url');

          if ($profession || $genre || $achievement || $sns_url):
      ?>
        <table class="p-result-detail__table">
          <tbody>
            <?php if ($profession): ?>
              <tr>
                <th class="p-result-detail__th">職業</th>
                <td class="p-result-detail__td"><?php echo esc_html($profession); ?></td>
              </tr>
            <?php endif; ?>
            <?php if ($genre): ?>
              <tr>
                <th class="p-result-detail__th">ジャンル</th>
                <td class="p-result-detail__td"><?php echo esc_html($genre); ?></td>
              </tr>
            <?php endif; ?>
            <?php if ($achievement): ?>
              <tr>
                <th class="p-result-detail__th">実績</th>
                <td class="p-result-detail__td"><?php echo esc_html($achievement); ?></td>
              </tr>
            <?php endif; ?>
            <?php if ($sns_url): ?>
              <tr>
                <th class="p-result-detail__th">SNS</th>
                <td class="p-result-detail__td">
                  <a href="<?php echo esc_url($sns_url); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($sns_url); ?></a>
                </td>
              </tr>
            <?php endif; ?>
          </tbody>
        </table>
      <?php
          endif;
        }
      ?>

      <?php get_template_part('template-parts/single/body'); ?>
      <?php get_template_part('template-parts/single/navigation'); ?>

      <?php
        $related_results = new WP_Query([
          'post_type'      => 'result',
          'posts_per_page' => 3,
          'post_status'    => 'publish',
          'post__not_in'   => [get_the_ID()],
          'orderby'        => 'date',
          'order'          => 'DESC',
        ]);
        if ($related_results->have_posts()):
      ?>
        <section class="p-result-related">
          <h2 class="p-result-related__title">関連記事</h2>
          <div class="p-result-related__list">
            <?php while ($related_results->have_posts()): $related_results->the_post(); ?>
              <article class="p-result-related__item">
                <a href="<?php the_permalink(); ?>" class="p-result-related__link">
                  <div class="p-result-related__img">
                    <?php
                      $related_genre = function_exists('get_field') ? get_field('genre', get_the_ID()) : '';
                      if ($related_genre):
                    ?>
                      <span class="p-result-related__cat"><?php echo esc_html($related_genre); ?></span>
                    <?php endif; ?>
                    <?php if (has_post_thumbnail()): ?>
                      <?php the_post_thumbnail('medium_large', ['loading' => 'lazy', 'alt' => esc_attr(get_the_title())]); ?>
                    <?php else: ?>
                      <img src="<?php echo esc_url(get_theme_file_uri('/assets/images/top/FV-sp.webp')); ?>" alt="" width="400" height="400" loading="lazy" />
                    <?php endif; ?>
                  </div>
                  <div class="p-result-related__body">
                    <p class="p-result-related__item-title"><?php the_title(); ?></p>
                    <time class="p-result-related__date" datetime="<?php echo esc_attr(get_the_date('Y-m-d')); ?>"><?php echo esc_html(get_the_date('Y.m.d')); ?></time>
                  </div>
                </a>
              </article>
            <?php endwhile; wp_reset_postdata(); ?>
          </div>
        </section>
      <?php endif; ?>

      <div class="p-single__back">
        <a href="<?php echo esc_url(get_post_type_archive_link('result') ?: home_url('/result/')); ?>" class="c-btn">卒業実績一覧へ戻る</a>
      </div>
    </div>
  </article>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>
