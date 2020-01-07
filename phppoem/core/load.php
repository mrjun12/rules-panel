<?php
namespace poem;
class load {

    /**
     * 注册自动加载
     * @return null
     */
    static function register() {
        spl_autoload_register('\poem\load::autoload');
    }

    /**
     *自动加载,没找到类时是哟给你
     * @param  string $class 类名
     * @return bool
     */
    static function autoload($class) {
        $class = strtolower(str_replace('\\', '/', $class));
        // 命名空间
        if (strstr($class, '/', true) == 'poem') {
            $file = CORE_PATH . trim(strstr($class, '/'), '/') . '.php';
        } elseif (strstr($class, '/', true) == 'lib') {
            $file = APP_PATH . '../' . $class . '.php';
        } else {
            $file = APP_PATH . $class . '.php';
        }

        if (!is_file($file)) {
            return false;
        }

        include $file;
        return true;
    }

    /**
     * 实例化类并存储
     * @param string $class 类名
     * @return class 实例化类
     */
    static function instance($class) {
        static $ins = [];
        if (!isset($ins[$class])) {
            $ins[$class] = new $class;
        }
        return $ins[$class];
    }

    /**
     * 扩展包引入 require
     * @param string $class 类名
     * @param string $ext 后缀
     * @return return null
     */
    static function vendor($class, $ext = '.php') {
        static $_file = array();
        // if( class_exists($class) ) return true;vendor
        if (isset($_file[$class])) {
            return true;
        }

        $file = VENDOR_PATH . $class . $ext;
        if (!is_file($file)) {\poem\app::halt('文件不存在: ' . $file);}
        $_file[$class] = true;
        require $file;
    }

    /**
     * 实例化控制器
     * @param string $class 类名
     * @param string $module 模块名
     * @return class 实例化类
     */
    static function controller($class, $module = POEM_MODULE) {
        $name = "$module\\controller\\$class";
        return self::instance($name);
    }
}