<?php get_header(); ?>
<main>
  <section class="p-mv">
    <h2 class="p-mv__title">「音楽で生きる」<br class="u-hidden-pc">を叶える<br>ミュージックスクール</h2>
    <div class="p-mv__img">
      <?php
        // WP管理画面から「main_visual_pc」「main_visual_sp」などで登録している場合を想定
        $main_visual_pc = get_field('main_visual__pc');
        $main_visual_sp = get_field('main_visual__sp');
      ?>
      <picture>
        <!-- PC用 -->
        <source media="(min-width: 768px)" srcset="<?php
            if ($main_visual_pc) {
              echo esc_url($main_visual_pc['url']);
            } else {
              echo './assets/images/top/FV@2x.png';
            }
          ?>">
        <!-- SP用 -->
        <source media="(max-width: 767px)" srcset="<?php
            if ($main_visual_sp) {
              echo esc_url($main_visual_sp['url']);
            } else {
              echo './assets/images/top/FV-sp@2x.png';
            }
          ?>">
        <!-- フォールバック（必須） -->
        <img src="<?php echo $main_visual_pc ? esc_url($main_visual_pc['url']) : './assets//images/top/FV@2x.png'; ?>"
          alt="メインビジュアル">
      </picture>
    </div>
    <div class="p-mv__mask">
    </div>
  </section>
  <section>
    <div class="p-plan l-plan">
      <div class="l-inner">
        <h3 class="p-plan__title">全人類、<br class="u-hidden-pc"> ミュージシャン計画。</h3>
        <p class="p-plan__text">私たちは音楽を愛するすべての人が、音楽に熱狂できる世界を目指しています。</p>
        <div class="p-plan__circle">
          <picture>
            <source srcset="<?php echo esc_url(get_theme_file_uri("/assets/images/top/semicircle.svg")); ?>"
              media="(min-width: 768px)" type="image/svg+xml" />
            <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/top/semicircle-sp.svg")); ?>" alt=""
              width="375" height="200" />
          </picture>
        </div>
        <div class="p-plan__diagram">
          <div class="p-plan__diagram-item p-diagram-item">
            <p class="p-diagram-item__title">Enthusiasm</p>
            <span class="p-diagram-item__circle p-diagram-item__circle--up p-diagram-item__circle--arrow-top c-circle"
              aria-hidden="true"></span>
            <p class="p-diagram-item__text">熱狂し</p>
          </div>
          <div class="p-plan__diagram-item p-diagram-item">
            <p class="p-diagram-item__title">Envision</p>
            <span class="p-diagram-item__circle p-diagram-item__circle--up c-circle" aria-hidden="true"></span>
            <p class="p-diagram-item__text">想像し</p>
          </div>
          <div class="p-plan__diagram-item p-diagram-item">
            <p class="p-diagram-item__title">Effulgent</p>
            <span class="p-diagram-item__circle p-diagram-item__circle--up c-circle" aria-hidden="true"></span>
            <p class="p-diagram-item__text">輝く存在へ</p>
          </div>
          <div class="p-plan__diagram-arrow">
          </div>
        </div>
      </div>
    </div>
  </section>
  <section>
    <div class="l-concept p-concept">
      <div class="l-inner">
        <h3 class="p-concept__title">音楽業界初！<br>
          収益化までサポートする<br class="u-hidden-pc">ミュージックスクール</h3>
        <p class="p-concept__text">
          楽器や作詞作曲などの<br class="u-hidden-pc">
          技術・知識はもちろんのこと<br>
          自分で稼ぎつづけるための<br class="u-hidden-pc">
          ビジネス面もサポートします！
        </p>
      </div>
    </div>
  </section>
  <section>
    <div class="l-reason p-reason">
      <div class="l-inner">
        <h3 class="p-reason__title c-section-title">きたむらミュージック<br class="u-hidden-pc">スクールが選ばれる理由</h3>
        <ul class="p-reason__items">
          <li class="p-reason__item">
            <div class="p-reason__item-img">
              <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/top/reason01.webp")); ?>" alt="理由1" />
            </div>
            <div class="p-reason__item-content">
              <h4 class="p-reason__item-title">
                技術面はプロによるマンツーマン授業！
              </h4>
              <p class="p-reason__item-text">
                第一線で活躍するプロによるマンツーマン授業で、きめ細かな技術指導が受けられます。
              </p>
            </div>
          </li>
          <li class="p-reason__item">
            <div class="p-reason__item-img">
              <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/top/reason02.webp")); ?>" alt="理由2" />
            </div>
            <div class="p-reason__item-content">
              <h4 class="p-reason__item-title">
                収益化するためのビジネスサポート！
              </h4>
              <p class="p-reason__item-text">
                コンセプト設計や集客方法、マーケティングリサーチなど、音楽で稼ぎつづけるための方法やマインドセットをサポートするクラスをご用意。
              </p>
            </div>
          </li>
          <li class="p-reason__item">
            <div class="p-reason__item-img">
              <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/top/reason03.webp")); ?>" alt="理由3" />
            </div>
            <div class="p-reason__item-content">
              <h4 class="p-reason__item-title">
                24時間365日使える練習ROOMを完備！
              </h4>
              <p class="p-reason__item-text">
                一年中使える個室の練習ROOMを完備しているため、お仕事帰りや合間の時間も自由に練習が可能です。（アプリで予約が必要です）
              </p>
            </div>
          </li>
        </ul>
      </div>
  </section>
  <section>
    <div class="l-result p-result">
      <?php
      $args_result = [
          "post_type" => "result",
          "posts_per_page" => 10,
      ];
      $the_query_result = new WP_Query($args_result);
      ?>
      <?php if ($the_query_result->have_posts()) : ?>
      <div class="l-inner">
        <h3 class="p-result__title c-section-title c-section-title--white">生徒さんたちの声</h3>
        <div class="p-result__splide splide js-result-splide" aria-label="生徒さんたちの声">
          <div class="splide__arrows p-result__arrows">
            <button class="splide__arrow splide__arrow--prev" type="button" aria-label="前の投稿へ"></button>
            <button class="splide__arrow splide__arrow--next" type="button" aria-label="次の投稿へ"></button>
          </div>
          <div class="splide__track">
            <ul class="splide__list p-result__items">
              <?php while ($the_query_result->have_posts()) : $the_query_result->the_post(); ?>
              <li class="splide__slide p-result-list__item p-result-item">
                <a href="<?php the_permalink(); ?>">
                  <div class="p-result-item__img">
                    <?php if (has_post_thumbnail()) : ?>
                    <?php the_post_thumbnail("full"); ?>
                    <?php else : ?>
                    <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/top/FV-sp.webp")); ?>"
                      alt="NoImage画像" />
                    <?php endif; ?>
                  </div>
                  <div class="p-result-item__content">
                    <div class="p-result-item__title">
                      <?php the_title(); ?>
                    </div>
                    <div class="p-result-item__text">
                      <?php the_content(); ?>
                    </div>
                  </div>
                </a>
              </li>
              <?php endwhile; ?>
            </ul>
          </div>
        </div>
      </div>
      <?php wp_reset_postdata(); ?>
      <?php else : ?>
      <div class="l-inner">
        <h3 class="p-result__title c-section-title c-section-title--white">生徒さんたちの声</h3>
        <p>記事が投稿されていません</p>
      </div>
      <?php endif; ?>
    </div>
  </section>
  <section>
    <div class="l-flow p-flow">
      <div class="l-inner">
        <h3 class="p-flow__title c-section-title">ご利用の流れ</h3>
        <ol class="p-flow__items">
          <li class="p-flow__item">
            <div class="p-flow__item-marker">
              <span class="p-flow__item-circle c-circle"></span>
              <span class="p-flow__item-line" aria-hidden="true"></span>
            </div>
            <div class="p-flow__item-text-wrap">
              <p class="p-flow__item-text">お問い合わせ</p>
              <p class="p-flow__item-description">まずはフォームまたはメールにてお問い合わせください。<br>ヒアリングの日程を調整します。</p>
            </div>
          </li>
          <li class="p-flow__item">
            <div class="p-flow__item-marker">
              <span class="p-flow__item-circle c-circle"></span>
              <span class="p-flow__item-line" aria-hidden="true"></span>
            </div>
            <div class="p-flow__item-text-wrap">
              <p class="p-flow__item-text">ヒアリング</p>
              <p class="p-flow__item-description">現在の技術面や将来の目標などをお伺いします。<br>悩みや不安な事もお気軽にご相談ください。</p>
            </div>
          </li>
          <li class="p-flow__item">
            <div class="p-flow__item-marker">
              <span class="p-flow__item-circle c-circle"></span>
              <span class="p-flow__item-line" aria-hidden="true"></span>
            </div>
            <div class="p-flow__item-text-wrap">
              <p class="p-flow__item-text">プランのご提案</p>
              <p class="p-flow__item-description">ライフスタイルや目標によって最適なプランをご提案します。継続できるようサポートいたします。</p>
            </div>
          </li>
          <li class="p-flow__item">
            <div class="p-flow__item-marker">
              <span class="p-flow__item-circle c-circle"></span>
              <span class="p-flow__item-line p-flow__item-line--arrow-bottom" aria-hidden="true"></span>
            </div>
            <div class="p-flow__item-text-wrap">
              <p class="p-flow__item-text">ご入学</p>
              <p class="p-flow__item-description">お申し込み完了後、レッスンがスタートします。マンツーマン指導なので、いつからでもスタートが可能です。</p>
            </div>
          </li>

        </ol>
      </div>
    </div>
  </section>
  <section>
    <div class="l-faq p-faq">
      <div class="l-inner">
        <h3 class="c-section-title">よくあるご質問</h3>
        <ul class="p-faq__list p-faq-list">
          <li class="p-faq-list__item">
            <p class="p-faq-list__item-question js-faq-question"><span>Q</span>どのような生徒さんがどれぐらいの期間で稼いでいますか？</p>
            <div class="p-faq-list__item-answer">
              <div class="p-faq-list__item-answer-inner">
                <span>A</span>卒業生は半年ほどで稼ぐ方が多いです。
              </div>
            </div>
          </li>
          <li class="p-faq-list__item">
            <p class="p-faq-list__item-question js-faq-question"><span>Q</span>途中でプランを変更することは可能ですか？</p>
            <div class="p-faq-list__item-answer">
              <div class="p-faq-list__item-answer-inner">
                <span>A</span>途中でプラン変更も可能です。毎月15日までに申請すれば翌月からプランが変更となります。
              </div>
            </div>
          </li>
          <li class="p-faq-list__item">
            <p class="p-faq-list__item-question js-faq-question">
              <span>Q</span>入学金などの分割払いはできますか？
            </p>
            <div class="p-faq-list__item-answer">
              <div class="p-faq-list__item-answer-inner">
                <span>A</span>分割払いにも対応しています。
              </div>
            </div>
          </li>
          <li class="p-faq-list__item">
            <p class="p-faq-list__item-question js-faq-question">
              <span>Q</span>休学することも可能ですか？
            </p>
            <div class="p-faq-list__item-answer">
              <div class="p-faq-list__item-answer-inner">
                <span>A</span>可能です。申請により休学できます。
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <div class="l-blog">
      <div class="l-inner">
        <h2 class="p-blog__heading c-section-title">ブログ</h2>
        <?php
          $blog_query = new WP_Query([
            'post_type'      => 'post',
            'posts_per_page' => 3,
            'post_status'    => 'publish',
            'orderby'        => 'date',
            'order'          => 'DESC',
          ]);
        ?>
        <?php if ($blog_query->have_posts()): ?>
        <ul class="p-blog__list">
          <?php while ($blog_query->have_posts()): $blog_query->the_post(); ?>
          <li class="p-blog__item">
            <a href="<?php the_permalink(); ?>" class="p-blog__item-link">
              <div class="p-blog__item-img">
                <?php if (has_post_thumbnail()): ?>
                <?php the_post_thumbnail('medium_large', ['loading' => 'lazy']); ?>
                <?php else: ?>
                <img src="<?php echo esc_url(get_theme_file_uri('/assets/images/top/blog01.webp')); ?>" alt=""
                  width="300" height="200" loading="lazy" />
                <?php endif; ?>
              </div>
              <div class="p-blog__item-body">
                <?php $category = get_the_category(); if (!empty($category)): ?>
                <span class="p-blog__item-category"><?php echo esc_html($category[0]->name); ?></span>
                <?php endif; ?>
                <p class="p-blog__item-title"><?php the_title(); ?></p>
                <time class="p-blog__item-date"
                  datetime="<?php echo esc_attr(get_the_date('Y-m-d')); ?>"><?php echo esc_html(get_the_date('Y.m.d')); ?></time>
              </div>
            </a>
          </li>
          <?php endwhile; wp_reset_postdata(); ?>
        </ul>
        <div class="p-blog__cta">
          <a href="<?php echo esc_url(home_url('/blog/')); ?>" class="p-blog__cta">ブログ一覧へ</a>
        </div>
        <?php else: ?>
        <p class=" p-blog__empty">記事が投稿されていません。</p>
        <?php endif; ?>
      </div>
    </div>
  </section>
  <?php get_template_part('template-parts/front-page/fix-bar'); ?>
</main>
<?php get_footer(); ?>