![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/01.png)

![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/02.png)

![](https://raw.githubusercontent.com/Git-Lofter/rules-panel/master/img/03.png)

# 控制端部署：

1. 上传源代码 设置public文件夹为运行目录(注意，文件不包含Master文件夹)。
2. Nginx伪静态配置：
`location /{     if (!-e $request_filename) {       rewrite ^/(.*)$ /index.php/$1 last;       break;     }    }  `
Apache伪静态配置：
`
<IfModule mod_rewrite.c>
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php/$1 [QSA,PT,L]
</IfModule>

`
3. 设置定时任务
#安装curl
apt-get install curl -y
#设定定时任务（5分钟执行一次）
crontab -e
#添加定时任务，请替换网址为你自己的
*/5 * * * * curl https://网址/cron
4. 导入数据库（test.sql）数据库配置文件app/config.php  默认用户名密码为：admin 123456

# 被控端部署-Golang版(推荐):
代码和执行逻辑重构，大幅降低CPU占用情况，但是不开放源代码，仅提供编译好的文件
# 被控端部署教程-NodeJS版(此版本不推荐使用，建议使用Golang版):
推荐使用Golang版被控端，如果需要使用此版本，请自行研究！



#### #错误分析

1. 提示文件写入失败：`chown www 网站目录 -R`
2. 添加完服务器却找不到：给用户分配权限
3. 如果你的小鸡是NAT，主网卡ip应该为内网ip(通常为10.开头)
