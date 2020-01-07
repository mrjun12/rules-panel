<?php
namespace poem;
class log {
    const FATAL = 1;
    const ERR   = 2;
    const WARN  = 3;
    const INFO  = 4;
    const DEBUG = 5;

    private $levels = array(
        self::FATAL => 'FATAL',
        self::ERR => 'ERR',
        self::WARN => 'WARN',
        self::INFO => 'INFO',
        self::DEBUG => 'DEBUG',
    );

    private static $instance;

    protected $log_level;
    protected $log_remain_days;
    protected $log_dir;
    protected $log_file;

    private static $trace = array(); // 页面展示日志信息

    /**
     * 构造文件
     * @param array $cfg log_* 配置
     */
    function __construct($cfg) {
        $this->log_level = $cfg['log_level'];
        $this->log_remain_days = $cfg['log_remain_days'];
        $this->set_log_file($cfg['log_path']);
    }

    /**
     * 单例模式使用log
     * @return log类
     */
    static function get_instance() {
        if (is_null(self::$instance)) {
            self::$instance = new \poem\log(config());
        }
        return self::$instance;
    }

    /**
     * 写入日志
     * @param string $str 日志信息
     * @param string $lvl 日志级别
     * @param string $depth 深度，用于反查哪个文件打的日志
     * @return null
     */
    public function write($str, $lvl, $depth = 0) {
        if ($lvl > $this->log_level) {
            return;
        }
        // 减少内存消耗，忽略参数
        if (defined('DEBUG_BACKTRACE_IGNORE_ARGS')) {
            $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, $depth + 2);
        }else{
            $trace = debug_backtrace();
        }

        $cur_file = isset($trace[$depth]['file']) ? $trace[$depth]['file'] : '';
        $cur_line = isset($trace[$depth]['line']) ? $trace[$depth]['line'] : '';
        
        $level = $this->levels[$lvl];
        $time = date('Y-m-d H:i:s');
        $log = "[$level] $time $cur_file:$cur_line $str" . PHP_EOL;

        self::trace('LOG', $log);
        file_put_contents($this->log_file, $log, FILE_APPEND);
    }

    /**
     * 设置日志文件
     * 通过 config.php 'log_path' 设置日志路径
     * 日志是按小时为文件名切割的，保留时间见 $this->clean_log()
     * @param string $log_dir 日志保存目录
     * @return void
     */
    private function set_log_file($log_dir) {
        if (empty($log_dir)) {
            $log_dir = APP_RUNTIME_PATH . 'log';
        }
        $log_dir .= '/' . POEM_MODULE;
        if (!is_dir($log_dir)) {
            mkdir($log_dir, 0755, true);
        }
        
        $this->log_dir = $log_dir;
        $filename = date('YmdH') . '.log';
        $this->log_file = $log_dir . '/' . $filename;
    }

    /**
     * 清理日志，默认保留 1 天
     * 通过 config.php 'log_remain_days' 设置日志保留天数
     * @return void
     */
    private function clean_log() {
        $dh = opendir($this->log_dir);
        if (!$dh) {
            return;
        }
        while (false !== ($file = readdir($dh))) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            $fullpath = $this->log_dir . '/' . $file;
            if (is_dir($fullpath)) {
                continue;
            }
            $file_date = substr($file, 0, -6); // date('YmdH').log
            $cur_date = date('Ymd');

            $days = $cur_date - $file_date;
            if ($this->log_remain_days < $days) {
                unlink($fullpath);  ////删除文件
            }
        }
        closedir($dh); 
    }

    /**
     * 日志追踪，页面查看
     * @param string $key 键
     * @param string $value 值
     * @return null
     */
    static function trace($key, $value) {
        if (!config('debug_trace')) {
            return;
        }

        if (isset(self::$trace[$key]) && count(self::$trace[$key]) > 50) {
            return;
        }

        self::$trace[$key][] = $value;
    }

    /**
     * 请求结束,由框架保存
     * @return null
     */
    static function show() {
        self::get_instance()->clean_log();

        $trace_tmp = self::$trace;
        $files     = get_included_files();
        foreach ($files as $key => $file) {
            $files[$key] = $file . ' ( ' . number_format(filesize($file) / 1024, 2) . ' KB )';
        }
        $cltime           = T('POEM_TIME', -1);
        $trace_tmp['SYS'] = array(
            '请求信息' => $_SERVER['REQUEST_METHOD'] . ' ' . strip_tags($_SERVER['REQUEST_URI']) . ' ' . $_SERVER['SERVER_PROTOCOL'] . ' ' . date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']),
            '总吞吐量' => number_format(1 / $cltime, 2) . ' req/s',
            '总共时间' => number_format($cltime, 5) . ' s',
            '框架加载' => number_format(($cltime - T('POEM_EXEC_TIME', -1)), 5) . ' s (func:' . number_format(T('POEM_FUNC_TIME', -1) * 1000, 2) . 'ms conf:' . number_format(T('POEM_CONF_TIME', -1) * 1000, 2) . 'ms route:' . number_format(T('POEM_ROUTE_TIME', -1) * 1000, 2) . 'ms)',
            'App时间' => number_format(T('POEM_EXEC_TIME', -1), 5) . ' s (compile:' . number_format(T('POEM_COMPILE_TIME', -1) * 1000, 2) . ' ms)',
            '内存使用' => number_format(memory_get_usage() / 1024 / 1024, 5) . ' MB',
            '文件加载' => count($files),
            '会话信息' => 'SESSION_ID=' . session_id(),
        );

        $trace_tmp['FILE'] = $files;

        $arr = array(
            'SYS'  => '基本',
            'FILE' => '文件',
            'ERR'  => '错误',
            'SQL'  => '数据库',
            'LOG'  => '日志',
        );
        foreach ($arr as $key => $value) {
            $num = 50;
            $len = 0;
            if (is_array($trace_tmp[$key]) && ($len = count($trace_tmp[$key])) > $num) {
                $trace_tmp[$key] = array_slice($trace_tmp[$key], 0, $num);
            }
            $trace[$value] = $trace_tmp[$key];
            if ($len > $num) {
                $trace[$value][] = "...... 共 $len 条";
            }

        }
        $totalTime = number_format($cltime, 3);
        include CORE_PATH . 'tpl/trace.php';
    }
}
