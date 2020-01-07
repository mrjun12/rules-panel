/**
 @Name : jeBox v1.5 弹层组件
 @Author: chen guojun
 @Date: 2017-06-26
 @QQ群：516754269
 @官网：http://www.jemui.com/jebox/ 或 https://github.com/singod/jeBox
 */
;!(function ( window, factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(factory);
    } else if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory();
    } else {
        window.jeBox = factory();
    }
})( this, function () {
    var Jeobj = {endfun : {}}, regPxe = /\px|em/g,
        ieBrowser = !-[1, ] ? parseInt(navigator.appVersion.split(";")[1].replace(/MSIE|[ ]/g, "")) : 9;
    //缓存常用字符
    var doms = ["jeBox", ".jeBox-wrap", ".jeBox-header", ".jeBox-content", ".jeBox-footer", ".jeBox-close", ".jeBox-maxbtn"];
    var jeBox = {
        version: "1.5",
        jeidx: Math.floor(Math.random() * 9e3)
    };
    var jeDialog = function(options) {
        var that = this;
        var config = {
            cell: "", // 独立ID,用于控制弹层唯一标识
            title: "提示信息", // 标题,参数一：提示文字，参数二：提示条样式  ["提示信息",{color:"#ff0000"}]
            content: "暂无内容！", // 内容
            boxStyle: {}, //设置弹层的样式
            closeBtn: true, // 标题上的关闭按钮
            closefun: null,
            maxBtn: false, //是否开启最大化按钮
            boxSize: ["auto", "auto"], // 参数一：弹层宽度，参数二： 弹层高度
            padding: "5px", // 自定义边距
            offset: ["auto", "auto"], //坐标轴
            type: 'dialog', // 显示基本层类型
            icon: 0, // 图标,信息框和加载层的私有参数
            button: [], // 各按钮
            btnAlign: "right", //btnAlign 按钮对齐方式  left center right
            time: 0, // 自动关闭时间(秒),0表示不自动关闭
            maskLock: true, // 是否开启遮罩层
            maskClose: true, // 点击遮罩层是否可以关闭
            maskColor: ["#000", .5], // 参数一：遮罩层颜色，参数二：遮罩层透明度
            isDrag: true, // 是否可以拖拽
            fixed: true, // 是否静止定位
            zIndex: 9999, // 弹层层级关系
            scrollbar: false, // 是否允许浏览器出现滚动条
            shadow: true, //拖拽风格
            success: null, // 层弹出后的成功回调方法
            endfun: null
        };
        that.config = $.extend({}, config, options);
        that.jeidx = (that.config.cell == "" || that.config.cell == undefined) ? ++jeBox.jeidx : that.config.cell.replace(/[#.]/, "");
        that.initView()
    };
    var jefn = jeDialog.prototype;

    //初始化并加载弹层骨架
    jefn.initView = function () {
        var that = this, opts = that.config, idx = that.jeidx,
            msgCell = opts.content, isType = opts.type, icons = opts.icon,
            lays = ['dialog', 'iframe', 'loading', 'tips'],
            conType = typeof msgCell === "object",
            msgType = msgCell[0] && msgCell[0].nodeType === 1,
            iconMsg = '<div class="jeBox-iconbox jeicon' + icons + '">' + msgCell + "</div>";
        Jeobj.scrollbar = opts.scrollbar;
        //判断ID是否已经存在
        if (opts.cell && $("#" + doms[0] + that.jeidx)[0]) return;
        switch (isType) {
            case lays[0]:
                opts.type = lays[0];
                if (typeof msgCell === "string") {
                    opts.content = icons !== 0 ? iconMsg : msgCell;
                } else if (msgType) {
                    opts.content = "";
                    //查询传入的位置
                    Jeobj["dispy"+idx] = msgCell.css("display");
                    Jeobj["prev"+idx] = msgCell.prev();
                    Jeobj["next"+idx] = msgCell.next();
                    Jeobj["parent"+idx] = msgCell.parent();
                    if (msgCell.css("display") == "none") msgCell.css("display", "block");
                }
                jeBox.closeAll(lays[0]);
                break;
            case lays[1]:
                opts.type = lays[1];
                var conMsg = conType ? msgCell : [msgCell || "http://www.jemui.com/", "auto"];
                opts.content = '<iframe scrolling="' + (conMsg[1] || "auto") + '" allowtransparency="true" id="jeboxiframe' + idx + '" name="' + idx + '" onload="this.className=\'\';" frameborder="0" width="100%" height="100%" src="' + conMsg[0] + '"></iframe>';
                jeBox.closeAll(lays[1]);
                break;
            case lays[2]:
                opts.type = lays[2];
                opts.content = '<div class="jeBox-loadbox jeload' + icons + '">' + msgCell + '</div>';
                jeBox.closeAll(lays[2]);
                break;
            case lays[3]:
                opts.type = lays[3];
                jeBox.closeAll(lays[3]);
                break;
        }
        if(opts.type == lays[3]){ //tips提示
            var tipW = $.isArray(opts.boxSize) ? opts.boxSize[0] : opts.boxSize,
                tipH = $.isArray(opts.boxSize) ? opts.boxSize[1] : opts.boxSize;
            var tipDiv = $("<div>",{"class":"jeBox-tips","id":doms[0] + idx}).css({width:tipW,height:tipH,'z-index':opts.zIndex}).css(opts.boxStyle);
            $("body").append(tipDiv.append("<em></em><div class='jeBox-tipscon'>"+opts.content+"</div>"));
            var post = $(opts.cell).offset().top, posl = $(opts.cell).offset().left,
                tiptop, tipleft, edgecolor, aligngo, spac = opts.spacing,
                selfH = $(opts.cell).outerHeight(), selfW = $(opts.cell).outerWidth(),
                tipH = tipDiv.outerHeight(true), tipW = tipDiv.outerWidth(true);
            switch (opts.align) {
                case 'top': case 'bottom':
                aligngo = opts.align == 'top' ? 'bottom' : 'top';
                edgecolor = 'border-right-color', tipleft = posl;
                tiptop = opts.align == 'top' ? (post - tipH - spac) : (post + selfH + spac);
                break;
                case 'left': case 'right':
                aligngo = opts.align == 'left' ? 'right' : 'left';
                edgecolor = 'border-bottom-color', tiptop = post;
                tipleft = opts.align == 'left' ? (posl - tipW - spac) : (posl + selfW + spac);
                break;
            }
            tipDiv.css({top:tiptop,left:tipleft});
            tipDiv.find("em").css(edgecolor,tipDiv.css('background-color')).css(aligngo,-8);
            tipDiv.attr("jetype", opts.type);
            that.btnCallback(tipDiv);
        }else {
            that.creatBox(function (cell) {
                if(msgType){
                    cell.attr("jenode", msgCell.selector.toString());
                    //把已知的html片段包裹并插入到弹层中
                    cell.find(doms[3]).append(msgCell);
                }
                cell.attr("jetype", opts.type);
                that.setSize(cell);
                that.setPosition(cell);
                that.btnCallback(cell);
                //是否可拖动
                if (opts.isDrag) {
                    var wrapCell = cell, titCell = cell.find(doms[2]);
                    that.dragLayer(wrapCell, titCell, 0.4, opts.shadow);
                };
            });
        }
    };
    //创建弹层骨架
    jefn.creatBox = function(callback) {
        var that = this, opts = that.config, idx = that.jeidx;
        //创建按钮模板
        var arrButton = opts.button, btnLen = arrButton.length;
        var btnHtml = function() {
            var btnStrs = btnLen != 0 ? function() {
                var btnArr = [];
                $.each(arrButton, function(i, val) {
                    btnArr.push('<button type="button" class="jeBox-btn' + i + '" jebtn="' + i + '" ' + (val.disabled == true ? "disabled" : "") + '>' + val.name + '</button>');
                });
                return btnArr.join("");
            }() : "";
            return '<div class="jeBox-footer">' + btnStrs + "</div>";
        }();
        var paddings = opts.padding, skinCell = opts.skinCell || "jeBox-anim";
        //创建默认的弹出层内容模板
        var templates = '<span class="jeBox-headbtn"><a href="javascript:;" class="jeBox-maxbtn" title="最大化"></a><a href="javascript:;" class="jeBox-close" title="&#20851;&#38381;"></a></span>' + '<div class="jeBox-header"></div>' + '<div class="jeBox-content" style="padding:' + (paddings != "" ? paddings : 0) + ';">'+opts.content+'</div>' + btnHtml;
        //创建弹窗外部DIV
        var getZindex = function(elem) {
                var maxZindex = 0;
                elem.each(function() {
                    maxZindex = Math.max(maxZindex, $(this).css("z-index"));
                });
                return maxZindex;
            },
            zIndexs = opts.zIndex;
        //计算层级并置顶
        var Zwarp = $(doms[1]).size() > 0 ? getZindex($(doms[1])) + 5 : zIndexs + 5,
            Zmask = $(doms[1]).size() > 0 ? getZindex($(doms[1])) + 2 : zIndexs,
            divBoxs = $("<div/>", { "id": doms[0] + idx, "class": doms[1].replace(/\./g, "") });
        $("body").append(divBoxs.append(templates));
        divBoxs.attr("jeitem", idx);
        divBoxs.css({ position: opts.fixed ? "fixed" : "absolute", "z-index": Zwarp });
        (parseInt(ieBrowser) < 9) ? divBoxs.addClass("jeBox-ies"): divBoxs.addClass(skinCell);
        jeBox.zIndex = parseInt(divBoxs.css("z-index"));
        !Jeobj.scrollbar && $("body").css("overflow", "hidden");
        //是否开启遮罩层
        if (opts.maskLock) {
            var maskBox = $("<div/>", { "id": "jemask" + idx, "class": "jeBox-mask" }),
                maskColor = opts.maskColor;
            $("body").append(maskBox);
            maskBox.css({ left: 0, top: 0, "background-color": maskColor[0], "z-index": Zmask, opacity: maskColor[1], filter: "alpha(opacity=" + maskColor[1] * 100 + ")" })
        };
        var titles = opts.title == false ? "" : (opts.title || config.title),
            titType = typeof titles === "object", isTitle =  titles ? (titType ? titles[0] : titles) : "";
        divBoxs.find(doms[2]).html(isTitle).css({ "display": isTitle != "" ? "" : "none", "height":  isTitle != "" ? "" : "0px" }).css(titType ? titles[1] : {});
        divBoxs.find(doms[4]).css({"display": btnLen != 0 ? "block" : "none", "text-align": opts.btnAlign});
        divBoxs.find(doms[5]).css("display", opts.closeBtn ? "" : "none");
        divBoxs.find(doms[6]).css("display", opts.maxBtn ? "" : "none");
        callback && callback(divBoxs);
    };
    //设置弹层尺寸
    jefn.setSize = function(cell) {
        var that = this, opts = that.config,
            wrapWidth, wrapHeight, conWidth, conHeight,
            conCell = cell.find(doms[3]), areas = opts.boxSize,
            conPad = function(prop) { return parseInt(conCell.css(prop).replace(regPxe, "")) },
            conhead = Jeobj.conhead = cell.find(doms[2]).height(),
            confoot = Jeobj.confoot = cell.find(doms[4]).height(),
            winW = $(window).width(), winH = $(window).height(),
            Padtb = conPad("padding-top") + conPad("padding-bottom"),
            Padlr = conPad("padding-left") + conPad("padding-right"),
            Martb = conPad("margin-top") + conPad("margin-bottom"),
            Marlr = conPad("margin-left") + conPad("margin-right");
        var toSize = function (wval, fval) {
            return /^\d+%$/.test(fval.toString()) ? parseInt(wval * (fval.toString().replace("%", "") / 100)) :
                parseInt(fval.toString().replace(regPxe, ""));
        };
        if ($.isArray(areas)) {
            var fixW = areas[0], fixH = areas[1],
                bfW = toSize(winW, fixW), bfH = toSize(winH, fixH),
                nPerW = bfW >= winW ? winW : bfW,
                nPerH = bfH >= winH ? winH : bfH;
            //设置层的宽度
            if ($.type(fixW) === "number") {
                wrapWidth = bfW + Padlr + Marlr;
                conWidth = bfW;
            } else if (fixW == "auto") {
                wrapWidth = cell.outerWidth(true) + Padlr + Marlr;
                conWidth = cell.outerWidth(true);
            } else {
                wrapWidth = nPerW;
                conWidth = nPerW - Padlr - Marlr;
            }

            //设置层的高度
            if ($.type(fixH) === "number") {
                wrapHeight = bfH + Padtb + Martb;
                conHeight = bfH - conhead - confoot;
            } else if (fixH == "auto") {
                wrapHeight = cell.outerHeight(true);
                conHeight = cell.outerHeight(true) - Padtb - Martb - conhead - confoot;
            } else {
                wrapHeight = nPerH;
                conHeight = nPerH - Padtb - Martb - conhead - confoot;
            }
        }
        opts.maxBtn && cell.attr("area", [wrapWidth, wrapHeight, conWidth, conHeight]);
        cell.css({ "width": wrapWidth, height: wrapHeight }).css(opts.boxStyle);
        cell.find(doms[3]).css({ "width": conWidth, "height": conHeight });
    };
    //定位层显示的位置
    jefn.setPosition = function(cell) {
        var that = this, opts = that.config,
            Postr, elemtr, elembl, offsets = opts.offset,
            isOffsetArr = $.isArray(offsets),
            eleW = cell.width(), eleH = cell.height(),
            Postr = offsets[0], Posbl = offsets[1],
            winWidth = $(window).width(),
            winHeight = $(window).height();
        //设置位置
        elemtr = (isOffsetArr && /^\@/.test(Postr)) ? Postr.replace(/\@/g, "") :
            ((Postr == "auto") ? (winHeight - eleH) / 2 : /^\d+%$/.test(Postr) ? Postr : Postr.replace(regPxe, ""));
        elembl = (isOffsetArr && /^\@/.test(Posbl)) ? Posbl.replace(/\@/g, "") :
            ((Posbl == "auto") ? (winWidth - eleW) / 2 : /^\d+%$/.test(Posbl) ? Posbl : Posbl.replace(regPxe, ""));
        //判断设置位置类型
        cell.css( (isOffsetArr && (/^\@/.test(Postr) || /^\@/.test(Posbl))) ? { "right": elemtr, "bottom": elembl } : { "top": elemtr, "left": elembl });
        if(opts.maxBtn){
            cell.attr("offset", [elemtr, elembl]);
        }
    };
    //各关闭按钮的事件
    jefn.btnCallback = function(cell) {
        var that = this,
            opts = that.config,
            idx = that.jeidx,
            maxBtn = cell.find(doms[6]),
            times = opts.time,
            btns = opts.button,
            offsets = opts.offset;
        if (opts.success) {
            if (opts.type == "iframe") {
                cell.find("iframe").on("load", function() {
                    config.success(cell, idx);
                });
            } else {
                opts.success(cell, idx);
            }
        };
        if (opts.type != "tips") {
            // 按钮队列
            if (!$.isArray(btns)) btns = btns ? [btns] : [];
            //自动关闭
            times <= 0 || setTimeout(function () {
                jeBox.close(idx);
            }, times * 1e3);

            //关闭按钮事件
            if (opts.closeBtn) {
                cell.find(doms[5]).on("click", function () {
                    var close = opts.closefun && opts.closefun(idx);
                    close === false || jeBox.close(idx);
                });
            }
            //最大化按钮
            if (opts.maxBtn) {
                maxBtn.bind("click", function () {
                    if (maxBtn.hasClass("revert")) {
                        maxBtn.removeClass("revert");
                        jeBox.restore(idx);
                        $(this).attr("title", "最大化");
                    } else {
                        maxBtn.addClass("revert");
                        jeBox.full(idx);
                        $(this).attr("title", "还原");
                    }
                });
            }
            //更多按钮
            if (btns.length > 0) {
                cell.find(doms[4] + " button").on("click", function () {
                    var index = parseInt($(this).attr("jebtn"));
                    if (index === 0) {
                        btns[0]["callback"] ? btns[0]["callback"](idx, cell) : jeBox.close(idx, cell);
                    } else if (index > 0) {
                        var close = btns[index]["callback"] && btns[index]["callback"](idx, cell);
                        close === false || jeBox.close(idx);
                    }
                });
            }
            //点遮罩关闭
            if (opts.maskClose) {
                $("#jemask" + idx).on("click", function () {
                    jeBox.close(idx);
                });
            }
            //自适应
            $(window).resize(function () {
                if ($.isArray(offsets) && (/^\@/.test(offsets[0]) || /^\@/.test(offsets[1]))) {
                    cell.css({"top": "", "left": ""});
                }
                that.setPosition(cell);
            });
        }
        opts.endfun && (Jeobj.endfun[idx] = opts.endfun);
    };
    //拖拽事件
    jefn.dragLayer = function (warpCell, titCell, opacityVal, isShadow) {
        var that = this, isIES = !-[1];
        titCell = titCell || warpCell;
        var tmpX = tmpY = 0;
        that.isMoveable = false;
        titCell.css("cursor", "move");
        if (isShadow) {
            that.isShadow = isShadow ? isShadow == true || isShadow == false ? isShadow : false : false;
            if (that.isShadow) that.opacity = opacityVal;
        } else {
            that.opacity = 100, that.isShadow = false;
        }
        titCell.on("mousedown", function(event) {
            var event = event || window.event;
            var tempLayer = $("<div/>",{"id":"jeBox-moves","class":"jeBox-moves"}),
                warpLeft = warpCell.css("left"), warpTop = warpCell.css("top");
            var tempLayerCon = $("<div/>",{class:"movescon"});
            //只允许通过鼠标左键进行拖拽,IE鼠标左键为1 FireFox为0
            if (isIES && event.button != 1 || isIES && event.button == 0) return false;
            //创建临时拖动层
            if (that.isShadow) {
                tempLayer.css({
                    width :(warpCell.outerWidth() - 4), height : (warpCell.outerHeight() - 4),
                    left : warpLeft, top : warpTop, "z-index" : parseInt(warpCell.css("z-index")) + 10
                });
                $("body").append(tempLayer.append(tempLayerCon));
            }
            that.isMoveable = true;
            tmpX = event.pageX - warpLeft.replace(regPxe, "");
            tmpY = event.pageY - warpTop.replace(regPxe, "");
            //FireFox 去除容器内拖拽图片问题
            if (event.preventDefault) {
                event.preventDefault();  event.stopPropagation();
            }
            $(document).on("mousemove", function (event) {
                if (!that.isMoveable) return;
                window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                //控制元素不被拖出窗口外
                var event = event || window.event, elemCopy = that.isShadow ? tempLayer : warpCell,
                    DmpX = event.pageX - tmpX, DmpY = event.pageY - tmpY,
                    maxW = $(window).width() - warpCell.outerWidth(), maxH = $(window).height() - warpCell.outerHeight();
                DmpX <= 0 && (DmpX = 0);   DmpY <= 0 && (DmpY = 0);
                DmpX >= maxW && (DmpX = maxW);  DmpY >= maxH && (DmpY = maxH);
                elemCopy.css({"top": DmpY, "left": DmpX});
            }).on("mouseup", function () {
                if (that.isMoveable) {
                    that.isMoveable = false;
                    tmpX = tmpY = 0;
                    warpCell.css({"right": "", "bottom": ""});
                    if (that.isShadow) {
                        //判断并把虚框的位置信息传给弹层
                        warpCell.css({ "top": tempLayer.css("top"), "left": tempLayer.css("left") });
                        //判断并删除新创建的虚框
                        $("#jeBox-moves").remove();
                    }
                    if ($(window).width() != warpCell.outerWidth()) {
                        warpCell.attr("offset", [warpCell.css("top").replace(regPxe, ""), warpCell.css("left").replace(regPxe, "")]);
                    }
                }
            });
        });
    };
    // 让传入的元素在对话框关闭后可以返回到原来的地方
    Jeobj.backInSitu = function (elem, jePrev, jeNext, jeParent, jeDispy) {
        if (jePrev.length > 0 && jePrev.parent()) {
            jePrev.after(elem);
        } else if (jeNext.length > 0 && jeNext.parent()) {
            jeNext.before(elem);
        } else if (jeParent.length > 0) {
            jeParent.append(elem);
        }
        elem.css("display", jeDispy);
        //this.backInSitu = null;
    };
    //弹层核心
    jeBox.open = function (opts) {
        var jeShow = new jeDialog(opts || {});
        return jeShow.jeidx;
    };
    //关闭指定层
    jeBox.close = function (idx) {
        var boxCell = $("#" + doms[0] + idx), maskCell = $("#jemask" + idx);
        var nodeCell = boxCell.attr("jenode"),
            arr = ["prev"+idx,"next"+idx,"parent"+idx,"dispy"+idx];
        if(!boxCell) return;
        if ($(nodeCell).size() > 0 && $(nodeCell)[0].nodeType === 1) {
            Jeobj.backInSitu($(nodeCell), Jeobj[arr[0]], Jeobj[arr[1]], Jeobj[arr[2]], Jeobj[arr[3]]);
        };
        boxCell && boxCell.remove();
        maskCell && maskCell.remove();
        $("body").css("overflow") == "hidden" && $("body").css("overflow", "");
        $.each(arr,function (i,val) {
            delete Jeobj[val];
        });
        typeof Jeobj.endfun[idx] === 'function' && Jeobj.endfun[idx]();
        delete Jeobj.endfun[idx];
    };
    //关闭所有层
    jeBox.closeAll = function (type) {
        $.each($(doms[1]), function () {
            var that = $(this);
            var istype = type ? (that.attr('jetype') === type) : 1;
            istype && jeBox.close(parseInt(that.attr("jeitem")));
            istype = null;
        });
    };
    //最常用提示层
    jeBox.msg = function (content, options, end) {
        var type = $.isFunction(options);
        if (type) end = options;
        return jeBox.open($.extend({
            title: false,
            content: content,
            padding: "10px",
            skinCell: "jeBox-animMsg",
            time: 3,
            maskLock: false,
            closeBtn: false,
            end: end
        }, !type && function () {
                options = options || {};
                return options;
            }()));
    };
    jeBox.alert = function (content, options, yes) {
        var type = $.isFunction(options);
        if (type) yes = options;
        return jeBox.open($.extend({
            content: content,
            button:[{name: '确定', callback:yes}]
        }, type ? {} : options));
    };
    jeBox.loading = function (icon, content, options) {
        return jeBox.open($.extend({
            title: false,
            closeBtn: false,
            type: 'loading',
            skinCell: "jeBox-animLoad",
            maskLock: false,
            content: content == undefined ? "" : content,
            icon: icon || 1
        }, options));
    };
    //tip提示泡泡
    jeBox.tips = function (cell,content,options) {
        return jeBox.open( $.extend({
            cell: cell,
            type: 'tips',
            content: content == undefined ? "" : content,
            align:"top",            //提示层的箭头方向
            boxStyle:{'background-color':"#5eb95e"},         //提示层的风格，参数为提示边框颜色
            spacing:10              //默认为箭头距离对象的尺寸
        },options||{}));
    };
    //改变当前弹层title
    jeBox.title = function (name, idx) {
        $("#" + doms[0] + idx).find(doms[2]).html(name);
    };
    //改变当前弹层内容
    jeBox.content = function (content, idx) {
        $("#" + doms[0] + idx).find(doms[3]).html(content);
    };
    //还原
    jeBox.restore = function (index) {
        var boxCell = $("#" + doms[0] + index), conCell = boxCell.find(doms[3]),
            revArea = boxCell.attr("area").split(/,/g), revOffset = boxCell.attr("offset").split(/,/g);
        $("body").css('overflow', Jeobj.scrollbar == false ? 'hidden' : '');
        boxCell.css({
            width: revArea[0], height: revArea[1], top: revOffset[0] + "px", left: revOffset[1] + "px", right: "", bottom: ""
        });
        conCell.css({width: revArea[2], height: revArea[3]});
    };
    //全屏
    jeBox.full = function (index) {
        var timer, boxCell = $("#" + doms[0] + index),
            conCell = boxCell.find(doms[3]);
        $("body").css('overflow', 'hidden');
        clearTimeout(timer);
        timer = setTimeout(function () {
            boxCell.find(doms[6]).addClass("revert");
            var isfix = boxCell.css('position') === 'fixed', offset = boxCell.attr("offset").split(","),
                docWidth = $(window).width(), docHeight = $(window).height(),
                conW = conCell.outerWidth(true) - conCell.width(), conH = conCell.outerHeight(true) - conCell.height(),
                headHeight = boxCell.find(doms[2]).outerHeight(true), footHeight = boxCell.find(doms[4]).outerHeight(true);
            boxCell.css({
                width: docWidth, height: docHeight,
                top: isfix ? 0 : offset[0], left: isfix ? 0 : offset[1], right: "", bottom: ""
            });
            conCell.css({
                width: docWidth - conW,
                height: docHeight - conH - headHeight - footHeight
            });
        }, 50);
    };
    //获取子iframe的DOM
    jeBox.frameCell = function (selector, index) {
        index = index || $(".jeboxiframe").attr("jeitem");
        return $("#" + doms[0] + index).find("iframe").contents().find(selector);
    };
    //得到当前iframe层的索引，子iframe时使用
    jeBox.frameIndex = function (name) {
        return $("#" + doms[0] + name).attr("jeitem");
    };
    //重置iframe url
    jeBox.frameUrl = function (idx, url) {
        $("#" + doms[0] + idx).find("iframe").attr("src", url);
    };

    return jeBox
});