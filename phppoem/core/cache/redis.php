<?php
namespace poem\cache;

class redis {
    public $_ins;
    protected $_option;

    /**
     * 构造函数
     * @param array $option redis配置
     * @return null
     */
    public function __construct($option = array()) {
        $option = array_merge(array(
            'host'    => config('redis_host') ?: '127.0.0.1',
            'port'    => config('redis_port') ?: 6379,
            'expire'  => config('redis_expire') ?: null,
            'auth'    => config('redis_auth') ?: 0,
            'timeout' => config('redis_timeout') ?: 0,
        ), $option);
        $this->_option = $option;
        $this->_ins    = new \redis();
        $re            = $this->_ins->connect($option['host'], $option['port'], $option['timeout']);
        if (!$re) {
            throw new \Exception("Connect Redis Failed", 1);
        }

        if ($option['auth']) {
            $this->_ins->auth($option['auth']);
        }
    }

    /**
     * 魔术方法,调用redis函数
     * @param string $name 方法名
     * @param array $args 参数
     * @return mixed redis return
     */
    public function __call($name, $args){
        return call_user_func(array($this->_ins, $name), $args);
    }

    /**
     * 获取键key
     * @param string $key 键
     * @return string 数据
     */
    public function get($key) {
        return $this->_ins->get($key);
    }

    /**
     * 设置键值
     * @param string $key 键
     * @param string $value 值
     * @param integer $option 选项 0:序列化写文件 -1:直接写文件 -2:追加文件 否则序列化追加文件
     * @return 返回设置的文件路径
     */
    public function set($key, $value, $expire = null) {
        if (is_null($expire)) {
            $expire = $this->_option['expire'];
        }

        $value = is_object($value) || is_array($value) ? json_encode($value) : $value;
        return is_int($expire) ? $this->_ins->set($key, $value) : $this->_ins->setex($key, $expire, $value);
    }

    /**
     * 删除键值
     * @param string $key 键
     * @return bool 
     */
    public function del($key) {
        return $this->_ins->del($key);
    }

    /**
     * 析构函数，删除资源
     * @return null
     */
    function __destruct() {
        $this->_ins->close();
    }
}