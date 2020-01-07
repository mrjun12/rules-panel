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
            <button class="je-btn" id="addart"><i class="je-icon je-f20">&#xe66e;</i> 添加用户</button>
            <button class="je-btn je-bg-red" onclick="getTheCheckBoxValue()"><i class="je-icon je-f20">&#xe63e;</i> 批量删除</button>
            <button class="je-btn je-bg-orange" onclick="location.reload()"><i class="je-icon je-f20">&#xe601;</i></button>
        </p>
    </blockquote>
    <table class="je-table je-mb20" id="newCheck">
        <thead>
        <tr>
            <th width="5%"><input type="checkbox" name="checkbox" id="gocheck" jename="chunk"></th>
            <th width="5%" align="left">ID</th>
            <th width="50%">用户名</th>
            <th width="40%">操作</th>
        </tr>
        </thead>
        <tbody>
    	<?php foreach( $user_list as $v ){ ?>
        	<tr>
	            <td align="center"><input type="checkbox" name="checkbox" jename="chunk" value="<?php echo $v['id'];?>"></td>
	            <td><?php echo $v['id'];?></td>
	            <td><?php echo $v['username'];?></td>
	            <td align="center">
                    <input type="checkbox" name="enable" value="<?php echo $v['id'];?>" jename="switch" small jetext="管理,用户" <?php if( $v['admin'] ){ ?>checked<?php } ?>>
	                <button class="je-btn je-btn-mini je-f12" onclick="edit('<?php echo $v['id'];?>')">编辑</button>
                    <button class="je-btn je-btn-mini je-f12" onclick="edit_power('<?php echo $v['id'];?>')">权限</button>
	            </td>
	        </tr>
		<?php } ?>
        
        </tbody>
    </table>
</div>
<script type="text/javascript">

    function getTheCheckBoxValue(){

        parent.jeBox.msg('是否删除？', {
            time: 0 ,
            button: [ 
                {
                    name: '删除',
                    callback:function(index){
                        jeBox.close(index);
                        var test = $("input[name='checkbox']:checked");
                        var checkBoxValue = ""; 
                        test.each(function(){
                            checkBoxValue += $(this).val()+",";
                        })
                        checkBoxValue = checkBoxValue.substring(0,checkBoxValue.length-1);
                        console.log(checkBoxValue);

                        $.ajax({
                            type: "POST",
                            url: "usersdelete",
                            timeout: 60000,
                            async: true,
                            data: {
                                "data":checkBoxValue
                            },
                            success: function(data, textStatus) {   
                                if(data.ret == 0)
                                    parent.jeBox.alert(data.message);
                                else{
                                    parent.jeBox.msg('删除成功。');
                                    setTimeout(function(){
                                        location.reload()
                                    },1000);
                                }
                            }
                        });

                    }
                },{
                    name: '取消'
                }
            ]
        });
    }


    function edit(id){

        url = 'editusers?id='+id;
        jeBox.open({
            type: 'iframe',
            boxSize: ['70%', '40%'],
            maxBtn: true,
            scrollbar: false,
            content: url
        });

    }

    function edit_power(id){

        url = 'power_edit?id='+id;
        jeBox.open({
            type: 'iframe',
            boxSize: ['70%', '70%'],
            maxBtn: true,
            scrollbar: false,
            content: url
        });

    }

    jeui.use(["jquery","jeBox","jeDate","jeCheck","jeSelect"],function () {

        $("#addart").on("click",function(){
            jeBox.open({
                type: 'iframe',
                boxSize: ['70%', '40%'],
                maxBtn: true,
                scrollbar: false,
                content: 'addusers'
            });
        })
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

                var id = elem[0].value, admin = elem[0].checked?1:0;
                $.ajax({
                    type: "POST",
                    url: "adminajax",
                    timeout: 60000,
                    async: true,
                    data: {
                        "id": id,
                        "admin": admin
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