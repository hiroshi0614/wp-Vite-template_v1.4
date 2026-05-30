<?php get_header(); ?>
<main>
  <div class="p-contact__complete">
    <div class="l-inner">
      <h1 class="p-contact__complete-title">送信完了</h1>
      <p class="p-contact__complete-text">
        お問い合わせいただきありがとうございます。<br>
        内容を確認し、担当者よりご連絡いたします。<br>
        しばらくお待ちくださいませ。
      </p>
      <div class="p-contact__complete-button">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="c-btn">トップに戻る</a>
      </div>
    </div>
  </div>
</main>
<?php get_footer(); ?>
