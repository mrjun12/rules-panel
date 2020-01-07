/**
 * Created by SinArts on 2017/4/1.
 */
(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        //umd
        module.exports = factory();
    } else {
        root.jeAccordion = factory(window.$ || $);
    }
})(this, function($) {
    var jeAccordion = function(elem, opts) {
        var config = {
            accIndex: 1, //表示展开第几个，如果为0时全部展开
            titCell: ".je-panel-title", //折叠面板标题的类名，可以是tag也可以是class
            conCell: ".je-panel-content", //折叠面板内容的类名，可以是tag也可以是class
            currCell: "current", //被选中的面板变化
            multiple: true, //为true时展开当前，收起其他
            itemfun: function(thistit, conelem, isopen) {}, //每次点击后的回调函数，thistit为当前标题DOM，conelem为内容DOM，isopen判断是否为展开状态
            success: function(alltit, conelem) {} //加载成功后的回调函数，alltit为所有标题DOM，conelem为内容DOM
        };
        this.opts = $.extend(true, config, opts || {});
        this.elCell = elem;
        this.init();
    };
    $.fn.jeAccordion = function(options) {
        return this.each(function() {
            return new jeAccordion($(this), options || {});
        });
    };
    $.extend({
        jeAccordion: function(elem, options) {
            return $(elem).each(function() {
                return new jeAccordion($(this), options || {});
            });
        }
    });
    jeAccordion.prototype.init = function() {
        var that = this,
            opts = that.opts,
            idx = parseInt(opts.accIndex) - 1,
            titCell = opts.titCell,
            conCell = opts.conCell,
            currCell = opts.currCell,
            titLi = that.elCell.find(titCell),
            eqIndex = that.elCell.children().eq(idx),
            menuelem = that.elCell.find(conCell);
        //展开第几个
        if (idx >= 0) {
            eqIndex.children(titCell).addClass(currCell);
            eqIndex.children(conCell).show();
        } else {
            titLi.addClass(currCell);
            menuelem.show();
        }

        //绑定事件
        titLi.on("click", function() {
            var _this = $(this),
                next = _this.next(),
                isacc = false,
                partitCell = _this.parent().children(titCell);
            next.slideToggle();
            if (partitCell.hasClass(currCell)) {
                partitCell.removeClass(currCell);
                isacc = false;
            } else {
                partitCell.addClass(currCell);
                isacc = true;
            }

            if (opts.multiple) {
                that.elCell.find(conCell).not(next).slideUp().parent().children(titCell).removeClass(currCell);
            };
            //点击选中后的回调
            if (opts.itemfun != undefined && $.isFunction(opts.itemfun)) {
                opts.itemfun(_this, menuelem, isacc);
            }
        });

        //加载成功后的回调
        if (opts.success != undefined && $.isFunction(opts.success)) {
            opts.success && opts.success(titLi, menuelem);
        }
    };
    return jeAccordion;
});