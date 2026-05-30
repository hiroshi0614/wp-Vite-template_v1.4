<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <?php if (is_404()) : ?>
  <meta http-equiv="refresh" content=" 5; url=<?php echo esc_url(home_url("")); ?>">
  <?php endif; ?>
  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
  <?php wp_body_open(); ?>
  <header class="p-header l-header">
    <div class="p-header__inner">

      <?php if(is_front_page()): ?>
      <h1 class="p-header__logo">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>">
          <picture class="p-header__logo-img">
            <source srcset="<?php echo esc_url(get_theme_file_uri("/assets/images/common/logo.svg")); ?>"
              media="(min-width: 768px)" type="image/svg+xml" />
            <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/common/logo-sp.svg")); ?>" alt="きたむらミュージックスクール" width="120" height="40" />
          </picture>
        </a>
      </h1>
      <?php else: ?>
      <div class="p-header__logo">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>">
          <picture class="p-header__logo-img">
            <source srcset="<?php echo esc_url(get_theme_file_uri("/assets/images/common/logo.svg")); ?>"
              media="(min-width: 768px)" type="image/svg+xml" />
            <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/common/logo-sp.svg")); ?>" alt="きたむらミュージックスクール" width="120" height="40" />
          </picture>
        </a>
      </div>
      <?php endif; ?>
      <nav class="p-header__nav">
        <ul class="p-header__nav-list">
          <li class="p-header__nav-item u-underline__black">
            <a href="<?php echo esc_url( home_url( '/about' ) ); ?>">料金</a>
          </li>
          <li class="p-header__nav-item u-underline__black">
            <a href="<?php echo esc_url( home_url( '/blog' ) ); ?>">ブログ</a>
          </li>
          <li class="p-header__nav-item u-underline__black">
            <a href="<?php echo esc_url( home_url( '/result' ) ); ?>">卒業実績</a>
          </li>
          <li class="p-header__nav-item p-header__nav-item--contact u-underline__white">
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">
              お問い合わせ
            </a>
          </li>
        </ul>
      </nav>
      <button class="p-header__hamburger js-hamburger" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="js-drawer">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div id="js-drawer" class="p-header__drawer js-drawer" aria-hidden="true">
        <nav class="p-header__drawer-nav">
          <ul class="p-header__drawer-list">
            <li class="p-header__drawer-item">
              <a href="<?php echo esc_url( home_url( '/about' ) ); ?>">料金</a>
            </li>
            <li class="p-header__drawer-item">
              <a href="<?php echo esc_url( home_url( '/blog' ) ); ?>">ブログ</a>
            </li>
            <li class="p-header__drawer-item">
              <a href="<?php echo esc_url( home_url( '/result' ) ); ?>">卒業実績</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>