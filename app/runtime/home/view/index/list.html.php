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
<body>
<div jepane="top" class="je-admin-top">
    <div class="je-admin-logo je-tc je-fl je-white" title="JEUI"></div>
    <div class="shrink je-fl je-white je-icon je-f28 je-mr10">&#xe626;</div>
    
    <div class="je-admin-user je-fr">
        <a href="/logout"><div class="usertext je-pl8 je-fl je-f14 je-pr30">退出登陆</div></a>
    </div>
</div>
<div jepane="left" class="je-admin-left">
    <ul class="je-admin-menu">

        <li class="level">
            <h3><em class="ico"></em>规则管理<i></i></h3>
            <ul class="levelnext">
                <!--<li><a href="javascript:;" data-tab="p2" data-text="服务器列表" data-url="servers.html" addtab>服务器列表</a></li>-->
                
                <li><a href="javascript:;" data-tab="p3" data-text="规则列表" data-url="rules.html" addtab>规则列表</a></li>
            </ul>
        </li>
        
    <?php if( $user['admin'] ){ ?>
        <li class="level">
            <h3><em class="ico"></em>管理员设置<i></i></h3>
            <ul class="levelnext">
                <li><a href="javascript:;" data-tab="user_list" data-text="用户列表" data-url="admin_user.html" addtab>用户列表</a></li>
                <li><a href="javascript:;" data-tab="server_list" data-text="服务器列表" data-url="admin_server.html" addtab>服务器列表</a></li>
                <li><a href="javascript:;" data-tab="rules_log" data-text="规则日志" data-url="rules_log.html" addtab>规则日志</a></li>
                <li><a href="javascript:;" data-tab="server_log" data-text="服务器日志" data-url="server_log.html" addtab>服务器日志</a></li>
            </ul>
        </li>
    <?php } ?>

    </ul>

</div>
<div jepane="center" class="je-admin-center" tabpane>

</div>
<?php if (!defined('POEM_PATH')) exit();?><div jepane="right" class="je-admin-right">right</div>
<div jepane="bottom" class="je-admin-bottom"><p>2019 © Lofter MIT license</p></div>

<script type="text/javascript">
    jeui.use(["jquery","jeBox","jeLayout","jeTabPane","jeAccordion"],function () {
        //Layout面板布局
        $("body").jeLayout();
        $("#myTabNav").find("li").on("click",function () {
            $(this).addClass('curr').siblings().removeClass('curr');
        });
        //折叠菜单
        $(".je-admin-menu").jeAccordion({
            accIndex: 0,
            titCell:"h3",
            conCell:"ul", 
            multiple:false,
            success:function (titelem, conelem) {
                //给菜单绑定事件
                conelem.children().on("click",function(){
                    conelem.children().removeClass("current");
                    $(this).addClass("current");
                });
            }
        });
        //addtabs
        $("[tabpane]").jeTabPane({
            firstItem:{                              //默认首页
                tab: "main",
                text: "后台首页",
                url: "main.html",
                closable:false
            }
        });
    });
</script>
</body>
</html>