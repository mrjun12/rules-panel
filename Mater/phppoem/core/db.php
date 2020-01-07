<?php
namespace poem;

class db {

    private static $_ins = array();

    public $_linkid = array();
    public $_conn   = null;

    protected $_cfg;
    protected $options = array(\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION, \PDO::MYSQL_ATTR_MULTI_STATEMENTS => false);

    /**
     * 获取db实例
     * @param  array $config db配置
     * @return resource $instance db实例
     */
    static function get_instance($config) {
        $key = md5(is_array($config) ? serialize($config) : $config);

        if (!isset(self::$_ins[$key]) || !(self::$_ins[$key] instanceof self)) {
            $db_obj = new self();
            $db_obj->_cfg = $config;
            if (!is_string($config) && isset($config['db_deploy']) && !empty($config['db_deploy'])) {
                $db_obj->parse_cfg();
            }
            self::$_ins[$key] = $db_obj;
        }
        
        return self::$_ins[$key];
    }

    /**
     * 初始化连接
     * @param bool $master 是否连接主节点
     * @return void
     */
    public function init_connect($master = true) {
        if (!is_string($this->_cfg) && isset($this->_cfg['db_deploy']) && !empty($this->_cfg['db_deploy'])) {
            // 采用分布式数据库, 存在主从的区别
            $this->_conn = $this->deploy_connect($master);
        } else {
            // 默认单数据库
            $this->_conn = $this->connect();
        }
    }

    /**
     * 解析配置
     * 数据配置文件，多数据库配置通过 "," 分割
     * @return void
     */
    private function parse_cfg() {
        $this->_cfg['db_user']    = explode(',', $this->_cfg['db_user']);
        $this->_cfg['db_pass']    = explode(',', $this->_cfg['db_pass']);
        $this->_cfg['db_host']    = explode(',', $this->_cfg['db_host']);
        $this->_cfg['db_port']    = explode(',', $this->_cfg['db_port']);
        $this->_cfg['db_name']    = explode(',', $this->_cfg['db_name']);
        $this->_cfg['db_charset'] = explode(',', $this->_cfg['db_charset']);
    }

    /**
     * 分布式数据配置
     * @param  bool $master 是否连接主节点
     * @return [type]          [description]
     */
    protected function deploy_connect($master = false) {
        // 分布式数据库配置解析
        $conf = $this->_cfg;

        // 数据库读写是否分离
        if ($conf['db_rw_separate']) {
            if ($master) {
                $id = mt_rand(0, $this->_cfg['db_master_num'] - 1);
            } else {
                if (is_numeric($conf['db_slave_no'])) {
                    $id = $conf['db_slave_no'];
                } else {
                    $id = mt_rand($conf['db_master_num'], count($conf['db_host']) - 1);
                }
            }
        } else { // 读写操作不区分服务器
            $id = mt_rand(0, count($conf['db_host']) - 1); // 每次随机连接的数据库
        }

        $id_config = array(
            'db_type'    => $conf['db_type'],
            'db_user'    => isset($conf['db_user'][$id]) ? $conf['db_user'][$id] : $conf['db_user'][0],
            'db_pass'    => isset($conf['db_pass'][$id]) ? $conf['db_pass'][$id] : $conf['db_pass'][0],
            'db_host'    => isset($conf['db_host'][$id]) ? $conf['db_host'][$id] : $conf['db_host'][0],
            'db_port'    => isset($conf['db_port'][$id]) ? $conf['db_port'][$id] : $conf['db_port'][0],
            'db_name'    => isset($conf['db_name'][$id]) ? $conf['db_name'][$id] : $conf['db_name'][0],
            'db_charset' => isset($conf['db_charset'][$id]) ? $conf['db_charset'][$id] : $conf['db_charset'][0],
        );
        return $this->connect($id_config, $id, $master);
    }

    /**
     * 连接数据库
     * @param  string $config 配置dsn信息
     * @param  int $linkid 连接ID,分布式数据库时不同数据库标识
     * @param  bool $reconnect 是否为重试
     * @return resource PDO类资源
     */
    private function connect($config = '', $linkid = 0, $reconnect = false) {
        if (!isset($this->_linkid[$linkid])) {
            $dsn = $this->parse_dsn($config);
            if ($dsn['char']) {
                $this->options[\pdo::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES '" . $dsn['char'] . "'";
            }

            t('poem_db_exec');
            try {
                $this->_linkid[$linkid] = new \pdo($dsn['dsn'], $dsn['user'], $dsn['pass'], $this->options);
                $time                   = number_format(T('poem_db_exec', 1) * 1000, 2);
            } catch (\PDOException $e) {
                if ($reconnect) {
                    Log::trace('ERR', $e->getMessage());
                    $this->connect($config, $linkid);
                } else {
                    throw new \Exception($e->getMessage());
                }
            }
            Log::trace('SQL', "PDO连接 [{$time}ms]");
        }
        return $this->_linkid[$linkid];
    }

    /**
     * 解析数据源名称 Data Source Name, 字符串转换为数组
     * @param  string $config dsn配置信息
     * @return array $config
     */
    private function parse_dsn($config = '') {
        if ($config == '') {
            $config = $this->_cfg;
        }

        $char = '';
        if (is_array($config)) {
            $type = $config['db_type'];
            $host = $config['db_host'];
            $port = $config['db_port'];
            $name = $config['db_name'];
            $user = $config['db_user'];
            $pass = $config['db_pass'];
            $char = $config['db_charset'];
            $dsn  = "{$type}:host={$host};port={$port};dbname={$name};charset={$char}";
        } else {
            $tmp = explode('@', $config);
            if (count($tmp) == 2) {
                list($user, $pass) = explode(':', $tmp[0]);
                $dsn               = $tmp[1];
            } else {
                $dsn = $config;
            }
        }
        return array('user' => $user, 'pass' => $pass, 'char' => $char, 'dsn' => $dsn);
    }

    /**
     * 关闭所有连接
     * @return void
     */
    public function close() {
        $this->_conn = null;
    }

    /**
     * 开启事务
     * @return bool 成功/失败
     */
    public function begintransaction() {
        return $this->_conn->begintransaction();
    }

    /**
     * 回滚
     * @return void
     */
    public function rollback() {
        return $this->_conn->rollback();
    }

    /**
     * 提交事务
     * @return void
     */
    public function commit() {
        return $this->_conn->commit();
    }

    /**
     * 执行sql语句
     * @param  string $sql
     * @return bool
     */
    public function exec($sql) {
        T('poem_db_exec');
        try {
            $re = $this->_conn->exec($sql);
            T('poem_db_exec', 0);
            return $re;
        } catch (\PDOException $e) {
            $this->error($e, $sql);
        }
    }

    /**
     * 执行sql查询
     * @param  string $sql
     * @param  array $bind 参数绑定
     * @return array $ret 二维查询结果
     */
    public function select($sql, $bind) {
        return $this->execute($sql, $bind, 'select');
    }

    /**
     * 执行sql插入
     * @param  string $sql
     * @param  array $bind 参数绑定
     * @return int $id 主键ID
     */
    public function insert($sql, $bind) {
        return $this->execute($sql, $bind, 'insert');
    }

    /**
     * 执行sql更新
     * @param  string $sql
     * @param  array $bind 参数绑定
     * @return int $count 影响行数
     */
    public function update($sql, $bind) {
        return $this->execute($sql, $bind, 'update');
    }

    /**
     * 执行sql删除
     * @param  string $sql
     * @param  array $bind 参数绑定
     * @return int $count 影响行数
     */
    public function delete($sql, $bind) {
        return $this->execute($sql, $bind, 'delete');
    }

    /**
     * 执行sql语句
     * @param  string $sql
     * @param  array $bind 参数绑定
     * @param  string $flag 增删改查标记
     * @return mixed 查为数组/增为bool/删该为影响行数
     */
    private function execute($sql, $bind, $flag = '') {
        T('poem_db_exec');
        try {
            $pre = $this->_conn->prepare($sql);
            if (!$pre) {
                $this->error($this->_conn, $sql);
            }

            foreach ($bind as $k => $v) {
                $pre->bindValue($k, $v);
            }

            $re = $pre->execute();
            if (!$re) {
                $this->error($pre, $sql);
            }

            T('poem_db_exec', 0);
            switch ($flag) {
                case 'insert':return $this->_conn->lastInsertId();
                    break;
                case 'update':return $pre->rowCount();
                    break;
                case 'delete':return $pre->rowCount();
                    break;
                case 'select':return $pre->fetchAll(\PDO::FETCH_ASSOC);
                    break;
                default:break;
            }
        } catch (\PDOException $e) {
            $this->error($e, $sql);
        }
    }

    /**
     * 抛出异常
     * @param class $e PDOException
     * @param string $sql
     * @return class $Exception
     */
    private function error($e, $sql) {
        throw new \Exception(implode(', ', $e->errorInfo) . "\n [SQL 语句]：" . $sql);
    }

    /**
     * 析构函数
     * @return void
     */
    public function __destruct() {
        $this->_linkid = null;
        $this->_conn   = null;
    }
}