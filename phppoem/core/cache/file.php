<?php
namespace poem\cache;
/**
 * 文件存储键值对
 */
class file {

    /**
     * 检查key是否存在
     * @param string $key 键
     * @return boolean 存在true,否则false
     */
    public function has($key) {
        $key = APP_RUNTIME_PATH . $key . '.php';
        return is_file($key) ? $key : false;
    }

    /**
     * 获取key的值
     * @param string $key 键
     * @param string $append -1 代表只获取值，不做序列化
     * @return string 值
     */
    public function get($key, $append) {
        $key = APP_RUNTIME_PATH . $key . '.php';
        if (!is_file($key)) {
            return false;
        }

        if ($append === -1) {
            return file_get_contents($key);
        }

        $data = file_get_contents($key);
        $json = unserialize($data);
        return $json === null ? $data : $json;
    }

    /**
     * 设置键值
     * @param string $key 键
     * @param string $value 值
     * @param integer $option 选项 0:序列化写文件 -1:直接写文件 -2:追加文件 否则序列化追加文件
     * @return 返回设置的文件路径
     */
    public function set($key, $value, $option = 0) {
        $key = APP_RUNTIME_PATH . $key . '.php';
        $dir = dirname($key);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        if ($option === -1) {
            $re = file_put_contents($key, $value);
        } elseif ($option === -2) {
            $re = file_put_contents($key, $value, FILE_APPEND);
        } else {
            $value = serialize($value);
            if ($option == 0) {
                $re = file_put_contents($key, $value);
            } else {
                $re = file_put_contents($key, $value, FILE_APPEND);
            }

        }

        if (!$re) {
            throw new \Exception('文件写入失败：' . $key);
        }

        return $key;
    }

    /**
     * 删除key
     * @param string $key 键
     * @return null
     */
    public function del($key) {
        $key = APP_RUNTIME_PATH . $key . '.php';
        if (!is_file($key)) {
            return false;
        }

        unlink($key);
    }
}