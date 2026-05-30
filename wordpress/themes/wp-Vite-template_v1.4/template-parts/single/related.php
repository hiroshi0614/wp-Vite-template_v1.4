<?php
/**
 * シングルページの関連記事
 * single.php から呼び出される
 */
$post_type = get_post_type();

$related_posts = [];

if ($post_type === "post") {
  // ACFフィールド優先
  if (function_exists("get_field")) {
    $acf_related = get_field("post_related_posts");
    if (!empty($acf_related) && is_array($acf_related)) {
      $related_posts = array_slice($acf_related, 0, 3);
    }
  }

  // ACF未設定の場合は同カテゴリの記事で代替
  if (empty($related_posts)) {
    $cats    = get_the_category();
    $cat_ids = $cats ? array_map(fn($c) => $c->term_id, $cats) : [];

    if (!empty($cat_ids)) {
      $same_cat = get_posts([
        'numberposts'  => 3,
        'post_status'  => 'publish',
        'post__not_in' => [get_the_ID()],
        'category__in' => $cat_ids,
        'orderby'      => 'date',
        'order'        => 'DESC',
      ]);
      $related_posts = $same_cat;
    }

    // 3件未満なら残りを最新記事で補完
    if (count($related_posts) < 3) {
      $exclude_ids = array_merge([get_the_ID()], array_map(fn($p) => $p->ID, $related_posts));
      $fill = get_posts([
        'numberposts'  => 3 - count($related_posts),
        'post_status'  => 'publish',
        'post__not_in' => $exclude_ids,
        'orderby'      => 'date',
        'order'        => 'DESC',
      ]);
      $related_posts = array_merge($related_posts, $fill);
    }
  }
}

if (empty($related_posts)): return; endif;
?>
<section class="p-single__related">
  <h2 class="p-single__related-title">関連記事</h2>
  <div class="p-single__related-list">
    <?php foreach ($related_posts as $related_post):
      $rid    = is_object($related_post) ? $related_post->ID : (int) $related_post;
      $rtitle = get_the_title($rid);
      $rurl   = get_permalink($rid);
      $rdate  = get_the_date("Y.m.d", $rid);
      $rthumb = get_the_post_thumbnail_url($rid, "medium");
    ?>
      <article class="p-single__related-item">
        <a href="<?php echo esc_url($rurl); ?>" class="p-single__related-link">
          <?php if ($rthumb): ?>
            <div class="p-single__related-thumbnail">
              <img src="<?php echo esc_url($rthumb); ?>" loading="lazy" alt="<?php echo esc_attr($rtitle); ?>">
            </div>
          <?php endif; ?>
          <div class="p-single__related-content">
            <time class="p-single__related-date"><?php echo esc_html($rdate); ?></time>
            <h3 class="p-single__related-item-title"><?php echo esc_html($rtitle); ?></h3>
          </div>
        </a>
      </article>
    <?php endforeach; ?>
  </div>
</section>
