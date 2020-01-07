![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/01.png)

![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/02.png)

![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/03.png)

# 控制端部署：

1. 上传源代码 设置public文件夹为运行目录。
2. 伪静态配置：`location /{     if (!-e $request_filename) {       rewrite ^/(.*)$ /index.php/$1 last;       break;     }    }  `
3. 设置cron定时任务  https://网址/corn (5分钟一次)
4. 导入数据库（test.sql） 默认用户名密码为：admin 123456

# 被控端部署:

#被控端安装教程（转发机器）
#被控端安装很简单，被控端会接管iptables的NAT规则，其他NAT命令会失效
#请勿安装其他基于iptables的ddns转发脚本

#安装nodejs最新版（centos）

`yum install epel-* -y`

`yum install nodejs -y`

`npm install n -g`

`n latest`

`npm install pm2 -g`

#安装nodejs最新版（debian）

`curl -sL https://deb.nodesource.com/setup_9.x | sudo bash - apt-get install nodejs`

`npm install pm2 -g`

#nodejs和pm2安装结束

#pm2开机自启

`pm2 startup`

#新建文件夹iptables_forward

`mkdir iptables_forward`

#将 app.js、package.json两个文件放进去

#修改app.js文件，如下三处，保存

​	`const master_url = "https://baidu.com"  #填写Master URL`

​	`const slave_key = '123456'; #填写节点key`

​	`const nic_ip = '1.1.1.1'; #主网卡上的IP（如果主网卡IP=公网IP时，当IP变动，需更新此处IP，并且重启本进程！！！）`



*Mater URL是主控的网址

*key是主控添加服务器后生成的

*主网卡IP查看方法：`ip addr`

#然后在该文件夹下执行

`npm install` 

#安装iptables转发（逗比转发脚本）

`wget http://ftp.inwang.net/iptables-pf.sh && chmod +x iptables-pf.sh`

#执行iptables转发脚本，执行第一个选项安装iptables

#启动

`pm2 start app.js`

#开机自启

`pm2 save`

#********到此安装结束，可以愉快地使用了

##### #其他命令

`pm2 list`       #查询

`pm2 logs 0`  #查询日志

`pm2 stop 0` #暂停

`pm2 flush`   #清除日志

`reboot`         #重启服务器 