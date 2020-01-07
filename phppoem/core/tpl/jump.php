<style>
.tpl-e{ max-width:600px;margin:0 auto;padding: 80px 10px;font-family: '微软雅黑'; color: #333; font-size: 14px;}
.tpl-e h1{ font-size: 40px; font-weight: normal;margin: 0;}
.tpl-e .jump{margin: 10px 0;}
.tpl-e .success,.tpl-e .error{font-size: 18px;margin: 10px 0;}
</style>

<div class="tpl-e">
<?php if ($message) {?>
    <h1 style="color:#6CC539;">^_^</h1>
    <p class="success"><?php echo $message; ?></p>
<?php } else {?>
    <h1 style="color:#F37F7F;">>_<</h1>
    <p class="error"><?php echo $error; ?></p>
<?php }?>
    <p class="jump">
        页面自动 <a id="href" href="<?php echo $jumpUrl; ?>">跳转</a>
        等待时间： <b id="wait"><?php echo $waitSecond; ?></b>
    </p>
</div>

<script type="text/javascript">
    (function(){
    var wait = document.getElementById('wait')
    var href = document.getElementById('href').href;
    var interval = setInterval(function(){
        var time = --wait.innerHTML;
        if(time <= 0) {
            location.href = href;
            clearInterval(interval);
        };
    }, 1000);
    })();
</script>
