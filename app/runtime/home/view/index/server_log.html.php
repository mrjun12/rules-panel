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
<div class="je-p20">
    
    <blockquote class="je-quote green je-f16 je-ovh  je-mb10">
        <p class="je-pb5 checkbox">

            <input type="text" name="title" id="inpstart" placeholder="开始日期"<?php if( $start ){ ?> value="<?php echo $start;?>"<?php } ?> readonly class="je-input je-pl5 je-pr5">
            <input type="text" name="title" id="inpend" placeholder="结束日期"<?php if( $end ){ ?> value="<?php echo $end;?>"<?php } ?> readonly class="je-input je-pl5 je-pr5">
            <button class="je-btn je-f14" onclick="search()">查询</button>
            <button class="je-btn je-bg-orange" onclick="location.reload()"><i class="je-icon je-f20">&#xe601;</i></button>
        </p>
    </blockquote>
    <table class="je-table je-mb20" id="newCheck">
        <thead>
        <tr>
            <th width="5%" align="left">ID</th>
            <th width="10%">用户名</th>
            <th width="10%">服务器名</th>
            <th width="10%">动作</th>
            <th width="20%">时间</th>
        </tr>
        </thead>
        <tbody>
        <?php foreach( $log_list as $v ){ ?>
            <tr>
                <td><?php echo $v['id'];?></td>
                <td><?=m('user')->field("username")->where(['id' => $v['user_id']])->find()['username']?></td>
                <td><?php echo $v['server_name'];?></td>
                <td><?php if( $v['doing_type']==0 ){ ?>增加<?php }elseif( $v['doing_type']==1 ){ ?>修改<?php }else{ ?>删除<?php } ?></td>
                <td><?php echo $v['date_time'];?></td>
            </tr>
        <?php } ?>
        
        </tbody>
    </table>
    <a <?php if( $pages-1==0 ){ ?>disabled<?php }else{ ?> href="rules_log?pages=<?=$pages-1?>&time=<?=$_GET['time']?>"<?php } ?> class="je-btn je-bg-green"><i class="je-icon je-f20">&#xe613;</i> 上一页</a>
    <button class="je-btn je-bg-red"><?php echo $pages;?></button>
    <a <?php if( count($log_list)!=20 ){ ?>disabled<?php }else{ ?> href="rules_log?pages=<?=$pages+1?>&time=<?=$_GET['time']?>"<?php } ?> class="je-btn je-bg-green">下一页 <i class="je-icon je-f20">&#xe60f;</i></a>
</div>
<script type="text/javascript">

    function search(){
        var start = document.getElementById("inpstart").value;
        var end = document.getElementById("inpend").value;

        window.location.href = 'server_log?time='+start+'|'+end;
    }

    jeui.use(["jquery","jeBox","jeDate","jeCheck","jeSelect"],function () {

        var start = {
            format: 'YYYY-MM-DD hh:mm:ss',
            minDate: '2014-06-16 23:59:59', //设定最小日期为当前日期
            //isinitVal:true,
            //festival:true,
            ishmsVal:true,
            maxDate: $.nowDate({DD:0}), //最大日期
            choosefun: function(elem, val, date){
                end.minDate = date; //开始日选好后，重置结束日的最小日期
                endDates();
            }
        };
        var end = {
            format: 'YYYY-MM-DD hh:mm:ss',
            minDate: $.nowDate({DD:0}), //设定最小日期为当前日期
            //festival:true,
            maxDate: '2099-06-16 23:59:59', //最大日期
            choosefun: function(elem, val, date){
                start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
            }
        };
        //这里是日期联动的关键        
        function endDates() {
            //将结束日期的事件改成 false 即可
            end.trigger = false;
            $("#inpend").jeDate(end);
        }
        $('#inpstart').jeDate(start);
        $('#inpend').jeDate(end);

        $(".checkbox").jeCheck();
        $(".checkbox").jeCheck({jename:"radio"});
        $(".checkbox").jeCheck({jename:"switch"});
        $("#newCheck").jeCheck({
            jename:"chunk",
            attrName:[false,"勾选"], 
            itemfun: function(elem,bool) {
                console.log(elem)
                console.log(bool)
                console.log(elem.prop('checked'))
            },
            success:function(elem){
                jeui.chunkSelect(elem,'#gocheck','on')
                
            }
        });
        $("#newCheck").jeCheck({
            jename:"switch",
            itemfun:function(elem){
                console.log(elem);
                console.log(elem[0].value);
                console.log(elem[0].checked);

                var id = elem[0].value, enable = elem[0].checked?1:0;
                $.ajax({
                    type: "POST",
                    url: "enableajax",
                    timeout: 60000,
                    async: true,
                    data: {
                        "id": id,
                        "enable": enable
                    },
                    success: function(data, textStatus) {   
                        console.log(data);
                        if(data.ret == 0){
                            jeBox.alert(data.message);
                            setTimeout(function(){
                                    location.reload()
                            },1000);
                        }else{
                            jeBox.msg('操作成功。');
                        }
                    }
                });

            }
    });
    });
</script>
</body>
</html>