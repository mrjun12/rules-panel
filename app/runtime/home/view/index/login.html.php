<?php if (!defined('POEM_PATH')) exit();?><?php if (!defined('POEM_PATH')) exit();?><!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>管理系统</title>
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="wcodeth=device-wcodeth, initial-scale=1, maximum-scale=1">
    <link rel="stylesheet" href="/themes/jeui/css/jeui.css"  media="all">
    <link rel="stylesheet" href="/themes/jeui/css/admin.css"  media="all">
    <link href="/themes/jeui/css/skin/jebox.css" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="/themes/jeui/css/gload.css"  media="all">
    <script type="text/javascript" src="/themes/jeui/js/modules/jeui.js"></script>
    
    <link rel="stylesheet" href="/themes/jeui/css/skin/jedate.css"  media="all">
</head>
<body class="loginbox">
    <div class="je-login"></div>
    <div class="je-logincon">
        <div class="logo"></div>
        <p class="logtext">欢迎登录后台管理系统</p>
        <p class="je-pb10"><input class="userinp" type="text" id="user" placeholder="请输入用户名"></p>
        <p class="je-pb10"><input class="userinp" type="password" id="pass" placeholder="请输入密码"></p>
        <p class="je-pt10"><input class="userbtn" type="button" value="确 认 登 录" onclick="gosys()"></p>
    </div>
<script type="text/javascript" src="/themes/jeui/js/modules/jquery.js"></script>
<script type="text/javascript" src="/themes/jeui/js/modules/jeBox.js"></script>
<script type="text/javascript">
    function gosys() {
        var u = document.getElementById("user").value;
        var p = document.getElementById("pass").value;
        $.ajax({
            type: "POST",
            url: "loginajax",
            timeout: 60000,
            async: true,
            data: {
                "username":u,
                "password":p
            },
            success: function(data, textStatus) {  
                if(data.ret == 0)
                    jeBox.alert(data.message);
                else
                    window.location.href = "list"
            }
        });
        
    }
</script>
</body>
</html>