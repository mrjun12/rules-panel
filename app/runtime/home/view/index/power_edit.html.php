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
<style type="text/css">
    .checkbox{
        padding-top: 10px;
    }
</style>
<div class="je-p20" id="checklist">

        <!--<form id="itemcheac">-->
            <div class="je-form-item je-f14 checkbox">
                <?php foreach( $show_list as $v ){ ?>
                    <input type="checkbox" name="checkbox" value="<?php echo $v['id'];?>" jename="checkbox" <?php if( $v['is_show'] ){ ?>checked<?php } ?> jetext="<?php echo $v['name'];?>">
                <?php } ?>
            </div>

        <!--</form>-->
    
</div>

<script type="text/javascript">
    
jeui.use(["jquery","jeBox","jeCheck","jeSelect"],function () {
    
    $("#checklist").jeCheck({
        itemfun: function(elem,bool) {
            var id = elem[0].value , operate = bool?1:0;

            console.log(id)
            console.log(operate)
            console.log("<?php echo $_GET['id'];?>")

            $.ajax({
                type: "POST",
                url: "power_ajax",
                timeout: 60000,
                async: true,
                data: {
                    "operate": operate,
                    "id": id,
                    "user_id": "<?php echo $_GET['id'];?>"
                },
                success: function(data, textStatus) {   
                    console.log(data);
                    if(data.ret == 0){
                        jeBox.alert(data.message);
                        setTimeout(function(){
                            parent.location.reload()
                        },1000);
                    }else{
                        parent.jeBox.msg('更改成功。');
                    }
                }
            });
        },

    });
    $(".radio").jeCheck({jename:"radio"});
    $(".switch").jeCheck({jename:"switch"});
    $(".myselect").jeSelect({
        sosList: false
    });
    var index = parent.jeBox.frameIndex(window.name);
    $('#btnIframe').click(function(val){

        var password = document.getElementById("password").value;
        var id = "<?php echo $_GET['id'];?>";
        $.ajax({
            type: "POST",
            url: "editusersajax",
            timeout: 60000,
            async: true,
            data: {
                "password": password,
                "id": id
            },
            success: function(data, textStatus) {   
    			console.log(data);
                if(data.ret == 0)
                    jeBox.alert(data.message);
                else{
                    parent.jeBox.msg('更改成功。');
                    setTimeout(function(){
                    	parent.location.reload()
                    },1000);
                }
            }
        });
        
    });
 })
    
</script>
<!--
http://www.qdfuns.com/notes/13967/3cdebc6a132f33a3e65aa2b6019a7487.html
http://www.jq22.com/demo/jQueryNavHover20161129/
-->
</body>
</html>