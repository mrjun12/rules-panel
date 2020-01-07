<?php
header("Content-Type: text/html;charset=utf-8");
header("X-Powered-By: PhpPoem_v2.0");

// APP配置
defined('APP_DEBUG') || define('APP_DEBUG', false);
define('APP_RUNTIME_PATH', APP_PATH . 'runtime/'); // 运行时临时文件目录
define('APP_CONF', APP_PATH . 'config.php'); // 运行目录配置
define('APP_FUNC', APP_PATH . 'function.php');
define('APP_ROUTE', APP_PATH . 'route.php');

// 系统配置
define('POEM_PATH', __DIR__ . DIRECTORY_SEPARATOR); // phppoem目录
define('CORE_PATH', realpath(POEM_PATH . 'core') . DIRECTORY_SEPARATOR); // Framework核心代码库
define('VENDOR_PATH', POEM_PATH . 'vendor/'); // 扩展包库
define('CORE_CONF', POEM_PATH . 'config.php'); // Framework核心代码库
define('CORE_FUNC', POEM_PATH . 'function.php'); // Framework核心代码库


define('IS_AJAX', ( (isset($_SERVER['HTTP_CONTENT_TYPE']) && strtolower($_SERVER['HTTP_CONTENT_TYPE']) == 'application/json') || (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')) ? true : false);
define('IS_CLI', PHP_SAPI == 'cli' ? 1 : 0);

require CORE_PATH . 'app.php';
\poem\app::start();