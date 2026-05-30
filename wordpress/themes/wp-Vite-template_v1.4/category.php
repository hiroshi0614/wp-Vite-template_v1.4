<?php get_header(); ?>
<main>
  <section class="p-archive">
    <div class="l-inner p-archive__inner">
      <div class="p-archive__header">
        <h1 class="p-archive__title c-section-title"><?php single_cat_title(); ?></h1>
        <?php if (category_description()): ?>
          <div class="p-archive__description"><?php echo wp_kses_post(category_description()); ?></div>
        <?php endif; ?>
      </div>
      <?php get_template_part('template-parts/archive/archive-list'); ?>
    </div>
  </section>
</main>
<?php get_footer(); ?>
