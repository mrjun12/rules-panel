<?php

/**
 * i , input缩写, 获取参数Get 和 Post
 * @param  string $key 参数
 * @param  bool $is_array 是否为获取数组
 * @return mixed
 * i('info');
 */
function i($key, $is_array = false) {
    $tmp = isset($_GET[$key]) ? $_GET[$key] : (isset($_POST[$key]) ? $_POST[$key] : null);
    if (is_null($tmp) || is_numeric($tmp)) {
        return $tmp;
    }

    if ($is_array && is_array($tmp)) {
        return array_map('htmlspecialchars', $tmp);
    }
    return htmlspecialchars(trim(strval($tmp)));
}

/**
 * 获取参数 gp, get param缩写, 获取参数Get 和 Post
 * @param  string $param 参数
 * @param  bool $allow_null 是否允许空，默认不允许，不允许时空参数会抛出异常
 * @return mixed
 * 使用方法： gp('name,age') 或 gp('name|姓名,age|年龄') 
 * 返回值为：
 * array(
 *     'name' => i('name'),
 *     'age' => i('age'),
 * )
 * 
 * “,” 分割多个字段
 * “|” 后面是提示内容，如果参数为name空,则会提示 "姓名, 不能为空."
 */
function gp($param, $allow_null = false) {
    $arr = explode(',', $param);
    // 分解 | key和val
    foreach ($arr as $value) {
        $k = explode('|', $value);
        $v = i($k[0]);
        if ($allow_null == false && (is_null($v) || $v === '')) {
            $more = isset($k[1]) ? $k[1] : $k[0];
            $tmp  = "{$more} , 不能为空";
            if (IS_AJAX) {ajax(1, $tmp, 'param cannot be null');}
            err_jump($tmp);
        }
        $args[$k[0]] = $v;
    }
    return count($args) == 1 ? current($args) : $args;
}

/**
 * 配置管理
 * @param  string $name
 * @param  mixed $value
 * @return mixed
 * 使用方法
 * 1. config($key); 获取 config $key
 * 2. config($key,$value); 设置config $key值为$value
 * 3. config(); 获取所有config
 */
function config($name = null, $value = null) {
    static $config = array();
    if (empty($name)) {
        return $config;
    }

    if (is_string($name)) {
        if (!is_null($value)) {
            $config[$name] = $value;
        } else {
            return isset($config[$name]) ? $config[$name] : null;
        }

    }
    if (is_array($name)) {
        $config = array_merge($config, $name);
    }
    return null;
}

/**
 * 调试输出
 * @param mixed  multi 任意类型/数目
 * @return void
 */
function co() {
    $vars = func_get_args();
    foreach ($vars as $var) {
        highlight_string("<?php\n" . var_export($var, true));
        echo '<hr />';
    }
    exit;
}

/**
 * ajax返回值
 * @param  string  $code  提示码
 * @param  string  $info  提示信息
 * @param  string  $data  数据信息
 * @return void echo json
 */
function ajax($code, $info = '', $data = '') {
    $re = ['code' => $code, 'info' => $info];
    if ($info !== '') {
        $re['info'] = $info;
    }

    if ($data !== '') {
        $re['data'] = $data;
    }

    echo json_encode($re);
    exit;
}

/**
 * 封装返回值
 * @param  string  $code  提示码
 * @param  string  $info  提示信息
 * @param  string  $data  数据信息
 * @return array
 */
function ret($code, $info = '', $data = '') {
    return ['code' => $code, 'info' => $info, 'data' => $data];
} 

function ajax_obj($ret){
	echo json_encode($ret);
	exit;
}

/**
 * l 日志log缩写, 日志信息
 * @param  string $info 日志内容
 * @param  string $level 日志级别
 * @return void
 */
function l($info, $level = \poem\log::INFO, $depth = 0) {\poem\log::get_instance()->write($info, $level, $depth + 1);}

/**
 * m 模型model缩写,数据库表模型
 * @param  string $tb     表名
 * @param  string $config 配置信息
 * @return class $model \poem\model
 */
function m($tb = '', $config = '') {
    static $model;
    if (!isset($model[$tb])) {
        $class = 'poem\\model';
        if ($tb && is_file($file = MODULE_MODEL . strtolower($tb) . '.php')) {
            include $file;
            $class = POEM_MODULE . '\\model\\' . $tb;
        }
        $model[$tb] = new $class($tb, $config);
    }
    return $model[$tb];
}

/**
 * v 视图view缩写,渲染并输出
 * @param  string  $tpl 模板名
 * @param  bool $flag 是否结束
 * @return void
 */
function v($tpl = '', $flag = true) {
    \poem\load::instance('poem\view')->display($tpl);
    \poem\app::end();
}

/**
 * 获取视图信息 相对于 v('index')函数会渲染并输出echo,而 fetch('index')会获取'index'渲染的结果
 * @param  string $tpl 模板名
 * @return string $html
 */
function fetch($tpl = '') {
    return \poem\load::instance('poem\view')->fetch($tpl);
}

/**
 * 赋值 这里assign('name','phppoem')，可以在 v()或fetch()当作变量使用 $name
 * @param  string/array $key 数组会直接merge合并
 * @param  string $value
 * @return void
 */
function assign($key, $value = '') {
    \poem\load::instance('poem\view')->assign($key, $value);
}

/**
 * 成功跳转页面
 * @param  string $info   页面展示内容
 * @param  string $uri    展示后跳转至uri
 * @param  string $param  url 参数,如: ?type=1
 * @param  int $second 页面停留时间
 * @return void
 */
function ok_jump($info, $uri = '', $param = '', $second = false) {
    \poem\load::instance('poem\view')->auto_jump($info, $uri, $param, $second, 1);
}

/**
 * 失败成功跳转页面
 * @param  string $info   页面展示内容
 * @param  string $uri    展示后跳转至uri
 * @param  string $param  url 参数,如: ?type=1
 * @param  int $second 页面停留时间
 * @return void
 */
function err_jump($info, $uri = '', $param = '', $second = false) {
    \poem\load::instance('poem\view')->auto_jump($info, $uri, $param, $second, 0);
}

/**
 * 缓存设置
 * @param  string $cache_type 缓存类型 redis/memcache/file
 * @param  string $key   健
 * @param  string $value 值
 * @param  array $options 配置选项
 * @return mixed
 */
function cache($cache_type = '', $key = '', $value = '', $options = null) {
    // option array为配置信息， int为超时
    $obj = \poem\cache::get_instance($cache_type, is_array($options) ? $options : null);
    if ($key === '') {return $obj->_ins;} // 返回实例

    if ($value === '') {
        return $obj->get($key);
    } elseif (is_null($value)) {
        return $obj->del($key);
    } else {
        return $obj->set($key, $value, is_numeric($options) ? $options : null);
    }
}

/**
 * 文件缓存
 * @param  string  $key    健
 * @param  string  $value  值
 * @param  int $append 0:覆盖  1:追加 2:检查 -1:字符串写和查 -2:字符串追加
 * @return mixed
 * 使用方法
 * 1. f($key); 获取文件 $key
 * 2. f($key,$value); 设置文件 $key值为$value
 */
function f($key = '', $value = '', $append = 0) {
    if (empty($key)) {
        return null;
    }

    $obj = \poem\cache::get_instance('file');
    if ($append == 2) {
        return $obj->has($key);
    }

    if ($value === '') {
        return $obj->get($key, $append);
    } elseif (is_null($value)) {
        return $obj->del($key);
    } else {
        return $obj->set($key, $value, $append);
    }
}

/**
 * 使用 redis
 * @param  string $key
 * @param  string $value
 * @param  array $options redis配置信息
 * @return mixed
 * 使用方法
 * 1. redis($key) 获取 $key
 * 2. redis($key,$value) 设置$key为$value
 * 3. redis($key,'',$option) 获取 $key,按$option配置
 * 4. redis($key,$value,$option) 设置$key为$value,按$option配置
 */
function redis($key = '', $value = '', $options = null) {return cache('redis', $key, $value, $options);}

/**
 * 使用memcache
 * @param  string $k   [description]
 * @param  string $v   [description]
 * @param  [type] $opt [description]
 * @return [type]      [description]
 */
function memcache($key = '', $value = '', $options = null) {return cache('memcache', $key, $value, $options);}

/**
 * 加载扩展文件
 * @param  string $require_class /vendor 目录下的路径名称
 * @param  string $ext 后缀
 * @return void
 */
function vendor($require_class, $ext = '.php') {
    \poem\load::vendor($require_class, $ext);
}

/**
 * cookie的使用
 * @param  string $name  cookie 健
 * @param  string $value cookie 值
 * @return mixed
 * 使用方法：
 * 1. cookie($key); 获取 cookie $key
 * 2. cookie($key,$value); 设置cookie $key值为$value
 * 3. cookie($key,$value,time()+10); 设置cookie $key值为$value 并只保存10s
 * 4. cookie($key,$value,$option_arr); 设置cookie $key值为$value 并按以下option_arr条件
 * $option_arr = array(
 *     'prefix' => 10, // cookie前缀
 *     'expire' => '', // 过期时间, 默认浏览器关闭过期
 *     'path' => '/', // cookie可使用url路径
 *     'domain' => 'phppoem.com', // cookie可使用域名
 *     'secure' => false, // true 在https下会传输，http不会传输
 *     'httponly' => false, // true 无法通过程序读取如 JS脚本、Applet等
 * );
 */
function cookie($name = '', $value = '', $option = null) {
    if (empty($name)) {
        return $_COOKIE;
    }

    $cfg = array(
        'prefix'   => config('cookie_prefix'), // cookie 名称前缀
        'expire'   => config('cookie_expire'), // cookie 保存时间
        'path'     => config('cookie_path'), // cookie 保存路径
        'domain'   => config('cookie_domain'), // cookie 有效域名
        'secure'   => config('cookie_secure'), //  cookie 启用安全传输
        'httponly' => config('cookie_httponly'), // httponly设置
    );
    $name = $cfg['prefix'] . $name;
    if ($value === '') {
        return $_COOKIE[$name];
    }

    if (!is_null($option)) {
        if (is_numeric($option)) {
            $cfg['expire'] = $option;
        } elseif (is_string($option)) {
            parse_str($option, $option);
            $cfg = array_merge($cfg, $option);
        }
    }

    if (is_null($value)) {
        $cfg['expire'] = time() - 3600;
        unset($_COOKIE[$name]);
    }
    setcookie($name, $value, $cfg['expire'], $cfg['path'], $cfg['domain'], $cfg['secure'], $cfg['httponly']);
    $_COOKIE[$name] = $value;
}

/**
 * session的使用
 * @param  string $name  session_Id
 * @param  string $value session_data
 * @return mixed
 * 使用方法
 * 1. session($key); 获取 session $key
 * 2. session($key,$value); 设置session $key值为$value
 * 3. session(); 获取所有session
 */
function session($name = '', $value = '') {
    static $flag = 0;
    if ($flag == 0) {
        // 自定义session存储介质
        if (config('session_type')) {
            if (config('session_expire')) {
                ini_set('session.gc_maxlifetime', config('session_expire'));
            }

            $class = '\\poem\\session\\' . config('session_type');
            if (!session_set_save_handler(new $class())) {
                throw new \Exception('error session handler');
            }

        }
        session_start();
        $flag = 1;
    }
    if ($name === '') {
        return $_SESSION;
    }

    if (is_null($name)) {
        unset($_SESSION);
    }

    if ($value === '') {
        return $_SESSION[$name];
    } elseif (is_null($value)) {
        unset($_SESSION[$name]);
    } else {
        $_SESSION[$name] = $value;
    }
}

/**
 * layout布局设置
 * @param  false/string $flag false代表关闭布局 string代表开启，并设置布局文件
 * @return void
 */
function layout($flag) {
    if ($flag !== false) {
        config('layout_on', true);
        if (is_string($flag)) {
            config('layout', $flag);
        }
    } else {
        config('layout_on', false);
    }
}

/**
 * 计时函数
 * @param  string $key 计时的标记
 * @param  string $end 是否结束
 * @param  int $settime 为key设置的时间
 * @return int/void
 */
function t($key, $end = '', $settime = null) {
    static $time = array(); // 计时
    if (empty($key)) {
        return $time;
    }

    if (!is_null($settime)) {
        $time[$key] = $settime;
        return;
    }

    if ($end === -1) {
        return $time[$key]; // 返回 key
    } elseif ($end === 1) {
        return microtime(1) - $time[$key]; // 返回 上次key到现在的时间
    } elseif ($end === 0) {
        $time[$key] = microtime(1) - $time[$key]; // 记录 上次key现在的时间
    } elseif (!empty($end)) {
        if (!isset($time[$end])) {
            $time[$end] = microtime(1);
        }

        return $time[$end] - $time[$key]; // 返回 两个key的差值
    } else {
        $time[$key] = microtime(1); // 记录 当前key
    }
}

/**
 * 跳转
 * @param  string $uri
 * @return void
 */
function jump($uri) {
    $url = poem_url($uri);
    header("Location: $url");
    exit;
}

/**
 * 解析uri为url
 * @param  string $uri 资源定位
 * @return string $url
 */
function poem_url($uri) {
    if (strpos($uri, '//') !== false) {
        return $uri;
    }

    if (strpos($uri, '/') === 0) {
        return $uri;
    }

    $module = strtolower(POEM_MODULE);
    $class  = strtolower(POEM_CTRL);
    $func   = POEM_FUNC;
    $tmp    = explode('/', trim($uri, '/'));
    switch (count($tmp)) {
        case 1:$func = $tmp[0];
            break;
        case 2:$class = $tmp[0];
            $func         = $tmp[1];
            break;
        case 3:$module = $tmp[0];
            $class         = $tmp[1];
            $func          = $tmp[2];
            break;
    }
    return POEM_URL . "/$module/$class/$func"; // html文件路径
}
