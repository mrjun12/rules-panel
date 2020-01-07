/**
 * Created by SinArts on 2017/1/14.
 */
(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "optsect") {
        //umd
        module.exports = factory();
    } else {
        root.jeNavTab = factory(window.$ || $);
    }
})(this, function($) {
    $.fn.jeNavTab = function(options) {
        return this.each(function() {
            return new jeNavTab($(this), options || {});
        });
    };
    $.extend({
        jeNavTab:function(elem, options) {
            return $(elem).each(function() {
                return new jeNavTab($(this), options || {});
            });
        }
    });
    var config = {
        titCls:".hd ul",
        /*按钮的父级Class*/
        mainCls:".bd",
        /*内容的父级Class*/
        titliCls:"li",
        listCls:".list",
        currCls:"on",
        /*当前导航选中位置自动增加的class名称*/
        trigger:"mouseover",
        /*事件参数 click,mouseover*/
        animation:"no",
        /*动画方向 left,top,fadein,no 为无动画*/
        animspeed:300,
        /*动画运动速度*/
        delay:0,
        /*Tab延迟速度*/
        tabIndex:1,
        /*默认的当前位置索引。1是第一个；tabIndex:1 时，相当于从第2个开始执行*/
        autoPage:false,
        /*是否自动分页，自定义如：autoPage:"<a>$</a>"*/
        autoPlay:true,
        /*是否开启自动运行 true,false,  */
        autoSpeed:3e3,
        /*自动运行速度*/
        pageState:".pageState",
        /*用于显示分页状态,如：2/3 */
        vis:1,
        /*当内容个数少于可视个数，不执行效果*/
        scroll:1,
        prevCell:".prev",
        /*前一个/页按钮对象*/
        nextCell:".next"
    }, jeNavTab = function(elem, opts) {
        this.opts = $.extend(config, opts || {});
        this.elCell = elem;
        this.init();
    };
    var jefn = jeNavTab.prototype;
    jefn.init = function() {
        var that = this, opts = that.opts, elCell = that.elCell;
        that.trigger = opts.trigger;
        that.titCell = $(opts.titCls, elCell);
        that.mainCell = $(opts.mainCls, elCell);
        that.titliCell = $(opts.titliCls, that.titCell);
        that.artlist = $(opts.listCls, that.mainCell);
        that.anim = opts.animation;
        that.curr = opts.currCls;
        that.Paging = $(opts.pageState, elCell);
        that.prev = $(opts.prevCell, elCell);
        that.next = $(opts.nextCell, elCell);
        that.Index = elCell.index(1) + opts.tabIndex;
        that.len = that.artlist.size();
        var coW = that.artlist.outerWidth(true), 
            coH = that.artlist.outerHeight(true), 
            lisW = that.artlist.width(), 
            lisH = that.artlist.height(), 
            lenW = that.len * coW, 
            lenH = that.len * coH, 
            vis = parseInt(opts.vis);
        if (opts.autoPage) {
            var autoNumStr = "";
            if (that.len >= vis) {
                //当内容个数少于可视个数，不执行效果
                if (opts.autoPage == true || opts.autoPage == "true") {
                    for (var Num = 0; Num < that.len; Num++) {
                        autoNumStr += "<li>" + (Num + 1) + "</li>";
                    }
                } else {
                    for (var Num = 0; Num < that.len; Num++) {
                        autoNumStr += opts.autoPage.replace("$", Num + 1);
                    }
                }
            }
            that.titCell.html(autoNumStr);
            that.titliCell = $(opts.titliCls, that.titCell);
        }
        //判断动画方向
        if (that.anim == "left") {
            that.mainCell.wrap('<div class="tempWrap" style="overflow:hidden; position:relative;width:' + coW + 'px"></div>');
        } else if (that.anim == "top") {
            that.mainCell.wrap('<div class="tempWrap" style="overflow:hidden; position:relative;height:' + coH + 'px"></div>');
        }
        if (that.len >= vis) {
            //当内容个数少于可视个数，不执行效果
            that.fnMove = function() {
                var Miw = that.Index * coW, Mih = that.Index * coH;
                that.titliCell.eq(that.Index).addClass(that.curr).siblings(that.titliCell).removeClass(that.curr);
                switch (that.anim) {
                    case "no":
                        that.artlist.eq(that.Index).show().siblings(that.artlist).hide();
                        break;

                    case "left":
                        that.mainCell.css({
                            position:"relative", overflow:"hidden", padding:0, margin:0, width:lenW
                        });
                        that.artlist.css({
                            "float":"left", width:lisW, display:"block"
                        }).end().stop().animate({
                            left:-Miw
                        }, opts.animspeed);
                        break;

                    case "top":
                        that.mainCell.css({
                            position:"relative", overflow:"hidden", padding:0, margin:0, height:lenH
                        });
                        that.artlist.css({
                            "float":"left", height:lisH, display:"block"
                        }).end().stop().animate({
                            top:-Mih
                        }, opts.animspeed);
                        break;

                    case "fadein":
                        that.artlist.eq(that.Index).fadeIn(500).siblings(that.artlist).hide();
                        break;
                }
                //用于显示分页状态
                that.Paging.html("<span class='pagstate'>" + (that.Index + 1) + "</span>/" + that.titliCell.size());
            };
            that.fnMove();
        }
        that.onBind();
    };
    jefn.onBind = function() {
        var that = this, opts = that.opts, timer;
        //判断事件类型
        if (that.trigger == "mouseover") {
            that.titliCell.hover(function() {
                var j = that.titliCell.index($(this));
                function seve() {
                    that.Index = j;
                    that.fnMove();
                }
                timer = setTimeout(seve, opts.delay);
            }, function() {
                clearTimeout(timer);
            });
        } else {
            that.titliCell.on(that.trigger, function() {
                that.Index = that.titliCell.index($(this));
                that.fnMove();
            });
        }
        // Slide：减（左）按钮
        that.prev.click(function() {
            if (that.mainCell.is(":not(:animated)")) {
                var dur = 1;
                if (that.Index > 0) {
                    that.Index--;
                } else {
                    that.Index = that.len - 1;
                    dur = that.Index;
                }
                that.fnMove();
            }
        });
        // Slide：增（右）按钮
        that.next.click(function() {
            if (that.mainCell.is(":not(:animated)")) {
                var dur = 1;
                if (that.Index < that.len - 1) {
                    Ithat.ndex++;
                } else {
                    that.Index = 0;
                    dur = that.len - 1;
                }
                fnMove();
            }
        });
        //Slide自动运行	
        var startRun = function() {
            timer = setInterval(function() {
                that.Index++;
                if (that.Index > that.len - 1) that.Index = 0;
                that.fnMove();
            }, opts.autoSpeed);
        };
        //Slide结束运行	
        var stopRun = function() {
            clearInterval(timer);
        };
        //如果自动运行开启，调用自动运行函数
        if (opts.autoPlay) {
            that.elCell.hover(function() {
                stopRun();
            }, function() {
                startRun();
            });
            startRun();
        }
    };
    return jeNavTab;
});
