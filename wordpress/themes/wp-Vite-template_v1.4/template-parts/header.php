<header class="p-header l-header">
  <div class="p-header__inner">

    <?php if(is_front_page()): ?>
    <h1 class="p-header__logo">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>">
        <picture class="p-header__logo-img">
          <source srcset="<?php echo esc_url(get_theme_file_uri("/images/common/logo.svg")); ?>"
            media="(min-width: 768px)" type="image/svg+xml" />
          <!-- 幅768px以上なら表示 -->
          <img src="<?php echo esc_url(get_theme_file_uri("/images/common/logo-sp.svg")); ?>" /> <!-- それ以外で表示 -->
        </picture>
      </a>
      <span style="display:none;">kitashoo music school</span>
    </h1>
    <?php else: ?>
    <div class="p-header__logo">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>">
        <picture class="p-header__logo-img">
          <source srcset="<?php echo esc_url(get_theme_file_uri("/images/common/logo.svg")); ?>"
            media="(min-width: 768px)" type="image/svg+xml" />
          <!-- 幅768px以上なら表示 -->
          <img src="<?php echo esc_url(get_theme_file_uri("/images/common/logo-sp.svg")); ?>" /> <!-- それ以外で表示 -->
        </picture>
      </a>
      <span style="display:none;">kitashoo music school</span>
    </div>
    <?php endif; ?>
    <nav class="p-header__nav">
      <ul class="p-header__nav-list">
        <li class="p-header__nav-item u-underline__black">
          <a href="<?php echo esc_url( home_url( '/about' ) ); ?>">料金</a>
        </li>
        <li class="p-header__nav-item u-underline__black">
          <a href="<?php page_path("news"); ?>">ニュース</a>
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
    <button class="p-header__hamburger js-hamburger" aria-label="メニューを開く">
      <span></span>
      <span></span>z
      <span></span>
    </button>
    <div class="p-header__drawer js-drawer">
      <nav class="p-header__drawer-nav">
        <ul class="p-header__drawer-list">
          <li class="p-header__drawer-item">
            <a href="<?php echo esc_url( home_url( '/about' ) ); ?>">料金</a>
          </li>
          <li class="p-header__drawer-item">
            <a href="<?php page_path("news"); ?>">ニュース</a>
          </li>
          <li class="p-header__drawer-item">
            <a href="<?php echo esc_url( home_url( '/result' ) ); ?>">卒業実績</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</header>