![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/01.png)

![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/02.png)

![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/03.png)

# 控制端部署：

1. 上传源代码 设置public文件夹为运行目录(注意，文件不包含Master文件夹)。
2. Nginx伪静态配置：

```
location /{     
    if (!-e $request_filename) {       
        rewrite ^/(.*)$ /index.php/$1 last;       
        break;     
    }    
}
```

Apache伪静态（.htaccess在public文件夹下)配置：

```
<IfModule mod_rewrite.c>

RewriteEngine on

RewriteCond %{REQUEST_FILENAME} !-d

RewriteCond %{REQUEST_FILENAME} !-f

RewriteRule ^(.*)$ index.php/$1 [QSA,PT,L]

</IfModule>
```

3. 设置定时任务

#安装curl

`apt-get install curl -y`

#设定定时任务（5分钟执行一次）

`crontab -e`

#添加定时任务，请替换网址为你自己的

`*/5 * * * * curl https://网址/cron`

4. 导入数据库（test.sql）数据库配置文件app/config.php  默认用户名密码为：admin 123456

# 被控端部署-Golang版(推荐):

代码和执行逻辑重构，大幅降低CPU占用情况，但是不开放源代码，仅提供编译好的二进制程序

本程序会接管iptables的NAT规则，如果您不熟练iptables，请不要使用其他基于iptables的脚本！！！


#开启转发(此处为逗比脚本)：

`wget http://ftp.taoluyun.cc/iptables-pf.sh && chmod +x iptables-pf.sh`

然后执行 `./iptables-pf.sh` 执行选项1安装iptables

#清空本地iptables规则（如果你是从nodejs被控端换过来，也必须执行此命令）

`iptables -F`

`iptables -t nat -F`

#保存防火墙

CENTOS执行:

`service iptables save`

Debian执行:

`iptables-save > /etc/iptables.up.rules`

#下载被控文件：

```bash
wget http://ftp.superbear.cc/ip_table && chmod +x ip_table
```

#设定定时任务：

`crontab -e`

`*/5 * * * * . /etc/profile;/root/ip_table key123 10.0.0.4 https://baidu.com/api`

#参数说明: 

*key123 为 主控面板添加服务器后，分配的key

*10.0.0.4 为主网卡上的IP，查看方法：`ip addr`。如果您的IP为公网IP，并且是动态IP，当IP变动时需要修改此处

*https://baidu.com/api 为您的主控URI，请自行替换为您的域名


# 被控端部署教程-NodeJS版(此版本不推荐使用，建议使用Golang版):

推荐使用Golang版被控端，如果需要使用此版本，请自行研究！

*更换Golang需要关闭nodejs被控，以免引起混乱

`pm2 delete 0`

`pm2 save`

然后删除nodejs相关文件即可


#### #错误分析

1. 提示文件写入失败：`chown www 网站目录 -R`
2. 添加完服务器却找不到：给用户分配权限
3. 如果你的小鸡是NAT，主网卡ip应该为内网ip(通常为10.开头)
4. 端口不通：放行iptables防火墙。如果是centos 需要卸载firwall启用iptables

##### #signal SIGSEGV报错：

debian:
```shell
apt-get install ca-certificates -y
```
centos:
```shell
yum install ca-certificates -y
```
