/**
 * Created by SinArts on 2017/1/20.
 */
;(function(root, factory) {
    //amd
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') { //umd
        module.exports = factory();
    } else {
        root.jeLayout = factory(window.jQuery || $);
    }
})(this, function($) {
    $.fn.jeLayout = function(options){
        return this.each(function(){
            return new jeLayout($(this),options||{});
        });
    };
    $.extend({
        jeLayout:function(elem, options){
            return $(elem).each(function(){
                return new jeLayout($(this),options||{});
            });
        }
    });
    var jeLayout = function (elem, opts){
        var config = {
            leftWidth:"200px",
            rightWidth:0,
            shrinkCell:".shrink",
            success : null                //加载成功后的回调函数
        };
        this.opts = $.extend(config, opts||{});
        this.elCell = elem;
        this.init();
    };
    var jefn = jeLayout.prototype;
    jefn.init = function () {
        var that = this, opts = that.opts;
        that.pane = [];
        that.elCell.css({width:"auto", height:"auto", margin:0, position:"absolute", top:0, bottom:0, left:0, right:0,zoom: 1, overflow:"hidden"});
        $.each(["top","right","left","bottom","center"],function (i,val) {
            var elem = that.elCell.children("[jepane="+val+"]");
            that.pane.push(elem);
            if(elem.length > 0){
                var pow = (val == "left" || val == "right") ? 
                    {position:"absolute",width: val == "right" ? opts.rightWidth || 0 : opts.leftWidth || 0} : {position:"absolute"};
                elem.css(pow).css(val,0);
            }
        });
        that.setSize();
        that.setShrink();
        $(window).resize(function () {
            that.setSize();
        });
        //加载成功后的回调
        if ($.isFunction(opts.success) || opts.success != ("" || null)) {
            opts.success && opts.success();
        }
    };
    jefn.setSize = function () {
        var that = this, opts = that.opts, winWidth = $(window).width(), winHeight = $(window).height(),
            topH = that.pane[0].outerHeight(true) || 0, bottomH = that.pane[3].outerHeight(true) || 0,
            rightW = that.pane[1].outerWidth(true) || 0, leftW = that.pane[2].outerWidth(true) || 0,
            leriHeight = winHeight - topH - bottomH;
        that.pane[1].css({width:opts.rightWidth,height:leriHeight,top:topH,right:0,bottom:bottomH});
        that.pane[2].css({width:opts.leftWidth,height:leriHeight,top:topH,left:0,bottom:bottomH});
        that.pane[4].attr('centwidth',winWidth - leftW - rightW).css({width:winWidth - leftW - rightW,height:leriHeight,top:topH,left:leftW,right:rightW,bottom:bottomH});
    };
    jefn.setShrink = function () {
        var that = this, opts = that.opts;
        $(opts.shrinkCell).on("click",function () {
            var centw = parseInt(that.pane[4].attr('centwidth')), 
                oplew = parseInt(opts.leftWidth.replace(/px|pt|rem/g,""));
            if(that.pane[2].width() == oplew){
                var centSize = centw + oplew;
                that.pane[2].css({width:0});
                that.pane[4].css({width:centSize,left:0}).attr('centwidth',centSize);
            }else {
                var centSize = centw - oplew;
                that.pane[2].css({width:opts.leftWidth});
                that.pane[4].css({width:centSize,left:opts.leftWidth}).attr('centwidth',centSize);
            }
        });
    };
    return jeLayout;
});
