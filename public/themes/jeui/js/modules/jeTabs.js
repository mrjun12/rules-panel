;(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "object") {
        //umd
        module.exports = factory();
    } else {
        root.jeTabs = factory(window.$ || $);
    }
})(this, function($) {    
    //点击切换Tabs选项卡面板
    var tabClick = function (elem,opts) {
        var curr = opts.currCls,
            headCell = elem.find(opts.titCls).children(),
            conCell = elem.find(opts.conCls).children();
        headCell.on(opts.trigger,function () {
            var jthis = $(this), idx = jthis.index();
            jthis.addClass(curr).siblings().removeClass(curr);
            conCell.eq(idx).addClass(curr).siblings().removeClass(curr);
        })
    }
    //创建Tabs选项卡
    var createTabPane = function (opts,isclose) {
        var curr = opts.currCls,
            headCell = opts.elem.find(opts.titCls),
            conCell = opts.elem.find(opts.conCls);
        headCell.children().removeClass(curr);
        conCell.children().removeClass(curr);  
        //创建新元素
        var lis = $("<"+opts.litag+"/>",{"class":curr}),
            divs = $("<"+opts.contag+"/>",{"class":opts.childCls}).addClass(curr);
        var close = isclose ? $('<em/>',{"class":"close"}) : "";
        headCell.append(lis.text(opts.title||"").append(close));
        conCell.append(divs.html(opts.content||""));
        //判断是否可以关闭Tabs
        if(isclose){
            close.on("click",function () {
                var cthis = $(this),tlis = cthis.parent(),
                    concls = conCell.children(),
                    idx = tlis.index();
                closeTabMove(headCell.children(),concls,tlis,idx,curr);
            })
            tabClick(opts.elem,opts);
        }  
    }
    //统一选项卡关闭
    var closeTabMove = function (tit,con,tli,idx,curr) {
        tit.removeClass(curr).eq(idx-1).addClass(curr);
        con.removeClass(curr).eq(idx-1).addClass(curr);
        con.eq(idx).remove(); 
        tli.remove(); 
    };
    
    var jeTabs = function(elem, opts) {
        var config = {
            titCls:".je-tabs-title",
            conCls:".je-tabs-content",
            childCls:"je-tabs-item",
            currCls:"on",                            //当前高亮的标识clss
            trigger:"click",                         //选项卡事件
            isClose:true,                            //是否开启关闭按钮
            tabIndex:1,                              //默认的当前位置索引。1是第一个；表示从第几个开始 
            itemfun:function(elem, index, val) {},   //点击当前的回调，elem：当前Select的ID index：索引 val：选中的值
            success:null                             //加载成功后的回调
        }
        this.opts = $.extend(config, opts || {});
        this.elCell = $(elem);
        this.inopts = this.init();
        return this;
    };
    
    var jefn = jeTabs.prototype;
    //初始化Tabs
    jefn.init = function () {
        var that = this, opts = that.opts, curr = opts.currCls,
            headCell = that.elCell.find(opts.titCls).children(),
            conCell = that.elCell.find(opts.conCls).children();
        headCell.removeClass(curr).eq(opts.tabIndex - 1).addClass(curr);    
        conCell.removeClass(curr).eq(opts.tabIndex - 1).addClass(curr);
        
        var elobj = {elem:that.elCell},
            pli = headCell.prop("tagName") || "li";
            pcon = conCell.prop("tagName") || "div";
        if(headCell.find(".close")[0]){
            headCell.find(".close").on("click",function(){
                var cthis = $(this),tlis = cthis.parent(),idx = tlis.index(),
                    titcld = that.elCell.find(opts.titCls).children(),
                    concld = that.elCell.find(opts.conCls).children();
                closeTabMove(titcld,concld,tlis,idx,curr);
            })
        }
        //切换Tabs
        tabClick(that.elCell,opts);
        return $.extend(true,elobj,opts, {litag:pli,contag:pcon});
    }
    //添加Tabs选项卡面板
    jefn.addTabs = function(arr){
        var opts = $.extend(this.inopts, arr||{});
        opts.elem.unbind(opts.trigger,tabClick);
        createTabPane(opts,opts.close||true);
    }
    $.fn.jeTabs = function(options) {
        return new jeTabs($(this), options || {});
    };
    $.extend({
        jeTabs:function(elem, options) {
            return new jeTabs(elem, options || {});
        }
    });
    return jeTabs;
});