<?php

/**
 * 投稿タイプのラベルを「ブログ」に変更
 */

// 投稿タイプのラベル変更
function change_post_labels()
{
  global $wp_post_types;

  $labels = &$wp_post_types["post"]->labels;
  $labels->name = "ブログ";
  $labels->singular_name = "ブログ";
  $labels->add_new_item = "ブログの新規追加";
  $labels->edit_item = "ブログの編集";
  $labels->new_item = "新規ブログ";
  $labels->view_item = "ブログを表示";
  $labels->search_items = "ブログを検索";
  $labels->not_found = "ブログが見つかりませんでした";
  $labels->not_found_in_trash = "ゴミ箱にブログは見つかりませんでした";
}

// 管理画面メニューのラベル変更
function change_post_menu_labels()
{
  global $menu, $submenu;

  $menu[5][0] = "ブログ";
  $submenu["edit.php"][5][0] = "ブログ一覧";
  $submenu["edit.php"][10][0] = "新しいブログ";
}

add_action("init", "change_post_labels");
add_action("admin_menu", "change_post_menu_labels");

/**
 * 通常投稿（post）のアーカイブを有効化し、スラッグを「blog」に設定
 * これにより /blog/ で archive-news.php が使用される
 */
function enable_post_archive_with_slug($args, $post_type)
{
  if ($post_type === "post") {
    $args["has_archive"] = true;
    $args["rewrite"] = [
      "slug" => "blog",
      "with_front" => false,
    ];
  }
  return $args;
}
add_filter("register_post_type_args", "enable_post_archive_with_slug", 10, 2);
