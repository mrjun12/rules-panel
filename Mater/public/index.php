<?php
define('APP_PATH', realpath('../').'/app/');
// 调试模式 上线关闭  off while online
// 调试模式会每次重新编译view模板文件，关闭后只编译一次将提高性能
// 关闭后，每次上线后需要清理重新 ../app/runtime 文件夹，这样新模板才会生效
define('APP_DEBUG', true);
require __DIR__ . '/../phppoem/start.php';