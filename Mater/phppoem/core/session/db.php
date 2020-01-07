<?php
namespace poem\session;

/**
 * session存入数据库
 * 数据库方式session驱动, sql语句：
CREATE TABLE session (
session_id varchar(255) NOT NULL,
session_expire int(11) NOT NULL,
session_data blob,
UNIQUE KEY `session_id` (`session_id`)
);
 */

class db extends \sessionhandler {

    protected $maxtime = ''; // 最大保存时间

    protected $table = ''; // session存储表名

    /**
     * 开启session 进行初始化
     * @param  string $save_path 不使用，但必须继承
     * @param  string $session_id 不使用，但必须继承
     * @return bool
     */
    public function open($save_path, $session_id) {
        $this->maxtime = ini_get('session.gc_maxlifetime');
        $this->table   = config('session_table') ?: "session";
        return true;
    }

    /**
     * 关闭session 进行gc
     * @return bool
     */
    public function close() {
        $this->gc($this->maxtime);
        return true;
    }

    /**
     * 获取sesseion_id
     * @param  string $session_id
     * @return array $session
     */
    public function read($session_id) {
        $re = m($this->table)->field('session_data')->where(['session_id' => $session_id, 'session_expire' => ['>', time()]])->find();
        return $re['session_data'];
    }

    /**
     * 存储session
     * @param  string $session_id
     * @param  array $session_data
     * @return bool
     */
    public function write($session_id, $session_data) {
        $map  = array('session_id' => $session_id);
        $data = array(
            'session_data'   => $session_data,
            'session_expire' => time() + $this->maxtime,
        );
        if (m($this->table)->where($map)->find()) {
            $re = m($this->table)->where($map)->update($data);
        } else {
            $re = m($this->table)->insert(array_merge($map, $data));
        }
        return $re ? true : false;
    }

    /**
     * 销毁session
     * @param  string $session_id
     * @return bool
     */
    public function destroy($session_id) {
        $re = m($this->table)->where(['session_id' => $session_id])->delete();
        return $re ? true : false;
    }

    /**
     * 销毁session
     * @param  int $maxlifetime
     * @return bool
     */
    public function gc($maxlifetime) {
        $maxtime = time() + $maxlifetime;
        $re      = m($this->table)->where(['session_expire' => ['<', $maxtime]])->delete();
        return $re ? true : false;
    }
}
