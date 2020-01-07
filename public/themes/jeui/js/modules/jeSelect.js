/**
 * Created by sinarts on 17/1/13.
 */
(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        //umd
        module.exports = factory();
    } else {
        root.jeSelect = factory(window.$ || $);
    }
})(this, function($) {
    $.fn.jeSelect = function(options) {
        return this.each(function() {
            return new jeSelect($(this), options || {});
        });
    };
    $.extend({
        jeSelect: function(elem, options) {
            return $(elem).each(function() {
                return new jeSelect($(this), options || {});
            });
        }
    });
    var config = {
        dropBox: "je-select", //目标框class名
        openCls: "je-select-open", //下拉展开class名
        currCls: "on", //下拉选中高亮class名
        size: 8, //设置高度(个数)
        sosList: true, //是否开启模糊搜索
        zIndex: 2099, //下拉弹层的层级高度
        itemfun: function(elem, index, val) {}, //点击当前的回调，elem：当前Select的ID index：索引 val：选中的值
        success: null //加载成功后的回调
    },
    jeSelect = function(elem, opts) {
        this.opts = $.extend(config, opts || {});
        this.elCell = elem;
        this.init();
    };
    var jefn = jeSelect.prototype;
    //初始化并创建元素
    jefn.init = function() {
        var _this = this,
            opts = _this.opts,
            inelem = _this.elCell;
        var jeuuid = function() {
            var str = "",
                arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
            for (var i = 0; i < 10; i++) str += arr[Math.round(Math.random() * (arr.length - 1))];
            return str;
        }();
        inelem.hide();
        var dropBox = $("<div id='jeselbox" + jeuuid + "'></div>").addClass(opts.dropBox);
        inelem.after(dropBox.text(inelem.find("option:selected").text()));
        //判断是否已经禁用
        if (inelem.is(":disabled")) {
            dropBox.addClass("disabled");
            return;
        }
        //执行元素绑定
        _this.onBind(jeuuid);
        //加载成功后的回调
        if ($.isFunction(opts.success) || opts.success != ("" || null)) {
            opts.success && opts.success(inelem);
        }
    };
    //点击事件绑定
    jefn.onBind = function(uuid) {
        var _this = this,
            opts = _this.opts,
            inelem = _this.elCell;
        $("#jeselbox" + uuid).on("click", function() {
            var openCell = _this.setCentent(uuid),
                bthis = $(this);
            //模拟列表点击事件-赋值
            openCell.find("dd").on("click", function() {
                var othis = $(this),
                    index = parseInt(othis.attr("item"));
                othis.addClass(opts.currCls).siblings().removeClass(opts.currCls);
                //同时改变select的选中状态
                inelem.trigger("change");
                inelem.find("option").removeAttr("selected").eq(index).attr("selected", true);
                openCell.remove();
                var vals = othis.attr("val"),
                    txts = inelem.find("option:selected").text();
                $("#jeselbox" + uuid).text(txts);
                //点击选中后的回调
                if (opts.itemfun != undefined && typeof opts.itemfun === "function") {
                    opts.itemfun(inelem, index, vals, txts);
                }
            });
            //执行方向定位
            _this.selectOrien(openCell, bthis);
            $(window).resize(function() {
                _this.selectOrien(openCell, bthis);
            })
            //点击空白处隐藏
            $(document).on("mouseup scroll", function(ev) {
                ev.stopPropagation();
                if (openCell && openCell.css("display") !== "none") openCell.remove();
            });
            openCell.on("mouseup", function(ev) {
                ev.stopPropagation();
            });
        });
    };
    //获取option的内容并设置
    jefn.setCentent = function(uuid) {
        var _this = this,
            opts = _this.opts,
            selHtml = "",
            s = 0,
            selbox = $("#jeselbox" + uuid);
        //创建并生成下拉列表
        var openDiv = $("<div id='jeselopens'></div>").addClass(opts.openCls);
        $("body").append(openDiv.css({ width: selbox.innerWidth(), "z-index": opts.zIndex }).append("<div class='opensoso'><input type='text'/></div><dl></dl>"));
        $("option, optgroup", _this.elCell).each(function() {
            //判断是否为option
            if ($(this).is("option")) {
                var groupCell = $(this).parent().is("optgroup") ? "group" : "",
                    text = $(this).text();
                //判断初始化是否为选中状态
                if ($(this).is(":selected")) {
                    selHtml += '<dd title="' + text + '" item="' + (s++) + '" class="' + opts.currCls + ' ' + groupCell + '">' + text + "</dd>";
                } else {
                    selHtml += '<dd title="' + text + '" item="' + (s++) + '" val="' + $(this).attr("value") + '" class="' + groupCell + '">' + text + "</dd>";
                }
            } else {
                //模拟分组html
                selHtml += '<dt title="' + $(this).attr("label") + '" val="' + $(this).attr("label") + '">' + $(this).attr("label") + "</dt>";
            }
        });
        openDiv.find("dl").html("").append(selHtml);
        var childCell = openDiv.find("dl").children();
        //如果显示的条数超过预设的条数进行高度设置
        if (opts.size < childCell.length) {
            openDiv.find("dl").css({
                height: childCell.height() * opts.size
            });
        }
        _this.searchList(openDiv, uuid);
        return openDiv;
    };
    //对列表进行模糊搜索
    jefn.searchList = function(openCell, uuid) {
        var _this = this,
            opts = _this.opts,
            selbox = $("#jeselbox" + uuid);
        if (opts.sosList) {
            openCell.find("input").on("input cut focus keydown keyup paste", function() {
                var sothat = $(this),
                    soVal = sothat.val(),
                    opendlCell = openCell.find("dl");
                //判断不为空的条件下
                if (soVal != "") {
                    opendlCell.children().each(function(i) {
                        var conText = $(this).text();
                        //如果输入的值与找到的值不匹配
                        if ((conText.indexOf(soVal.toLowerCase()) < 0) && (conText.indexOf(soVal.toUpperCase()) < 0)) {
                            $(this).css("display", "none");
                        } else {
                            $(this).css("display", "block");
                            if ($(this).is(":visible") && $(this).length < opts.size) {
                                opendlCell.css("height", "");
                            }
                        }
                        _this.selectOrien(openCell, selbox);
                    });
                } else {
                    opendlCell.children().each(function(i) {
                        $(this).css("display", "");
                    });
                    if (opts.size < opendlCell.children().length) {
                        setTimeout(function() {
                            opendlCell.css({
                                height: opendlCell.children().height() * opts.size
                            });
                            _this.selectOrien(openCell, selbox);
                        }, 5)
                    }
                }
            })
        } else {
            openCell.find(".opensoso").hide();
        }
    };
    //方位辨别定位
    jefn.selectOrien = function(obj, self, pos) {
        var tops, leris, ortop, orleri, rect = self[0].getBoundingClientRect();
        var docScroll = function(type) {
            type = type ? "scrollLeft" : "scrollTop";
            return document.body[type] | document.documentElement[type];
        };
        var winarea = function(type) {
            return document.documentElement[type ? "clientWidth" : "clientHeight"];
        };
        //计算目标元素的坐标
        leris = rect.right + obj.outerWidth() / 1.5 >= winarea(1) ? rect.right - obj.outerWidth() : rect.left + (pos ? 0 : docScroll(1));
        tops = rect.bottom + obj.outerHeight() / 1 <= winarea() ? rect.bottom : rect.top > obj.outerHeight() / 1.5 ? rect.top - obj.outerHeight() - 2 : winarea() - obj.outerHeight();
        ortop = Math.max(tops + (pos ? 0 : docScroll()) + 1, 1) + "px", orleri = leris + "px";
        obj.css({
            top: ortop,
            left: orleri
        });
    };
    return jeSelect;
});