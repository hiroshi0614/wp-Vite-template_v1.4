<?php get_header(); ?>
<main>
  <section class="p-page-hero">
    <div class="p-page-hero__img">
      <img
        src="<?php echo esc_url(get_theme_file_uri('/assets/images/contact/headline-contact-form.webp')); ?>"
        alt=""
        width="1080"
        height="400"
        loading="lazy"
      />
    </div>
    <div class="p-page-hero__overlay"></div>
    <h1 class="p-page-hero__title">お問い合わせ</h1>
  </section>

  <nav class="p-breadcrumb" aria-label="パンくずリスト">
    <div class="l-inner">
      <ol class="p-breadcrumb__list">
        <li>
          <a href="<?php echo esc_url(home_url('/')); ?>" class="p-breadcrumb__link">ホーム</a>
        </li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><span class="p-breadcrumb__current" aria-current="page">お問い合わせ</span></li>
      </ol>
    </div>
  </nav>

  <section class="p-contact">
    <div class="l-inner">
      <p class="p-contact__lead">
        各社に関するご質問・ご相談・資料請求は下記のフォームからお気軽にお問い合わせください。<br>
        通常3営業日以内にメールにてご連絡させていただきます。
      </p>
      <div class="p-contact__form p-form">
        <?php
          $cf7_id = '';
          if (function_exists('get_field')) {
            $cf7_id = get_field('contact_form_id');
          }
          if (empty($cf7_id) && class_exists('WPCF7_ContactForm')) {
            $forms = WPCF7_ContactForm::find(['title' => 'お問い合わせ']);
            if (!empty($forms)) {
              $cf7_id = $forms[0]->id();
            }
          }
          if (!empty($cf7_id)) {
            echo do_shortcode('[contact-form-7 id="' . esc_attr($cf7_id) . '"]');
          } else {
            echo '<p>フォームの設定をご確認ください。</p>';
          }
        ?>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
