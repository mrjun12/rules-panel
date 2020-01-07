<?php
namespace poem;
class controller {
    protected $view_obj; // view 类

    /**
     * 构造函数
     */
    public function __construct() {
        $this->view_obj = new \poem\view();
    }
    
    /**
     * 展示页面
     * @param  参考 v()
     * @return void
     */
    public function view($tpl = '') {
        $this->view_obj->display($tpl);
    }

    /**
     * 执行页面并返回执行结果
     * @param  参考 fetch()
     * @return string
     */
    public function fetch($tpl = '') {
        return $this->view_obj->fetch($tpl);
    }

    /**
     * 用户变量
     * @param  参考 assign()
     * @return void
     */
    public function assign($key, $value = '') {
        $this->view_obj->assign($key, $value);
    }

    /**
     * 返回成功跳转
     * @param  参考 err_jump()
     * @return void
     */
    public function ok_jump($info, $url = '', $params = '', $second = false) {
        $this->view_obj->auto_jump($info, $url, $params, $second, 1);
    }

    /**
     * 返回失败跳转
     * @param  参考 ok_jump();
     * @return void
     */
    public function err_jump($info, $url = '', $params = '', $second = false) {
        $this->view_obj->auto_jump($info, $url, $params, $second, 0);
    }
}