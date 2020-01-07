<?php
namespace poem;
/**
 * 路由解析，支持用户自定义路由规则
 * url中的变量，将会写入$_GET中
 */
class route {

    /**
     * 路由解析入口
     * @return void
     */
    static function run() {
        T('POEM_ROUTE_TIME');

        $url = array();
        if (IS_CLI) {
            // 命令行模式
            $tmp                  = parse_url($_SERVER['argv'][1]);
            $_SERVER['PATH_INFO'] = $tmp['path'];
            $tmp                  = explode('&', $tmp['query']);
            foreach ($tmp as $one) {
                list($k, $v) = explode('=', $one);
                $_GET[$k]    = $v;
            }
        }
        if (defined('NEW_MODULE')) {
            $_SERVER['PATH_INFO'] = "/" . NEW_MODULE;
        }

        if (isset($_SERVER['PATH_INFO'])) {
            $_URL = $_SERVER['PATH_INFO'];
            $_EXT = pathinfo($_URL, PATHINFO_EXTENSION); // 获取url后缀
            if ($_EXT) {
                $_URL = preg_replace('/\.' . $_EXT . '$/i', '', $_URL);
            }
            // 删除url后缀
            if (is_file(APP_ROUTE)) {
                $_URL = self::parse_rule($_URL);
            }

            $url = explode('/', $_URL); // /home/index/index
            // 获取地址栏中的/参数
            if (($n = count($url)) >= 5) {
                $i = 4;
                while ($i + 1 <= $n) {
                    $_GET[$url[$i]]     = $url[$i + 1];
                    $_REQUEST[$url[$i]] = $url[$i + 1];
                    $i += 2;
                }
            }
        }
        define('POEM_MODULE', !empty($url[1]) ? strtolower($url[1]) : 'home');
        define('POEM_CTRL', !empty($url[2]) ? strtolower($url[2]) : 'index');
        define('POEM_FUNC', !empty($url[3]) ? strtolower($url[3]) : 'index');

        define('MODULE_MODEL', APP_PATH . POEM_MODULE . '/model/');

        if (isset($url[4])) {
            self::parse_param(array_slice($url, 4));
        }

        define('POEM_URL', str_replace('/index.php', '', $_SERVER['SCRIPT_NAME'])); // 项目入口文件 */index.php
        define('POEM_ROOT', dirname(POEM_URL)); // 顶级web目录
        define('POEM_MODULE_URL', POEM_URL . '/' . POEM_MODULE); // class url
        define('POEM_CTRL_URL', POEM_URL . '/' . POEM_MODULE . '/' . POEM_CTRL); // class url
        define('POEM_FUNC_URL', POEM_URL . '/' . POEM_MODULE . '/' . POEM_CTRL . '/' . POEM_FUNC); // method url

        T('POEM_ROUTE_TIME', 0);
    }

    /**
     * 规则解析
     * @param  string $url
     * @return void
     */
    private static function parse_rule($url) {
        $rule = include APP_ROUTE; // 用户自定义路由
        foreach ($rule as $pattern => $path) {
            // 匹配带{id}的参数
            preg_match_all('/{(\w+)}/', $pattern, $matchs, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);

            $tmp  = '';
            $pos  = 0;
            $vars = array();
            foreach ($matchs as $match) {
                $tmp .= preg_quote(substr($pattern, $pos, $match[0][1] - $pos), '/') . '(\w+)';
                $pos    = $match[0][1] + strlen($match[0][0]); // offset + var_len
                $vars[] = $match[1][0]; // varname
            }
            $tmp .= preg_quote(substr($pattern, $pos), '/');
            $flag = preg_match_all('#^' . $tmp . '$#', $url, $values); // 匹配url
            if ($flag) {
                foreach ($vars as $k => $name) {
                    $_GET[$name] = $values[$k + 1][0];
                }

                $url = $path;
                break;
            }
        }
        return $url;
    }

    /**
     * 参数解析
     * @param  string $param 
     * @return void 写入$GET
     */
    private static function parse_param($param) {
        $len = floor(count($param) / 2);
        $i   = 0;
        while ($len--) {
            $_GET[$param[$i]] = $param[$i + 1];
            $i += 2;}
    }
}