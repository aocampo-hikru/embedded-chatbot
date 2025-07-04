<?php
// Minimal child theme setup
add_action('wp_enqueue_scripts', function(){
    $parent = wp_get_theme(get_template());
    wp_enqueue_style('parent-style', get_template_directory_uri().'/style.css', [], $parent->get('Version'));
});
