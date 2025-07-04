<?php
/*
Plugin Name: My Chat Embed
Description: Provides [my_chat] shortcode for embedding the chat widget.
*/

// Enqueue the JS and pass settings from wp-config.php or options
function my_chat_enqueue(){
    $plugin_url = plugin_dir_url(__FILE__);
    wp_enqueue_script('my-chat-embed', $plugin_url . 'my-chat-embed.js', [], '1.0', true);
    $cfg = [
        'apiBase' => defined('MY_CHAT_API_BASE') ? MY_CHAT_API_BASE : get_option('my_chat_api_base', ''),
        'clientId' => get_option('my_chat_client_id', ''),
        'tenantId' => get_option('my_chat_tenant_id', ''),
        'widgetUrl' => $plugin_url . 'my-chat-embed.js',
    ];
    wp_localize_script('my-chat-embed', 'MY_CHAT_CONFIG', $cfg);
}
add_action('wp_enqueue_scripts', 'my_chat_enqueue');

// Shortcode output
function my_chat_shortcode(){
    return '<my-chat></my-chat>';
}
add_shortcode('my_chat', 'my_chat_shortcode');
?>
