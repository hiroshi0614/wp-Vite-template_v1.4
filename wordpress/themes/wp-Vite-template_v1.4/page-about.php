<?php get_header(); ?>
<main>
  <?php
  $hero_image = '';
  if (function_exists('get_field')) {
    $hero_image = get_field('about_hero_image');
  }
  ?>
  <section class="p-page-hero">
    <div class="p-page-hero__img">
      <?php if ($hero_image && is_array($hero_image)): ?>
        <img
          src="<?php echo esc_url($hero_image['url']); ?>"
          alt="<?php echo esc_attr($hero_image['alt'] ?? 'プラン・料金'); ?>"
          width="<?php echo esc_attr($hero_image['width'] ?? ''); ?>"
          height="<?php echo esc_attr($hero_image['height'] ?? ''); ?>"
          loading="lazy"
        />
      <?php else: ?>
        <img
          src="<?php echo esc_url(get_theme_file_uri('/assets/images/top/FV@2x.webp')); ?>"
          alt="プラン・料金"
          width="1440"
          height="810"
          loading="lazy"
        />
      <?php endif; ?>
    </div>
    <div class="p-page-hero__overlay"></div>
    <h1 class="p-page-hero__title">プラン・料金</h1>
  </section>

  <nav class="p-breadcrumb" aria-label="パンくずリスト">
    <div class="l-inner">
      <ol class="p-breadcrumb__list">
        <li>
          <a href="<?php echo esc_url(home_url('/')); ?>" class="p-breadcrumb__link">ホーム</a>
        </li>
        <li aria-hidden="true"><span class="p-breadcrumb__separator">&gt;</span></li>
        <li><span class="p-breadcrumb__current" aria-current="page">プラン・料金</span></li>
      </ol>
    </div>
  </nav>

  <section class="p-about-fee">
    <div class="l-inner">
      <h2 class="p-about-fee__title">料金体系</h2>
      <div class="p-about-fee__summary">
        <div class="p-about-fee__badge">
          <span>入会金 39,000円</span>
        </div>
        <span class="p-about-fee__plus">+</span>
        <div class="p-about-fee__badge">
          <span>月額料金</span>
        </div>
      </div>
      <p class="p-about-fee__text">
        きたむらミュージックスクールでは、個人に合わせたサポートを行う完全オーダーメイドのプランを用意しており、サポート内容により月額料金が異なります。担当者があなたに最適なプランを提案いたしますので、お気軽にお問い合わせください。※すべての料金は税込価格となります。
      </p>
    </div>
  </section>

  <section class="p-about-plan">
    <div class="l-inner">
      <h2 class="p-about-plan__title">プラン内容・月額料金</h2>
      <div class="p-about-plan__table-wrap">
        <table class="p-about-plan__table">
          <thead>
            <tr>
              <th class="p-about-plan__feature-col"></th>
              <th class="p-about-plan__plan-head" scope="col">ベーシックプラン</th>
              <th class="p-about-plan__plan-head p-about-plan__plan-head--recommended" scope="col">
                <span class="p-about-plan__badge">おすすめ</span>
                スタンダードプラン
              </th>
              <th class="p-about-plan__plan-head" scope="col">プレミアムプラン</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th class="p-about-plan__price-head" scope="row">月額料金</th>
              <td class="p-about-plan__cell p-about-plan__cell--price">39,000円</td>
              <td class="p-about-plan__cell p-about-plan__cell--price-recommended">59,000円</td>
              <td class="p-about-plan__cell p-about-plan__cell--price">128,000円</td>
            </tr>
            <tr>
              <th class="p-about-plan__feature-head" scope="row">マンツーマン授業</th>
              <td class="p-about-plan__cell">
                <span class="p-about-plan__dot"></span><br>週１回
              </td>
              <td class="p-about-plan__cell">
                <span class="p-about-plan__dot p-about-plan__dot--red"></span><br>週２回
              </td>
              <td class="p-about-plan__cell">
                <span class="p-about-plan__dot"></span><br>無制限
              </td>
            </tr>
            <tr>
              <th class="p-about-plan__feature-head" scope="row">ビジネス基本講座</th>
              <td class="p-about-plan__cell"><span class="p-about-plan__dot"></span></td>
              <td class="p-about-plan__cell"><span class="p-about-plan__dot p-about-plan__dot--red"></span></td>
              <td class="p-about-plan__cell"><span class="p-about-plan__dot"></span></td>
            </tr>
            <tr>
              <th class="p-about-plan__feature-head" scope="row">練習ROOM利用</th>
              <td class="p-about-plan__cell">
                <span class="p-about-plan__dot"></span><br>月10時間
              </td>
              <td class="p-about-plan__cell">
                <span class="p-about-plan__dot p-about-plan__dot--red"></span><br>月20時間
              </td>
              <td class="p-about-plan__cell">
                <span class="p-about-plan__dot"></span><br>無制限
              </td>
            </tr>
            <tr>
              <th class="p-about-plan__feature-head" scope="row">ビジネスコンサル</th>
              <td class="p-about-plan__cell"><span class="p-about-plan__dash"></span></td>
              <td class="p-about-plan__cell">
                <span class="p-about-plan__dot p-about-plan__dot--red"></span><br>月２回
              </td>
              <td class="p-about-plan__cell">
                <span class="p-about-plan__dot"></span><br>月３回
              </td>
            </tr>
            <tr>
              <th class="p-about-plan__feature-head" scope="row">コミュニティ参加資格</th>
              <td class="p-about-plan__cell"><span class="p-about-plan__dash"></span></td>
              <td class="p-about-plan__cell"><span class="p-about-plan__dash"></span></td>
              <td class="p-about-plan__cell"><span class="p-about-plan__dot"></span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="p-about-plan__note">※各サービスは１回ごとのオプション追加が可能です。詳しくは事務局までお問い合わせください。</p>
    </div>
  </section>

  <div class="l-inner">
    <div class="p-about-cta">
      <a href="<?php echo esc_url(home_url('/contact')); ?>" class="p-about-cta__btn">お問い合わせ</a>
    </div>
  </div>
</main>
<?php get_footer(); ?>
