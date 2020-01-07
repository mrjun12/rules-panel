<style>
.tpl-e{ max-width:600px;margin:0 auto;padding: 80px 10px;font-family: '微软雅黑'; color: #333; font-size: 14px;}
.tpl-e h1{ font-size: 40px; font-weight: normal;margin: 0;}
.tpl-e .jump{margin: 10px 0;}
.tpl-e .success,.tpl-e .error{font-size: 18px;margin-bottom: 20px;}
hr{margin: 20px 0;}
</style>
<div class="tpl-e">
    <h1 style="color:#F37F7F;">>_<</h1>
    <p class="error"><?php echo $e['message']; ?></p>
    <p class="jump"><?php echo "File: {$e['file']} (Line: {$e['line']})"; ?></p>
    <hr>
    <div class="detail"> <?php echo nl2br($e['trace']); ?> </div>
</div>
