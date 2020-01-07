<?php
namespace poem;

class cache {
    private static $_instance = array();

    /**
     * 获取缓存实例
     * @param  string $type 类型 file/redis
     * @param  array  $option 配置项 type为redis时,此为redis配置
     * @return class $instance \poem\cache\file or redis
     */
    public static function get_instance($type = '', $option = array()) {
        if (empty($type)) {
            $type = config('cache_type') ?: 'file';
        }

        if (!isset(self::$_instance[$type])) {
            $class  = '\\poem\\cache\\' . strtolower($type);
            $option = is_array($option) ? $option : array();

            self::$_instance[$type] = new $class($option);
        }
        return self::$_instance[$type];
    }
}