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
            <select class="myselect" id="mySelect">

            	<?php foreach( $list as $v ){ ?>
            		<option value="<?php echo $v['id'];?>" <?php if( $_GET['id']==$v['id'] ){ ?>selected<?php } ?>><?php echo $v['name'];?> - <?php echo $v['server_cname'];?> - <?php echo $v['server_ip'];?> - <?php echo $v['server_port'];?></option>
				<?php } ?>
                <!--<option value="2" selected>服务器2</option>-->
            </select>

            <input type="text" name="title" id="inpstart" placeholder="开始日期" readonly class="je-input je-pl5 je-pr5">
            <input type="text" name="title" id="inpend" placeholder="结束日期" readonly class="je-input je-pl5 je-pr5">
            <button class="je-btn je-f14">查询</button>
        </p>
    </blockquote>
    <table class="je-table je-mb20" id="newCheck">
        <thead>
        <tr>
            <th width="5%"><input type="checkbox" name="checkbox" id="gocheck" jename="chunk"></th>
            <th width="5%" align="left">ID</th>
            <th width="10%">本地端口</th>
            <th width="10%">远程端口</th>
            <th width="20%">远程DDNS</th>
            <th width="10%">远程IP</th>
            <th width="20%">备注</th>
            <th width="20%">操作</th>
        </tr>
        </thead>
        <tbody>
    	<?php foreach( $rule_list as $v ){ ?>
        	<tr>
	            <td align="center"><input type="checkbox" name="checkbox" jename="chunk" value="<?php echo $v['id'];?>"></td>
	            <td><?php echo $v['id'];?></td>
	            <td><?php echo $v['local_port'];?></td>
	            <td><?php echo $v['remote_port'];?></td>
	            <td><?php echo $v['remote_cname'];?></td>
	            <td><?php echo $v['remote_ip'];?></td>
                <td><?php echo $v['remark'];?></td>
	            <td align="center">
                    <input type="checkbox" name="checkboxswitch" jename="switch" small disabled jetext="已生效,未生效" <?php if( $v['status'] ){ ?>checked<?php } ?>>
                    <input type="checkbox" name="enable" value="<?php echo $v['id'];?>" jename="switch" small jetext="启用,暂停" <?php if( $v['enable'] ){ ?>checked<?php } ?>>
	                <button class="je-btn je-btn-mini je-f12" onclick="edit('<?php echo $v['id'];?>')">编辑</button>
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
                            url: "rulesdelete",
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

        url = 'editrules?rule='+id+'&id=<?php echo $server_id;?>';
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
                boxSize: ['70%', '70%'],
                maxBtn: true,
                scrollbar: false,
                content: 'addrules?id=<?php echo $server_id;?>'
            });
        })
        $(".myselect").jeSelect({
        	sosList: false,
        	itemfun:function(elem, index, val) {
        		console.log(val);
                if(val != undefined){
            		url = "rules?id=" + val;
            		window.location.href=url;
                }
        	}
        });

        var start = {
            format: 'YYYY-MM-DD hh:mm:ss',
            minDate: '2014-06-16 23:59:59', //设定最小日期为当前日期
            isinitVal:true,
            //festival:true,
            ishmsVal:false,
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