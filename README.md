# 部署：

1. 上传源代码 设置public文件夹为运行目录。
2. 伪静态配置：`location /{     if (!-e $request_filename) {       rewrite ^/(.*)$ /index.php/$1 last;       break;     }    }  `
3. 导入数据库（test.sql） 默认用户名密码为：admin 123456