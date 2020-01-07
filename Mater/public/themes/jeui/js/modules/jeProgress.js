/**
 * Created by sin on 2017/4/16.
 */
(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "object") {
        //umd
        module.exports = factory();
    } else {
        root.jeProgress = factory(window.$ || $);
    }
})(this, function($) {
    $.fn.jeProgress = function(options) {
        return this.each(function() {
            return new jeProgress($(this), options || {});
        });
    };
    $.extend({
        jeProgress:function(elem, options) {
            return $(elem).each(function() {
                return new jeProgress($(this), options || {});
            });
        }
    });
    var jeProgress = function(elem, opts) {
        var config = {
            skin:"je-progress",
            success:null                             //加载成功后的回调
        };
        this.opts = $.extend(config, opts || {});
        this.elCell = elem;
        this.init();
    };
    var jefn = jeProgress.prototype;
    jefn.init = function () {
        var that = this, opts = that.opts;
        //加载数据
        that.elCell.each(function(){
            var othis = $(this),
                elemBar = othis.find('.'+opts.skin+'-bar'),
                percwidth = elemBar.attr('percent');
            elemBar.css('width', percwidth);
            if(othis.attr('showtext') == "true"){
                setTimeout(function(){
                    var percent = Math.round(elemBar.width()/othis.width()*100);
                    if(percent > 100) percent = 100;
                    elemBar.html('<span class="'+opts.skin+'-text">'+ percent +'%</span>');
                },450);
            }
        });

        //加载成功后的回调
        if ($.isFunction(opts.success) || opts.success != ("" || null)) {
            opts.success && opts.success();
        }
    };
    return jeProgress;
});