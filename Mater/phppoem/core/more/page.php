<?php
namespace poem\more;
class page {

    /**
     * 分页
     * @param  [type]  $m         [description]
     * @param  string  $url       [description]
     * @param  integer $page_size [description]
     * @param  integer $show_nums [description]
     * @return [type]             [description]
     */
    static function run($m, $url = '', $page_size = 15, $show_nums = 5) {
        $page               = intval(i('p')) ? intval(i('p')) : 1;
        $total              = $m->no_clear()->count(); // 总记录数
        $list               = $m->limit(($page - 1) * $page_size, $page_size)->select(); // 结果列表
        $info['list']       = $list;
        $info['total']      = $total; // 总记录数
        $info['url']        = $url ? $url : POEM_FUNC_URL; //url
        $info['page']       = $page; // 当前页
        $info['page_count'] = ceil((int) $info['total'] / (int) $page_size); //总页数
        $info['html']       = self::pagehtml($page, $info['page_count'], $info['url'], $show_nums, $total);
        return $info;
    }

    /**
     * 分页页码HTML
     * @param  int  $np    当前页
     * @param  int  $tp    总页数
     * @param  string  $url  
     * @param  int $num  页码展示数量
     * @param  int $total 总条数
     * @return string
     */
    static function pagehtml($np, $tp, $url, $num = 5, $total) {
        $up   = $np - 1; // 上一页
        $dp   = $np + 1; // 下一页
        $f    = ($np == 1) ? 'disabled' : ''; // 是否为首页
        $e    = ($np == $tp) ? 'disabled' : ''; // 是否问尾页
        $html = '';
        if ($tp > 0) {
            $html .= '<ul class="pagination">';
            $html .= "<li> <span>共 $total 条 {$np}/{$tp}页</span></li>";
            // $html .= "<li> <span>当前 $np / $tp 页</span> </li>";
            if ($np != 1) {
                $html .= "<li class='{$f}'><a href='" . self::geturl($url, 1) . "'> << </a></li>";
                $html .= "<li class='{$f}'><a href='" . self::geturl($url, $up) . "'> < </a></li>";
            }
            $sep   = floor($num / 2);
            $begin = 1;
            if ($tp >= $num) {
                if ($np > $sep && $np < ($tp - $sep)) {$begin = $np - $sep;} elseif ($np >= ($tp - $sep)) {$begin = $tp - $num + 1;}
            } else {
                $num = $tp;
            }
            $sum = 0;
            for ($i = $begin; $i < $num + $begin; $i++) {
                $cp = ($np == $i) ? 'class="active"' : ''; //'.$cp.'
                $tu = ($np == $i) ? 'javascript:void(0);' : self::geturl($url, $i);
                $html .= "<li $cp><a href='$tu'>$i</a></li>";
            }
            if ($np != $tp) {
                $html .= "<li class='{$e}'><a href='" . self::geturl($url, $dp) . "'> > </a></li>";
                $html .= "<li class='{$e}'><a href='" . self::geturl($url, $tp) . "'> >> </a></li>";
            }
            $html .= "</ul>";
        }
        return $html;
    }

    /**
     * [geturl description]
     * @param  [type] $url  [description]
     * @param  [type] $page [description]
     * @return [type]       [description]
     */
    static function geturl($url, $page) {
        static $var;
        if (!$var) {
            $var = array_merge($_GET, $_POST);
        }

        $var['p'] = $page;
        return $url . '?' . http_build_query($var);
    }
}