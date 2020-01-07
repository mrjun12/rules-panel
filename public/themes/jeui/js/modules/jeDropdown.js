/**
 * Created by sinarts on 2017/5/22.
 */
(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "optsect") {
        //umd
        module.exports = factory();
    } else {
        root.jeDropdown = factory(window.$ || $);
    }
})(this, function($) {
    $.fn.jeDropdown = function(options) {
        return this.each(function() {
            return new jeDropdown($(this), options || {});
        });
    };
    $.extend({
        jeDropdown:function(elem, options) {
            return $(elem).each(function() {
                return new jeDropdown($(this), options || {});
            });
        }
    });
    var searandom = function (){
        var str = "",arr = [1,2,3,4,5,6,7,8,9,0];
        for(var i=0; i<8; i++) str += arr[Math.round(Math.random() * (arr.length-1))];
        return str;
    },
    docScroll = function(type) {
        type = type ? "scrollLeft" :"scrollTop";
        return document.body[type] | document.documentElement[type];
    },
    winarea = function(type) {
        return document.documentElement[type ? "clientWidth" :"clientHeight"];
    }, 
    jeDropdown = function(elem, opts) {
        var config = {
            skin:"je-drop",
            dataDrop:{url:"",type:"GET",data:{},dataType:"json"},
            zIndex: 9999,           //弹层层级关系
            align:"top",            //提示层的箭头方向
            spacing:2,             //默认为距离对象的间隔
            success:null
        };
        this.opts = $.extend(config, opts || {});
        this.elCell = elem;
        this.init();
    };
    var jefn = jeDropdown.prototype;
    jefn.init = function () {
        var that = this, opts = that.opts, datas = "";
        if ($.isArray(opts.dataDrop)) {
            datas = opts.dataDrop;
        }else {
            $.ajax({
                url: opts.dataDrop.url,
                type: opts.dataDrop.type,
                data: opts.dataDrop.data || {},
                dataType: opts.dataDrop.dataType || "json",
                async: opts.dataDrop.async || true,
                success: function (json) {
                    datas = json
                }
            });
        }
        that.createDrop(datas);
    };
    //创建下拉的html片段
    jefn.createDrop = function (data) {
        var that = this, opts = that.opts;
        that.elCell.on("click",function () {
            var tid = that.elCell.attr("jedrop"), sdom = searandom(),
                dropDiv = $("<div/>",{"class":opts.skin,"id":"drop"+sdom}).css({"z-index":opts.zIndex});
            //判断元素是否已经存在
            if($("#drop"+tid).length == 0) {
                $("body").append(dropDiv.append("<ul></ul>"));
                $.each(data,function (i,val) {
                    var lis = $("<li/>",val.list||{}), dropul = dropDiv.find("ul");
                    var urls = val.url != undefined && val.url != "" ? val.url : "javascript:;";
                    dropul.append(lis.append($("<a/>",{"href":urls}).text(val.name)));
                });
                that.elCell.attr("jedrop",sdom);
                if(opts.align == "auto"){
                    that.orien(dropDiv, that.elCell);
                }else {
                    that.posAlign(that.elCell,dropDiv);
                }
            }
        });
        //点击空白处隐藏
        $(document).on("mouseup", function(ev) {
            ev.stopPropagation();
            var box = $("."+opts.skin);
            if (box && box.css("display") !== "none")  box.remove();
        });
        //加载成功后的回调
        if ($.isFunction(opts.success)) {
            opts.success && opts.success();
        }
    };
    //自动定位元素的位置
    jefn.orien = function(obj, self, pos) {
        var tops, leris, ortop, orleri, rect = self[0].getBoundingClientRect();
        //根据目标元素计算弹层位置
        leris = rect.right + obj.outerWidth() / 1.5 >= winarea(true) ? rect.right - obj.outerWidth() : rect.left + (pos ? 0 : docScroll(true));
        tops = rect.bottom + obj.outerHeight() / 1 <= winarea() ? rect.bottom - 1 : rect.top > obj.outerHeight() / 1.5 ? rect.top - obj.outerHeight() - 1 : winarea() - obj.outerHeight();
        ortop = Math.max(tops + (pos ? 0 :docScroll()) + 1, 1) + "px", orleri = leris + "px";
        obj.css({"top":ortop,"left":orleri});
    };
    //根据参数进行元素定位
    jefn.posAlign = function (objcell,boxcell) {
        var that = this, opts = that.opts,spac = opts.spacing, postop, posleft;
        var post = parseInt(objcell.offset().top), posl = parseInt(objcell.offset().left),
            selfH = parseInt(objcell.outerHeight(true)), selfW = parseInt(objcell.outerWidth(true)),
            tipH = parseInt(boxcell.outerHeight(true)), tipW = parseInt(boxcell.outerWidth(true));
        switch (opts.align) {
            case 'top': case 'right':
            postop = post - tipH - spac;
            break;
            case 'left': case 'bottom':
            postop = post + selfH + spac;
            break;
        }
        posleft = (opts.align == 'top' || opts.align == 'left') ? posl : (posl + selfW - tipW);
        boxcell.css({"top":postop,"left":posleft});
    };
    return jeDropdown;
});