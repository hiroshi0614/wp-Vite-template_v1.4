<footer class="p-footer">
  <div class="l-inner">
    <div class="p-footer__content">
      <div class="p-footer__logo">
        <a href="<?php echo esc_url(home_url('/')); ?>">
          <img
            src="<?php echo esc_url(get_theme_file_uri('/assets/images/common/logo-white.svg')); ?>"
            alt="きたむらミュージックスクール"
            width="40"
            height="60"
            loading="lazy"
          />
        </a>
      </div>
      <nav aria-label="フッターナビゲーション">
        <ul class="p-footer__nav-list">
          <li class="p-footer__nav-item">
            <a href="<?php echo esc_url(home_url('/')); ?>">ホーム</a>
          </li>
          <li class="p-footer__nav-item">
            <a href="<?php echo esc_url(home_url('/about')); ?>">料金</a>
          </li>
          <li class="p-footer__nav-item">
            <a href="<?php echo esc_url(home_url('/blog')); ?>">ブログ</a>
          </li>
          <li class="p-footer__nav-item">
            <a href="<?php echo esc_url(home_url('/result')); ?>">卒業実績</a>
          </li>
        </ul>
      </nav>
    </div>
    <ul class="p-footer__social">
      <li>
        <a href="#" aria-label="Twitter（X）">
          <img
            src="<?php echo esc_url(get_theme_file_uri('/assets/images/common/icon-twitter.svg')); ?>"
            alt=""
            width="22"
            height="18"
            loading="lazy"
          />
        </a>
      </li>
      <li>
        <a href="#" aria-label="Facebook">
          <img
            src="<?php echo esc_url(get_theme_file_uri('/assets/images/common/icon-facebook.svg')); ?>"
            alt=""
            width="22"
            height="22"
            loading="lazy"
          />
        </a>
      </li>
      <li>
        <a href="#" aria-label="YouTube">
          <img
            src="<?php echo esc_url(get_theme_file_uri('/assets/images/common/icon-youtube.svg')); ?>"
            alt=""
            width="22"
            height="16"
            loading="lazy"
          />
        </a>
      </li>
      <li>
        <a href="#" aria-label="Instagram">
          <img
            src="<?php echo esc_url(get_theme_file_uri('/assets/images/common/icon-instagram.svg')); ?>"
            alt=""
            width="20"
            height="20"
            loading="lazy"
          />
        </a>
      </li>
    </ul>
    <div class="p-footer__bottom">
      <p class="p-footer__copyright">Copyright © <?php echo esc_html(date('Y')); ?> KITAMURA music school Inc. All Rights</p>
    </div>
  </div>
</footer>
<?php wp_footer(); ?>
</body>

</html>
