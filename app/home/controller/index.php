<?php
namespace home\controller;
class index{

    public function index(){
        $this->isLogin();
    }

    public function isLogin(){
        $u = cookie('username');
        $p = md5(cookie('password'));

        $isuser = m('user')->where(['username' => $u, 'password' => $p])->find();

        if(isset($u) || isset($p) || $isuser)
            header("location:list");
        else{
            cookie('username', null);
            cookie('password', null);
            header("location:login");
        }

    }

    public function logout(){
        cookie('username', null);
        cookie('password', null);
        header("location:login");
    }

    public function auth($update = 0){

        $info = $this->getAuth();

        if($update or $info['day'] != date('d',time()) or $info['domain'] != $_SERVER['HTTP_HOST']){
            try {
                $status = 0;
                if($this->post(['operate' => 'getStatus', 'domain' => $_SERVER['HTTP_HOST']])) $status = 1;
            } catch (Exception $e){
                
            }
        }
        $newinfo = [
            'day' => date('d',time()),
            'domain' => $_SERVER['HTTP_HOST'],
            'status' => $status
        ];

        $newinfo = json_encode($newinfo);
        $newinfo = base64_encode($newinfo);
        
        $authfile = fopen("auth.txt", "w") or die("检查写入权限!");
        fwrite($authfile, $newinfo);
        fclose($authfile);

    }

    public function post( $post = [ ] ){
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, 'http://auth.inwang.net/api.php');
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $post);
        $result = curl_exec($curl);
        curl_close($curl);
        return $result;
    }

    public function getAuth(){

        $info = file_get_contents("auth.txt");

        if(isset($info)){
            $info = base64_decode($info);
            $info = json_decode($info,true);
        }else{
            $info = [
                'day' => 0,
                'domain' => '',
                'status' => 0
            ];
        }

        return $info;
    }

    public function cron(){

        //更新服务器ip
        $lists = m('server_list')->select();
        foreach ($lists as $v) {

            if(!$v['server_cname']) continue;

            $server_ip = gethostbyname($v['server_cname']);  

            if($server_ip == $v['server_cname']) continue;

            $update = [
                'server_ip' => $server_ip
            ];

            m('server_list')->where([ 'id' => $v['id'] ])->update($update);
        }

        //更新rules ip

        $lists = m('server_rules')->select();

        foreach ($lists as $v) {

            if(!$v['remote_cname']) continue;

            $remote_ip = gethostbyname($v['remote_cname']);  

            if(!$remote_ip) continue;

            $update = [
                'remote_ip' => $remote_ip
            ];

            m('server_rules')->where([ 'id' => $v['id'] ])->update($update);
        }

        $res['ret'] = 1;
        echoJson($res);
    }

    public function api(){
        //传入Key
        $key = $_GET['key'];

        $server = m('server_list')->where([ 'server_key' => $key ])->find();
        $rules = m('server_rules')->field("local_port,remote_ip,remote_port")->where([ 'server_id' => $server['id'], 'enable' => 1 ])->select();

        m('server_rules')->where([ 'server_id' => $server['id'] ])->update([ 'status' => 1 ]);
        if(!$server)
            $ret['msg'] = 'error';
        elseif(!count($rules))
            $ret['msg'] = 'clear';
        else{
            $ret['msg'] = 'rules';
            $ret['rules'] = $rules;
        }

        echoJson($ret);
    }

    

    public function viewtest(){
    	$info = 'Welcome to Use Phppoem !';

    	assign('varname', $info);// 传递数据到view
    	// 展示view  默认当前方法名视图
    	// app/模块/view/控制器/方法.html 即
    	// app/home/view/index/viewtest.html
    	v();
    }

    public function addLog( $type , $sid){

        $user = $this->getUser();
        $data = m('server_rules')->where(['id' => $sid])->find();
        unset($data['id']);
        unset($data['status']);
        unset($data['enable']);
        $data['user_id'] = $user['id'];
        $data['username'] = $user['username'];
        $data['doing_type'] = $type;
        m('rules_log')->insert($data);

    }

    public function addSLog( $type , $sid){

        $user = $this->getUser();
        $name = m('server_list')->where(['id' => $sid])->find()['name'];

        $data = [
            'user_id' => $user['id'],
            'user_name' => $user['username'],
            'doing_type' => $type,
            'server_name' => $name
        ];

        m('server_log')->insert($data);

    }



    public function admin_user(){
        $user = $this->getUser(1);
        $user_list = m('user')->select();
        assign('user_list', $user_list);
        v();
    }

    public function admin_server(){
        $user = $this->getUser(1);
        $server_list = m('server_list')->select();
        assign('server_list', $server_list);
        v();
    }

    public function login(){
        v();
    }

    public function rules_log(){
        $user = $this->getUser();
        $lists = m('user_server')->where(['user_id' => $user["id"]])->select();
        $server_id = $_GET["id"]?:$lists[0]['server_id'];
        $is_server = m('user_server')->where(['server_id' => $server_id, 'user_id' => $user["id"]])->find();
        $pages = $_GET['pages']?:1;
        $start = ($pages-1)*20;
        $end = $pages*20;

        $time = explode('|', $_GET['time']);

        if(count($lists) and $is_server){
            $server_list = [];
            
            foreach ($lists as $v) {
                $server_list[] = m('server_list')->where(['id' => $v["server_id"]])->find();
            }

            $where = ['server_id' => $server_id];

            if(count($time) == 2)
                $where['date_time'] = [ 'between', [$time[0],$time[1]] ];

            $log_list = m('rules_log')->order('id desc')->limit($start,$end)->where($where)->select();

            assign('server_id', $server_id);
            assign('start', $time[0]);
            assign('end', $time[1]);
            assign('list', $server_list);
            assign('log_list', $log_list);
            assign('pages', $pages);
        }
        v();
    }

    public function server_log(){
        $user = $this->getUser(1);

        $pages = $_GET['pages']?:1;
        $start = ($pages-1)*20;
        $end = $pages*20;

        $time = explode('|', $_GET['time']);

        $where = ['user_id' => $user['id']];

        if(count($time) == 2)
            $where['date_time'] = [ 'between', [$time[0],$time[1]] ];

        $log_list = m('server_log')->order('id desc')->limit($start,$end)->where($where)->select();

        assign('start', $time[0]);
        assign('end', $time[1]);
        assign('log_list', $log_list);
        assign('pages', $pages);

        v();
    }

    public  function getUser($isadmin = 0){
        $u = cookie('username');
        $p = cookie('password');

        $user = m('user')->where(['username' => $u, 'password' => $p])->find();

        if( !isset($u) or !isset($p) or !isset($user) ){
            header("location:login");
            exit(1);
        }

        if( !$user['admin'] and $isadmin ) exit(1);
        return $user;
    }

    public function loginajax(){
        
        $u = $_POST["username"];
        $p = md5($_POST["password"]);

        $isuser = m('user')->where(['username' => $u, 'password' => $p])->find();
        if($isuser){
            $this->auth();
            cookie('username', $u);
            cookie('password', $p);
            $ret["ret"] = 1;
        }
        else{
            $ret["ret"] = 0;
            $ret["message"] = "用户名或密码错误！";
        }
        echoJson($ret);
        
    }

    public function list(){
        $user = $this->getUser();
        assign('user', $user);

        v();
        
    }

    public function main(){

        if($_GET['updateAuth']) $this->auth(1);

        $user = $this->getUser();
        $user_count = m('user')->count();

        $auth = $this->getAuth();

        $authinfo = $auth['status']?'已授权':'未授权';
        if($user['admin']){
            
            $server_count = m('server_list')->count();
            $rules_count = m('server_rules')->count();
        }else{
            $server_list = m('user_server')->where(['user_id'=>$user['id']])->select();
            $rules_count = 0;
            foreach ($server_list as $v) {
                $rules_count += m('server_rules')->where(['server_id'=>$v['id']])->count();
            }
            $server_count = count($server_list);
        }
        assign('authinfo', $authinfo);
        assign('user_count', $user_count);
        assign('server_count', $server_count);
        assign('rules_count', $rules_count);

        v();
        
    }

    public function servers(){
        echo "test";
    }

    public function rules(){
        $user = $this->getUser();
        $lists = m('user_server')->where(['user_id' => $user["id"]])->select();
        $server_id = $_GET["id"]?:$lists[0]['server_id'];
        $is_server = m('user_server')->where(['server_id' => $server_id, 'user_id' => $user["id"]])->find();
        if(count($lists) and $is_server){
            $server_list = [];
            
            foreach ($lists as $v) {
                $server_list[] = m('server_list')->where(['id' => $v["server_id"]])->find();
            }

            $rule_list = m('server_rules')->where(['server_id' => $server_id])->select();

            $server_key = m('server_list')->where(['id' => $server_id])->find()['server_key'];

            assign('server_id', $server_id);
            assign('rule_list', $rule_list);
            assign('list', $server_list);
            assign('server_key', $server_key);
        }
        
        v();
    }
    public function addrules(){
        v();
    }

    public function addusers(){
        v();
    }

    public function addserver(){
        v();
    }

    public function editusers(){
        $this->getUser(1);
        $id = $_GET['id'];
        $user = m('user')->where([ 'id' => $id ])->find();
        assign('user', $user);
        v();
    }

    public function editserver(){
        $this->getUser(1);
        $id = $_GET['id'];
        $server = m('server_list')->where([ 'id' => $id ])->find();
        assign('server', $server);
        v();
    }

    public function power_edit(){
        $u = $this->getUser();
        $id = $_GET['id'];
        $server_list = m('server_list')->select();
        $power_list = m('user_server')->where([ 'user_id' => $id ])->select();

        $show_list = [];

        foreach ($server_list as $v) {

            $is_show = false;
            foreach ($power_list as $value)
                if( $v['id'] == $value['server_id'])
                    $is_show = true;
            $show_list[] = [ 'name' => $v['name'] , 'is_show' => $is_show , 'id' => $v['id'] ];

        }
        assign('show_list', $show_list);
        v();
    }

    public function editrules(){
        $user = $this->getUser();
        $id = $_GET['rule'];
        $rule = m('server_rules')->where([ 'id' => $id ])->find();
        assign('rule', $rule);
        v();
    }

    public function rulesajax(){

        $user = $this->getUser();

        $local_port = $_POST['local_port'];
        $remote_port = $_POST['remote_port'];
        $remote_cname = $_POST['remote_cname'];
        $remote_ip = $_POST['remote_ip'];
        $remark = $_POST['remark'];
        $id = $_POST['id'];
        //判断 remote_cname 和 remote_ip都不为空
        if(!$remote_cname && !$remote_ip){
            $ret = [
                'ret' => 0,
                'message' => '错误：域名&IP都为空！'
            ];
            echoJson($ret);
            return;
        }
        //如果域名不为空则进行判断域名是否正确

        if($remote_cname){
            $server_ip1 = gethostbyname($remote_cname);
            if($server_ip1 == $remote_cname){
                $ret = [
                    'ret' => 0,
                    'message' => 'DDNS_解析错误，请检查！'
                ];
                echoJson($ret);
                return;
            }
        }
        
        //如果IP不为空则进行判断IP是否正确
        if($remote_ip && !filter_var($remote_ip, FILTER_VALIDATE_IP)){
            $ret = [
                'ret' => 0,
                'message' => '错误：请输入标准IPv4'
            ];
            echoJson($ret);
            return;
        }
        
        //判断端口是否正确

        if(!is_numeric($local_port)||strpos($local_port,".")!==false){
            $ret = [
                'ret' => 0,
                'message' => '错误：监听端口错误'
            ];
            echoJson($ret);
            return;
          }else{
            if($local_port>0 && $local_port<=65535){
                //return true;
            }else{
                $ret = [
                    'ret' => 0,
                    'message' => '错误：监听端口错误'
                ];
                echoJson($ret);
                return;
            }
          }
        
          if(!is_numeric($remote_port)||strpos($remote_port,".")!==false){
            $ret = [
                'ret' => 0,
                'message' => '错误：远程端口错误'
            ];
            echoJson($ret);
            return;
          }else{
            if($remote_port>0 && $remote_port<=65535){
                //return true;
            }else{
                $ret = [
                    'ret' => 0,
                    'message' => '错误：远程端口错误'
                ];
                echoJson($ret);
                return;
            }
          }
        

        
        //解析IP
        if(!$remote_ip){
            $server_ip = gethostbyname($remote_cname);
            if($server_ip == $remote_cname){
                $ret = [
                    'ret' => 0,
                    'message' => 'DDNS解析错误，请检查！'
                ];
                echoJson($ret);
                return;
            }else{
                $remote_ip = $server_ip;
            }
        }


        $where = [
            'server_id' => $id,
            'local_port' => $local_port,
            'enable' => 1
        ];
        
        if(!m('server_rules')->where($where)->find() and m('user_server')->where([ "user_id" => $user['id'] , "server_id" => $id])->find() and isset($local_port) and isset($remote_port) and isset($remote_cname) and isset($remote_ip) and isset($id)){

            $data = [
                'local_port'=> $local_port,
                'remote_port' => $remote_port,
                'remote_cname' => $remote_cname,
                'remote_ip' => $remote_ip,
                'server_id' => $id,
                'status' => 0,
                'remark' => $remark
            ];

            $id = m('server_rules')->insert($data);
            $this->addLog(0,$id);

            $ret['ret'] = 1;

        }else{
            $ret = [
                'ret' => 0,
                'message' => '端口冲突或信息错误。'
            ];
        }

        echoJson($ret);

    }

    public function power_ajax(){
        $user = $this->getUser(1);
        $id = $_POST['id'];
        $operate = $_POST['operate'];
        $user_id = $_POST['user_id'];
        if($operate){
            if(!m('user_server')->where([ 'user_id' => $user_id , 'server_id' => $id ])->find())
                m('user_server')->insert([ 'user_id' => $user_id , 'server_id' => $id ]);
        }else{
            m('user_server')->where([ 'server_id' => $id ])->delete();
        }
        $ret['ret'] = 1;
        echoJson($ret);
    }

    public function serverajax(){

        $user = $this->getUser(1);

        $name = $_POST['name'];
        $server_ip = $_POST['server_ip'];
        $server_cname = $_POST['server_cname'];
        $server_port = $_POST['server_port'];
        $remark = $_POST['remark'];

        $server_key = rand_str();

        if( isset($name) ){

            $data = [
                "name" => $name,
                "server_cname" => $server_cname,
                "server_port" => $server_port,
                "server_ip" => $server_ip,
                "remark" => $remark,
                "server_key" => $server_key
            ];


            $id = m('server_list')->insert($data);
            $this->addSLog(0,$id);

            $ret['ret'] = 1;

        }else{
            $ret = [
                'ret' => 0,
                'message' => '信息错误。'
            ];
        }

        echoJson($ret);
    }

    public function usersajax(){

        $user = $this->getUser(1);

        $username = $_POST['username'];
        $password = md5($_POST['password']);

        

        if( isset($username) and isset($password) and !m('user')->where([ 'username' => $username ])->find()){

            $data = [
                'username' => $username,
                'password' => $password
            ];

            $id = m('user')->insert($data);

            $ret['ret'] = 1;

        }else{
            $ret = [
                'ret' => 0,
                'message' => '信息错误。'
            ];
        }

        echoJson($ret);

    }

    public function editrulesajax(){

        $user = $this->getUser();

        $local_port = $_POST['local_port'];
        $remote_port = $_POST['remote_port'];
        $remote_cname = $_POST['remote_cname'];
        $remote_ip = $_POST['remote_ip'];
        $id = $_POST['id'];
        $rule = $_POST['rule'];
        $remark = $_POST['remark'];

        //判断 remote_cname 和 remote_ip都不为空
        if(!$remote_cname && !$remote_ip){
            $ret = [
                'ret' => 0,
                'message' => '错误：域名&IP都为空！'
            ];
            echoJson($ret);
            return;
        }
        //如果域名不为空则进行判断域名是否正确

        if($remote_cname){
            $server_ip1 = gethostbyname($remote_cname);
            if($server_ip1 == $remote_cname){
                $ret = [
                    'ret' => 0,
                    'message' => 'DDNS_解析错误，请检查！'
                ];
                echoJson($ret);
                return;
            }
        }
        
        //如果IP不为空则进行判断IP是否正确
        if($remote_ip && !filter_var($remote_ip, FILTER_VALIDATE_IP)){
            $ret = [
                'ret' => 0,
                'message' => '错误：请输入标准IPv4'
            ];
            echoJson($ret);
            return;
        }
        
        //判断端口是否正确

        if(!is_numeric($local_port)||strpos($local_port,".")!==false){
            $ret = [
                'ret' => 0,
                'message' => '错误：监听端口错误'
            ];
            echoJson($ret);
            return;
          }else{
            if($local_port>0 && $local_port<=65535){
                //return true;
            }else{
                $ret = [
                    'ret' => 0,
                    'message' => '错误：监听端口错误'
                ];
                echoJson($ret);
                return;
            }
          }
        
          if(!is_numeric($remote_port)||strpos($remote_port,".")!==false){
            $ret = [
                'ret' => 0,
                'message' => '错误：远程端口错误'
            ];
            echoJson($ret);
            return;
          }else{
            if($remote_port>0 && $remote_port<=65535){
                //return true;
            }else{
                $ret = [
                    'ret' => 0,
                    'message' => '错误：远程端口错误'
                ];
                echoJson($ret);
                return;
            }
          }
        

        
        //解析IP
        if(!$remote_ip){
            $server_ip = gethostbyname($remote_cname);
            if($server_ip == $remote_cname){
                $ret = [
                    'ret' => 0,
                    'message' => 'DDNS解析错误，请检查！'
                ];
                echoJson($ret);
                return;
            }else{
                $remote_ip = $server_ip;
            }
        }



        $where = [
            'server_id' => $id,
            'local_port' => $local_port,
            'id' => ['!=',$rule],
            'enable' => 1
        ];
        
        if(!m('server_rules')->where($where)->find() and m('user_server')->where([ "user_id" => $user['id'] , "server_id" => $id])->find() and isset($local_port) and isset($remote_port) and isset($remote_cname) and isset($remote_ip) and isset($id)){

            $update = [
                'local_port' => $local_port,
                'remote_port' => $remote_port,
                'remote_cname' => $remote_cname,
                'remote_ip' => $remote_ip,
                'remark' => $remark
            ];

            m('server_rules')->where([ 'id' => $rule ])->update($update);

            $this->addLog(1,$rule);

            $ret['ret'] = 1;

        }else{
            $ret = [
                'ret' => 0,
                'message' => '端口冲突或信息错误。'
            ];
        }

        echoJson($ret);

    }

    public function editusersajax(){

        $user = $this->getUser(1);

        $password = md5($_POST['password']);
        $id = $_POST['id'];

        if( isset($password) ){

            $data = [
                'password' => $password
            ];

            $id = m('user')->where([ 'id' => $id ])->update($data);

            $ret['ret'] = 1;

        }else{
            $ret = [
                'ret' => 0,
                'message' => '信息错误。'
            ];
        }

        echoJson($ret);

    }

    public function enableajax(){

        $user = $this->getUser();

        $id = $_POST['id'];
        $enable = $_POST['enable'];

        $rule = m('server_rules')->where(['id'=>$id])->find();
        $server_id = $rule['server_id'];
        $local_port = $rule['local_port'];
        $where = [
            'server_id' => $server_id,
            'local_port' => $local_port,
            'id' => ['!=',$id],
            'enable' => 1
        ];

        if((!m('server_rules')->where($where)->find() or !$enable ) and m('user_server')->where([ "user_id" => $user['id'] , "server_id" => $server_id])->find() ){

            $update = [
                'enable' => $enable
            ];

            m('server_rules')->where([ 'id' => $id ])->update($update);

            $this->addLog(1,$id);

            $ret['ret'] = 1;

        }else{
            $ret = [
                'ret' => 0,
                'message' => '端口冲突或信息错误。'
            ];
        }

        echoJson($ret);

    }

    public function adminajax(){
        $this->getUser(1);

        $id = $_POST['id'];
        $admin = $_POST['admin'];

        $update = [
            'admin' => $admin
        ];

        m('user')->where([ 'id' => $id ])->update($update);

        $ret['ret'] = 1;

        echoJson($ret);

    }

    public function editserverajax(){
        $this->getUser(1);
        $id = $_POST['id'];
        $name = $_POST['name'];
        $server_cname = $_POST['server_cname'];
        $server_ip = $_POST['server_ip'];
        $server_port = $_POST['server_port'];
        $remark = $_POST['remark'];

        $update = [
            "name" => $name,
            "server_cname" => $server_cname,
            "server_ip" => $server_ip,
            "server_port" => $server_port,
            "remark" => $remark,
            "id" => $id
        ];

        m('server_list')->where([ 'id' => $id ])->update($update);
        $this->addSLog(1,$id);

        $ret['ret'] = 1;

        echoJson($ret);

    }

    public function rulesdelete(){

        $user = $this->getUser();

        $data = $_POST['data'];
        $data = explode(',', $data);
        if($data[0] == 'on') unset($data[0]);

        foreach ($data as $v) {
            m('server_rules')->where(['id'=>$v])->delete();
            $this->addLog(2,$v);
        }
        echoJson(['ret'=>1]);
    }

    

    public function usersdelete(){

        $user = $this->getUser(1);

        $data = $_POST['data'];
        $data = explode(',', $data);
        if($data[0] == 'on') unset($data[0]);

        foreach ($data as $v) {
            m('user')->where([ 'id' => $v ])->delete();
            m('user_server')->where([ 'user_id' => $v ])->delete();
        }
        echoJson(['ret'=>1]);
    }

    public function serverdelete(){

        $user = $this->getUser(1);

        $data = $_POST['data'];
        $data = explode(',', $data);
        if($data[0] == 'on') unset($data[0]);

        foreach ($data as $v) {
            m('server_list')->where(['id'=>$v])->delete();
            $this->addSLog(2,$v);
            m('server_rules')->where([ 'server_id' => $v ])->delete();
            m('user_server')->where([ 'server_id' => $v ])->delete();
        }

        echoJson(['ret'=>1]);
    }



public function portTest($port){
    if(!is_numeric($port)||strpos($port,".")!==false){
        return false;
      }else{
        if($port>0 && $port<=65535){
            return true;
        }else{
            return false;
        }
      }
  }

}