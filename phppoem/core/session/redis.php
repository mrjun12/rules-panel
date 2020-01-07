<?php
namespace poem\session;
class redis extends \sessionHandler {
    protected $maxtime = '';
    protected $table   = '';

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
     * 关闭session
     * @return bool
     */
    public function close() {
        return true;
    }

    /**
     * 获取sesseion_id
     * @param  string $session_id
     * @return array $session
     */
    public function read($session_id) {
        return redis()->get($this->table . $session_id);
    }

    /**
     * 存储session
     * @param  string $session_id
     * @param  array $session_data
     * @return bool
     */
    public function write($session_id, $session_data) {
        return redis()->setex($this->table . $session_id, $this->maxtime, $session_data);
    }

    /**
     * 销毁session
     * @param  string $session_id
     * @return bool
     */
    public function destroy($session_id) {
        return redis()->del($this->table . $session_id);
    }

    /**
     * 销毁session
     * @param  int $maxlifetime
     * @return bool
     */
    public function gc($maxlifetime) {
        return true;
    }
}