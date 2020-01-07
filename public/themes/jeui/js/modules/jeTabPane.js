/**
 * Created by SinArts on 2017/2/11.
 */
(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "object") {
        //umd
        module.exports = factory();
    } else {
        root.jeTabPane = factory(window.$ || $);
    }
})(this, function($) {
    var jeTabPane = function(elem, opts) {
        var config = {
            skinCell:"tabpanel",                       //默认风格
            monitor: 'body',                         //监视的区域
            menuattr:"[addtab]",                     //点击标识可以是 ".addtab" 或者 "[addtab]"类型
            firstItem:{},                              //默认首页
            maxTabs:12,                              //最大显示tab标签数量, 默认最大显示12个标签
            moveSize:104,                            //每次最大移动宽度
            currCls:"active",                        //当前高亮的标识class
            contextmenu:true,                        //是否启用右键快捷菜单
            menulist: {                              //右键菜单列表
                refresh: '刷新此标签',
                closeThis: '关闭此标签',
                closeOther: '关闭其他标签',
                closeLeft: '关闭左侧标签',
                closeRight: '关闭右侧标签'
            },
            closefun:null,
            success:null                             //加载成功后的回调
        };
        this.opts = $.extend(config, opts || {});
        this.elCell = elem;
        this.maxTab = this.opts.maxTabs;
        this.moveSize = this.opts.moveSize;
        //私有属性
        this.tabItem = {};
        this.tabsArr = [];
        this.maxMove = 0;
        this.scrolled = false;
        this.scrollComplete = true;
        this.tabInit();
        this.setTabPos();
    };
    $.fn.jeTabPane = function(options) {
        return this.each(function() {
            return new jeTabPane($(this), options || {});
        });
    };
    $.extend({
        jeTabPane:function(elem, options) {
            return $(elem).each(function() {
                return new jeTabPane($(this), options || {});
            });
        }
    });
    jeTabPane.prototype = {
        /**
         * 初始化tabs
         */
        tabInit:function() {
            var that = this, opts = this.opts, timers, resizeTimer;
            var TabPane = $("<div>",{"class":opts.skinCell}),
                TabContrlWrap = $("<div>",{"class":"tab-contrlwrap"}),
                TabItemWrap = $("<div>",{"class":"tab-itemwrap"}),
                TabItemMove = $("<ul>",{"class":"tab-itemmove"}),
                TabContent = $("<div>",{"class":"tab-panelcontent"}),
                TabLeftBut = $("<div>",{"class":"tab-leftbtn"}),
                TabRightBut = $("<div>",{"class":"tab-rightbtn"});
            //将内容追加到目标元素中
            that.elCell.html(TabPane.prepend(TabContrlWrap.append(TabItemWrap.append(TabItemMove)).append(TabLeftBut).append(TabRightBut)).append(TabContent));
            //获得DOM
            var TabWrap = that.TabWrap = this.elCell;
            that.tabContrlWrap = TabWrap.find(TabContrlWrap);
            that.tabItemWrap = TabWrap.find(TabItemWrap);
            that.tabItemMove = TabWrap.find(TabItemMove);
            that.tabContent = TabWrap.find(TabContent);
            that.leftCell = TabWrap.find(TabLeftBut).select(function() { return false; });
            that.rightCell = TabWrap.find(TabRightBut).select(function() { return false; });
            //默认显示首页   
            if(typeof opts.firstItem === "object" && !(opts.firstItem instanceof Array)){
                that.addTab(opts.firstItem);
            } 
            //点击栏目标题显示对应标签
            $(opts.monitor).on('click', opts.menuattr, function() {
                var obj = (typeof $(this).data('tab') == 'object') ? $(this).data('tab') : $(this).data();
                that.addTab(obj);
            });
            //左右滚动事件
            that.leftCell.on({
                click:function() {
                    window.clearTimeout(timers);
                    timers = window.setTimeout(function() {
                        that.shiftPosition(1, that.moveSize);
                    }, 200);
                },
                dblclick:function() {
                    window.clearTimeout(timers);
                    that.shiftPosition(1, Math.abs(parseInt(that.tabItemMove.css("margin-left"), 10)));
                }
            });
            that.rightCell.on({
                click:function() {
                    window.clearTimeout(timers);
                    timers = window.setTimeout(function() {
                        that.shiftPosition(0, that.moveSize);
                    }, 200);
                },
                dblclick:function() {
                    window.clearTimeout(timers);
                    that.shiftPosition(0, that.maxMove + parseInt(that.tabItemMove.css("margin-left"), 10));
                }
            });
            $(window).on("resize.tabpanel", function() {
                window.clearTimeout(resizeTimer);
                resizeTimer = window.setTimeout(function() {
                    that.resize();
                }, 300);
            });
            that.showScroll();
            that.setTabPos();
            that.shiftPosition();
            //加载成功后的回调
            if ($.isFunction(opts.success) || opts.success != "" || opts.success != null) {
                opts.success && opts.success();
            }
        },
        /**
         * 添加选项卡
         * @param {Object} tabitem
         */
        addTab:function(tabitem) {
            var that = this, isClose = (tabitem.closable == undefined || tabitem.closable == "true" || tabitem.closable == true),
                tabId = tabitem.tab, closeType = isClose ? "true" : "false";
            that.url = tabitem.url;
            if (!that.scrollComplete) return;
            if(tabId == undefined || tabId == ""){
                alert(tabitem.text+"的tab不能为空");
                return;
            } 
            //判断是否已有tab
            if (that.tabItem[tabId]) {
                that.showTab(tabId);
                return;
            } else if (that.maxTab <= that.tabsArr.length) {
                alert("超出最大个数，不能打开");
                return;
            }
            var tablis = $("<li>",{"id":"tablis-"+tabId,"tabrole":"menu","taburl":that.url,"tabcell":tabId,"tabclose":closeType,"title":tabitem.text});
            that.tabItemMove.append(tablis.text(tabitem.text));
            tabitem.closable = isClose ? true : false;
            tabitem.closem = $('<em>',{"class":"tab-close"});
            tabitem.content = $('<div>',{"id":"tabcon-"+tabId,"class":"tab-conwrap"});
            tabitem.tabLis = tablis;
            tablis.append(isClose ? tabitem.closem : "");
            that.tabContent.append(tabitem.content);
            //绑定事件
            tabitem.tabLis.on("click",function() {
                that.showTab(tabId);
            });
            that.setTabItem(tabitem);
            //设置前置卡
            tabitem.pretab = that.active;
            //放入数组中
            that.tabsArr.push({tab:tabId});
            //将tabitem写入对象中
            that.tabItem[tabId] = tabitem;
            //更新
            that.setTabPos();
            that.showScroll();
            //显示
            that.showTab(tabId);
            if (that.opts.contextmenu) {
                //obj上禁用右键菜单
                that.tabItemMove.on('contextmenu', 'li[tabrole=menu]', function(e) {
                    that.setTabMenus($(this),e);
                    return false;
                });
            }
        },
        /**
         * 更新卡，方便使用
         * @param {Object} tabitem 同上Item
         */
        setTabItem:function(tabitem) {
            var that = this;
            //恢复未绑定状态
            tabitem.tabLis.unbind("dblclick");
            //可关闭，增加补丁宽度，绑定关闭事件
            if (tabitem.closable) {
                //已有关闭按钮的话，删除点击事件
                if (tabitem.closem) {
                    tabitem.closem.unbind("click");
                }
                //绑定事件
                tabitem.closem.on("click",function() {
                    that.closeTab(tabitem.tab);
                });
                tabitem.tabLis.on("dblclick",function() {
                    that.closeTab(tabitem.tab);
                });
            } else {
                //如果有关闭按钮，删除关闭按钮
                if (tabitem.closem) {
                    tabitem.closem.remove();
                    delete tabitem["closem"];
                }
            }
            //如果设置了宽度
            if (tabitem.width) {
                //先给LI设置宽度
                tabitem.tabLis.width(tabitem.width);
            } 
        },
        /**
         * 显示选项卡
         * @param {string} tabId
         */
        showTab:function(tabId) {
            tabId = this.getItemTab(tabId);
            var tabItem = this.tabItem[tabId], tabItemAct = this.tabItem[this.active];
            //是否已经显示
            if (this.active === tabId) return;
            //判断是否有该ID的卡
            if (tabItem) {
                //隐藏active，显示本卡
                if (tabItemAct) {
                    tabItemAct.tabLis.removeClass(this.opts.currCls);
                    tabItemAct.content.removeClass(this.opts.currCls);
                }
                tabItem.tabLis.addClass(this.opts.currCls);
                tabItem.content.addClass(this.opts.currCls);
                this.active = tabId;
                //延迟加载判断是否已加载
                if (tabItem.content.html() === "") {
                    tabItem.content.html("<iframe src='"+this.url+"' scrolling='yes' frameborder='0'></iframe>");
                }
            } else {
                alert("ID not found.");
            }
            this.shiftVisible();
        },
        /**
         * 关闭选项卡
         * @param {string} tabId
         */
        closeTab:function(tabId) {
            var that = this;
            tabId = that.getItemTab(tabId);
            var tabCell = that.tabItem[tabId].tab, Pretabs = that.tabItem[tabId].pretab;
            //关闭TAB选项卡
            $("#tablis-"+tabCell).remove();
            $("#tabcon-"+tabCell).remove();
            //删除属性
            delete that.tabItem[tabId];
            for (var i = 0; i < that.tabsArr.length; i++) {
                if (that.tabsArr[i].tab === tabId) {
                    that.tabsArr.splice(i, 1);
                    that.setTabPos();
                    that.showScroll();
                    break;
                }
            }
            //如果被关闭卡就是当前卡
            if (that.active === tabId) {
                //显示前置卡
                if (Pretabs && that.tabItem[Pretabs]) {
                    that.showTab(Pretabs);
                } else if (that.tabsArr.length > 0) {
                    that.showTab(that.getItemObj(0).tab);
                }
            } else {
                //移动到可见
                that.shiftVisible();
            }
            that.setTabPos();
            that.showScroll();
            //关闭后的回调
            if ($.isFunction(that.opts.closefun) || that.opts.closefun != "" || that.opts.closefun != null) {
                that.opts.closefun && that.opts.closefun();
            }
        },    
        /**
         * 重设鼠标右键内容
         * @param {string} curr
         * @param {object} mouse
         */
        setTabMenus : function (curr,mouse) {
            var that = this, opts = that.opts, mtab = curr.attr('tabcell'), tablis = $('#tablis-' + mtab),
                currCls = opts.currCls, ulCell = that.tabItemMove, conCell = that.tabContent,
                menuCell = $('<div>', {'id': 'tabMenus', 'class': 'tabmenubox'}),
                createMenu = function (elcell, text) {
                    return $('<p>', {'class': elcell, 'data-right': elcell}).append(text);
                };
            $('#tabMenus').remove();
            //创建右键菜单列表
            var refresh = curr.attr('id') ? createMenu('refresh', opts.menulist.refresh) : '',
                remove = (curr.attr('id') && curr.attr('tabclose') == "true") ? createMenu('remove', opts.menulist.closeThis) : '',
                left = curr.prev('li').attr('id') ? createMenu('remove-left', opts.menulist.closeLeft) : '',
                right = curr.next('li').attr('id') ? createMenu('remove-right', opts.menulist.closeRight) : '';
            //将生成的弹出右键菜单插入到body
            menuCell.css({'top': mouse.pageY - 3, 'left': mouse.pageX - 3}).append(refresh).append(remove).append(createMenu('remove-other', opts.menulist.closeOther)).append(left).append(right);
            $('body').append(menuCell.fadeIn('slow'));
            //执行弹出右键菜单函数
            menuCell.on('click', 'p', function() {
                var mthis = $(this), rmVal = mthis.data("right");
                switch (rmVal){
                    case 'refresh':  //刷新当前
                        if (!tablis.hasClass(curr)) {
                            ulCell.find("li").removeClass(currCls);
                            conCell.find(".tab-conwrap").removeClass(currCls);
                            $("#tablis-"+ mtab).addClass(currCls);
                            $("#tabcon-"+ mtab).addClass(currCls);
                        }
                        $("#tabcon-"+mtab).empty().append("<iframe src='"+curr.attr('taburl')+"' scrolling='yes' frameborder='0'></iframe>");
                        break;
                    case 'remove':  //关闭当前标签
                        that.closeTab(mtab);
                        break;
                    case 'remove-other':  //关闭除当前的其他标签
                        var tid = tablis.attr("id");
                        $.each(ulCell.find("li"),function (i,cls) {
                            var rtab = $(cls).attr('tabcell'),rclose = $(cls).attr('tabclose');
                            if(rclose == "true" && tid != $(cls).attr('id')) that.closeTab(rtab);
                        });
                        break;
                    case 'remove-right': //关闭右边的标签
                        $.each(tablis.nextUntil(),function(i,cls) {
                            var rtab = $(cls).attr('tabcell'),rclose = $(cls).attr('tabclose');
                            if(rclose == "true") that.closeTab(rtab);
                        });
                        break;
                    case 'remove-left':  //关闭左边的标签
                        $.each(tablis.prevUntil(),function(i,cls) {   
                            var rtab = $(cls).attr('tabcell'),rclose = $(cls).attr('tabclose');
                            if(rclose == "true") that.closeTab(rtab);
                        });
                        break;
                }
            });
            //鼠标移开后右键菜单消失
            menuCell.mouseleave(function() {
                $(this).fadeOut('slow',function () {
                    $(this).remove()
                });
            });
            $('body').click(function() {
                menuCell.fadeOut('slow',function () {
                    $(this).remove()
                });
            })
        },
        /**
         * 设置每个卡所在位置，计算最大移动量
         */
        setTabPos:function() {
            var that = this;
            that.maxMove = 0;
            for (var i = 0; i < that.tabsArr.length; i++) {
                that.maxMove += that.tabItem[that.tabsArr[i].tab].tabLis.outerWidth(true);
                that.tabsArr[i].where = that.maxMove;
            }
            if (that.scrolled) {
                //减去左右margin的宽度
                var lbw = that.leftCell.outerWidth(true),
                    rbw = that.rightCell.outerWidth(true) + parseInt(that.tabItemWrap.css("padding-right"), 10);
                that.tabItemWrap.width(that.tabContrlWrap.width() - lbw - rbw);
            } else {
                that.tabItemWrap.width(that.tabContrlWrap.width());
            }
            that.maxMove -= that.tabItemWrap.width();
        },
        /**
         * 显示滚动条
         */
        showScroll:function() {
            //获得最后一个选项卡所在位置
            var that = this, lastWhere = that.tabsArr[that.tabsArr.length - 1].where,
                itemScroll = "tab-itemwrap-scroll", tabScroll = "tab-scroll";
            //获得控制层的宽度
            var contrlWidth = that.tabContrlWrap.width();
            //超出控制层，并且未显示滚动条
            if (lastWhere > contrlWidth && !that.scrolled) {
                that.tabItemWrap.addClass(itemScroll);
                that.leftCell.addClass(tabScroll);
                that.rightCell.addClass(tabScroll);
                that.scrolled = true;
                that.setTabPos();
            } else if (contrlWidth > lastWhere && that.scrolled) {
                //为超出控制层，并且已显示滚动条
                that.tabItemWrap.removeClass(itemScroll);
                that.leftCell.removeClass(tabScroll);
                that.rightCell.removeClass(tabScroll);
                that.scrolled = false;
                that.setTabPos();
            }
        },
        /**
         * 判断滚动条左右是否可用
         */
        useScroll:function() {
            var that = this, Disd = "disabled", butDis = "tab-btndisable";
            that.scrollComplete = !that.scrollComplete;
            if (that.scrolled) {
                var itemWrapWhere = parseInt(that.tabItemMove.css("margin-left"), 10);
                if (itemWrapWhere >= 0) {
                    //左不能点击
                    that.leftCell.attr(Disd, true).addClass(butDis);
                    that.rightCell.removeAttr(Disd).removeClass(butDis);
                } else if (Math.abs(itemWrapWhere) >= that.maxMove) {
                    //右不能点击
                    that.leftCell.removeAttr(Disd).removeClass(butDis);
                    that.rightCell.attr(Disd, true).addClass(butDis);
                } else {
                    //全能点击
                    that.leftCell.removeAttr(Disd).removeClass(butDis);
                    that.rightCell.removeAttr(Disd).removeClass(butDis);
                }
            }
        },
        /**
         * 移动
         * @param {string} oper 1|0
         * @param {number} num
         */  
        shiftPosition:function(oper, num) {
            var that = this, fval = oper == 1 ? "+" : "-";
            if (!that.scrollComplete) return;
            //获得当前位置
            var marLeftPos = parseInt(that.tabItemMove.css("margin-left"), 10);
            //判断+或-
            if (fval === "+") {
                //为0直接返回
                if ( marLeftPos === 0) {
                    return;
                } else if ( marLeftPos + num > 0) {
                    //加上移动位置后若大于0, 移动量为绝对值
                    num = Math.abs( marLeftPos);
                }
            } else if (fval === "-") {
                //当前位置绝对值+移动量，若大于最大移动量
                if (Math.abs( marLeftPos) + num > that.maxMove) {
                    //移动量为差值（ marLeftPos为负数）
                    num = that.maxMove + marLeftPos;
                }
            }
            //移动量大于0时才执行移动
            if (num > 0) {
                that.scrollComplete = !that.scrollComplete;
                that.tabItemMove.animate({
                    "margin-left":fval + "=" + num
                }, 300, function() {
                    that.useScroll();
                });
            }
        },
        /**
         * 直接移动到合适的可见位置
         */
        shiftVisible:function() {
            //获得move层当前的margin
            var that = this, movePos = parseInt(that.tabItemMove.css("margin-left"), 10),
                //获得当前激活卡
                activeTab = that.tabItem[that.active],
                //获得当前激活卡的属性
                activeTabProp = that.getItemProp(that.active),
                //获得卡左侧位置
                activeTabLeftPos = activeTabProp.where - activeTab.tabLis.outerWidth(true) + movePos,
                //获得卡右侧位置
                activeTabRightPos = activeTabProp.where + movePos,
                //获得卡包围层的宽度
                getWrapWidth = that.tabItemWrap.width();
            //已显示滚动条
            if (that.scrolled) {
                //如果左侧在范围外
                if (activeTabLeftPos < 0) {
                    //如果最后一个卡的右侧位置+移动后的位置还未到达最右端
                    if (that.tabsArr[that.tabsArr.length - 1].where + movePos + Math.abs(activeTabLeftPos) < getWrapWidth) {
                        that.shiftPosition(1, getWrapWidth - (that.tabsArr[tabsArr.length - 1].where + movePos));
                    } else {
                        //移动到可见位置
                        that.shiftPosition(1, Math.abs(activeTabLeftPos));
                    }
                } else if (activeTabRightPos > getWrapWidth) {
                    //如果右侧在范围外
                    that.shiftPosition(0, activeTabRightPos - getWrapWidth);
                } else if (that.tabsArr[that.tabsArr.length - 1].where + movePos < getWrapWidth) {
                    //左右都在范围内，但最后一个卡右侧未达到最右端
                    that.shiftPosition(1, getWrapWidth - (that.tabsArr[that.tabsArr.length - 1].where + movePos));
                }
            } else {
                //如果左侧在范围外
                if (movePos < 0) {
                    //移动到最左端
                    that.shiftPosition(1, Math.abs(movePos));
                }
            }
        },
        /**
         * 获得ItemID
         * @param {string | number} tabId
         */
        getItemTab:function(tabId) {
            if (typeof tabId === "number") {
                tabId = this.getItemObj(tabId).tab;
            }
            return tabId;
        },
        /**
         * 获得Item的属性
         * @param {string} tabId
         */
        getItemProp:function(tabId) {
            for (var i = 0; i < this.tabsArr.length; i++) {
                if (this.tabsArr[i].tab === tabId) {
                    return this.tabsArr[i];
                }
            }
        },
        /**
         * 获得Item对象
         * @param {number} index
         */
        getItemObj:function(index) {
            return this.tabItem[this.tabsArr[index].tab];
        },
        /**
         * 重置各属性值
         */
        resize:function() {
            this.setTabPos();
            this.showScroll();
            this.shiftVisible();
        }
    };
    return jeTabPane;
});