/**
 * Created by sinarts on 17/2/22.
 */
(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "object") {
        //umd
        module.exports = factory();
    } else {
        root.jeTable = factory(window.$ || $);
    }
})(this, function($) {
    var regPxe = /\px|pt|em|rem/g,je = {},
    jeTable = function(elem, opts) {
        var config = {
            skin:"je-grid",                    //默认风格
            width:"100%",                             //表格标签宽度
            height:"auto",                            //表格标签宽度
            columnSort:[],                            //头部可排序的数，如[1,3,5],其中1表示第一个可排序
            columns:[],                               //数据模型
            pageField:{                               //分页对象或函数
                pageIndex:{field:"size",num:1},       //默认为第一页
                pageSize:{field:"pagesize",num:12},   //默认每页显示12条
                dataCount:"",                         //数据记录统计字段
                pageCount:"",                         //页码统计字段
                ellipsis:false                        //是否显示两边省略号
            },
            datas:{url:"",type:"GET",data:{},dataType:"json",field:""},  //AJAX请求的参数。可以是普通对象或函数。 函数返回一个参数对象
            isPage:true,                              //是否显示分页
            itemfun:function(elem,data) {},           //当前的回调，elem为表格当前行的ID, data为表格当前行的数据
            success:null                              //加载成功后的回调
        };
        this.opts = $.extend(true,config, opts || {});
        this.elCell = elem;
        this.init();
    };

    je.isBool = function(obj){  return (obj == undefined || obj == true ?  true : false); };

    $.fn.jeTable = function(options) {
        return this.each(function() {
            return new jeTable($(this), options || {});
        });
    };
    $.extend({
        jeTable:function(elem, options) {
            return $(elem).each(function() {
                return new jeTable($(this), options || {});
            });
        }
    });
    var jefn = jeTable.prototype;
    jefn.init = function () {
        var that = this, opts = that.opts, pageIdxSize = {}, pgField = opts.pageField;
        var wrapDiv = $('<div class="' + opts.skin + '"></div>'),
            theadDiv = $('<div class="' + opts.skin + '-thead"></div>'),
            tbodyDiv = $('<div class="' + opts.skin + '-tbody"></div>'),
            fieldDiv = $('<div class="' + opts.skin + '-field"></div>'),
            maskDiv = $('<div class="' + opts.skin + '-mask"></div>');
        that.elCell.html(wrapDiv.append(theadDiv.append("<table jetableth><thead><tr></tr></thead></table>")).append(tbodyDiv.append(maskDiv).append("<table jetabletd><tbody></tbody></table>")));
        wrapDiv.css({width:(opts.width == "100%" ? "auto" : opts.width),position:"relative","overflow":"hidden"});
        tbodyDiv.after(fieldDiv.append("<h3><span>字段列表</span><em></em></h3><ul></ul>"));
        theadDiv.after("<div class='fielddrop'></div>");
        that.setContent();
        that.showField(fieldDiv);
        pageIdxSize[pgField.pageIndex.field] = pgField.pageIndex.num;
        pageIdxSize[pgField.pageSize.field] = pgField.pageSize.num;
        that.loadDates(wrapDiv,pageIdxSize);
    };
    
    jefn.loadDates = function (elem,datas) {
        var that = this, opts = that.opts, colDate = opts.columns, dataObj = opts.datas,
            pgField = opts.pageField, dataArr = $.extend(dataObj.data,datas),
            tbody = that.elCell.find("table[jetabletd]"),
            maskCls = that.elCell.find('.' + opts.skin + '-mask');
        //载入内容前先清空
        tbody.find('tbody').empty();
        maskCls.show().html("<div class='loading'>正在载入数据...</div>");
        //把数据插入到tbody内
        var tbodySuccess = function (data,json) {
            json = json || "";
            tbody.find('tbody').empty();
            //循环数据插入内容
            $.each(data,function(idx,val){
                var tr = $("<tr row='"+idx+"'></tr>");
                $.each(colDate,function (i,d) {
                    var isShow = je.isBool(d.isShow), alVal = d.align||"left";
                    var renVal = (d.renderer != "" && d.renderer != undefined) ? d.renderer(val,idx) : val[d.field],  
                        tdCls = $("<td class='field-"+d.field+"'><div>"+renVal+"</div></td>").addClass("dfields").attr("align",alVal).css({width:d.width});
                    tr.append(isShow ? tdCls : tdCls.hide());
                });
                tbody.find('tbody').append(tr);
                //加载成功后的回调
                if ($.isFunction(opts.itemfun) || opts.itemfun != ("" || null)) {
                    opts.itemfun && opts.itemfun(tr,val);
                }
            });
            //表格分页设置，判断分页DIV是否已经存在，如果不存在就创建
            if (opts.isPage && that.elCell.find("."+ opts.skin +"-page").length == 0){
                //创建分页DIV
                var pageDiv = $('<div class="' + opts.skin + '-page"></div>');
                elem.append(pageDiv);
                //执行分页插件
                pageDiv.jeTablePage({
                    dataCount:json[pgField.dataCount],
                    pageCount:json[pgField.pageCount],
                    ellipsis:pgField.ellipsis,
                    jumpChange:function (page) {
                        //获取分页页码的key值与当前分页数组成对象
                        var obj = {};
                        obj[pgField.pageIndex.field] = page; 
                        //点击后刷新内容加载
                        that.loadDates(elem,$.extend(true,dataArr,obj));
                    }  
                });
            }
            //下拉按钮与字段列表的显示隐藏
            var eltheadCls = that.elCell.find("."+ opts.skin +"-thead"),
                fielddrop = that.elCell.find(".fielddrop");
            eltheadCls.on("mouseenter",function(){
                if(fielddrop.is(":hidden")) fielddrop.slideDown('fast');
            });
            $("."+ opts.skin).on('mouseleave', function(){
                fielddrop.slideUp('fast');
            });
            that.elCell.find("."+ opts.skin +"-tbody").on("mouseenter",function(){
                if(fielddrop.is(":visible")) fielddrop.slideUp('fast');
            });
            //点击显示字段列表
            fielddrop.on("click",function(){
                var elfieldCls = that.elCell.find("."+ opts.skin +"-field");
                elfieldCls.css({top:eltheadCls.outerHeight(true),bottom:that.elCell.find("."+ opts.skin +"-page").outerHeight(true)})
                fielddrop.hide();
                elfieldCls.slideDown('fast');
                //点击隐藏字段列表
                elfieldCls.find("h3 em").on("click",function(){
                    elfieldCls.slideUp('fast');
                })
            });
            //加载成功后的回调
            if ($.isFunction(opts.success) || opts.success != "" || opts.success != null) {
                opts.success && opts.success(that.elCell,tbody);
            }
        };
        //拉取数据
        if ($.isArray(dataObj)) {
            tbodySuccess(dataObj,"");
            maskCls.hide();
        } else {
            $.ajax({
                url: dataObj.url,
                type: dataObj.type,
                data: dataArr || {},
                dataType: dataObj.dataType || "json",
                async: dataObj.async || true,
                success: function (json) {
                    var rowVal = dataObj.field == "" ? json : json[dataObj.field];
                    if(rowVal.length == 0 || rowVal == undefined){
                        maskCls.show().html("<div class='nocontent'>抱歉无更多内容了</div>");
                    }else {
                        tbodySuccess(rowVal,json);
                        maskCls.hide(); 
                    }
                },
                error:function (XMLHttpRequest, textStatus, errorThrown) {
                    maskCls.show().html("<div class='error'>抱歉请求失败了</div>")
                }
            });
        };
    };
    //表格基本框架与宽度设置
    jefn.setContent = function () {
        var that = this, opts = that.opts,colDate = opts.columns,
            thead = that.elCell.find("table[jetableth]"),
            tbody = that.elCell.find("table[jetabletd]");
        var tableSum = 0;
        //设置头部
        $.each(colDate,function (i,d) {
            var isShow = je.isBool(d.isShow), nameval ,dname = d.name;
            nameval = $.isArray(dname) ? ($.isFunction(dname[1]) ? dname[1](dname) : dname[1]) : dname;
            var althVal = d.align||"left",thCls = $("<th class='field-"+d.field+"'><div>"+nameval+"</div></th>").addClass("dfields").attr("align",althVal).css({width:d.width});
            var col = $("<col class='cols-"+d.field+"' cols='true'>").css({width:d.width});
            //为table设置隐藏域的宽度
            $("table[jetableth]",that.elCell).append(isShow ? col : "");
            thead.find("thead tr").append(isShow ? thCls : thCls.hide());
            tableSum += parseInt(isShow ? d.width.replace(regPxe,"") : 0);
        });
        
        //计算表格的宽度及高度
        var tbodyHeight = opts.height == "auto" ? "" : opts.height; 
        tbody.parent().css({height:tbodyHeight});
        that.elCell.find("table").css({width:tableSum});
        //让浮动的头部跟着内容滚动
        tbody.parent().on("scroll",function () {
            var scVal = parseInt("-"+tbody.parent().scrollLeft());
            thead.css({left:scVal});
        });
        //进行表格排序
        if (opts.columnSort.length > 0){
            that.tableSorter({elhead:thead, elbody:tbody, colSort:opts.columnSort}); 
        }
    };
    //表格排序
    jefn.tableSorter = function (obj) {
        var colSort = obj.colSort, eltop = obj.elhead, thCls = eltop.find("thead th"),all = "all", sa = "asc", sd = "desc",
            elcon = (obj.elbody == "" || obj.elbody == undefined) ? eltop : obj.elbody;
        $.each(colSort, function(i, d) {
            thCls.eq(d-1).addClass("colsort all").attr("sort", sa).append("<em></em>");
        });
        //取出TD的值，并存入数组,取出前二个TD值；
        var setSort = function(idx,sorted) {
            var sortedMap = [];
            elcon.find("tbody tr").each(function() {
                var ts = $(this), tdVal = ts.children("td").eq(idx).text();
                sortedMap.push({row: ts, vals:tdVal});
            });
            //对数据进行排序
            sortedMap.sort(function(ra, rb) {
                var a = ra.vals, b = rb.vals,
                dateSort = function(d1, d2) {
                    if(!isNaN(d1) && !isNaN(d2)){
                        return parseInt(d1) - parseInt(d2);
                    }
                    return d1.localeCompare(d2);
                };
                return sorted == sa ? dateSort(a, b) : dateSort(b, a);
            });
            $.each(sortedMap,function(key,val){
                elcon.find("tbody").append(val.row);
            });
        };
        //点击表格升序/降序
        thCls.on("click",function () {
            var _this = $(this), idx = _this.index();
            if(_this.hasClass("colsort")) {
                eltop.find("thead th.colsort").addClass(all);
                thCls.removeClass(sd).removeClass(sa);
                var deasc = _this.attr("sort") == sa ? sd : sa;
                if (_this.attr("sort") == sa) {
                    _this.attr("sort", sd);
                    _this.removeClass(all).addClass(sd);
                } else {
                    _this.attr("sort", sa);
                    _this.removeClass(all).addClass(sa);
                }
                setSort(idx, deasc);
            }
        })
    };
    
    //是否显示字段内容
    jefn.showField = function (fieldCls) {
        var that = this, opts = that.opts,colDate = opts.columns,
            thead = that.elCell.find("table[jetableth]"), 
            tbody = that.elCell.find("table[jetabletd]");
        //把相应的字段显示
        $.each(colDate,function (i,d) {
            var isShow = je.isBool(d.isShow),sname = d.name, 
                nameval = $.isArray(sname) ? sname[0] : sname;
            var fp = $("<li class='jetablego-"+d.field+"'><label><input name='field' field='"+d.field+"' "+(isShow ? "checked" : "")+" type='checkbox' value='' /> "+nameval+"</label></li>");
            fieldCls.find("ul").append(fp);
        });
        //点击后对相应的字段内容进行隐藏显示
        fieldCls.find("li label").on("click",function () {
            var inputs = $(this).find("input"),
                isCheck = inputs.prop('checked'),
                fields = inputs.attr("field");
            //判断字段复选框是否选中
            if (isCheck){
                that.elCell.find(".cols-"+fields).attr("cols","true");
                that.elCell.find(".field-"+fields).addClass("dfields").show();
            }else {
                that.elCell.find(".cols-"+fields).attr("cols","false");
                that.elCell.find(".field-"+fields).removeClass("dfields").hide();
            };
            //获取非隐藏字段的宽度
            var colW = 0;
            thead.each(function () {
                colW += parseInt($(this).find("col[cols=true]").css("width").replace(regPxe,""));
            });
            that.elCell.find("table").css({width:colW});
        })
    };
    return jeTable;
});

;(function($) {
    var isEven = function (num) {  // true偶数, false奇数
        return (parseInt(num)%2 == 0) ? true : false;
    }, jePage = function(elem, options) {
        var defaults = {
            pageIndex: 1,            //当前页码，1表示第一页
            pageSize: 5,             //每页显示数量
            pageCount: 50,           //显示项的总数量
            dataCount: 0,
            ellipsis:true,           //是否显示两边省略号
            firstText: '首页',//
            lastText: '尾页',
            prevText: "上一页",       //上一页按钮显示的文字
            nextText: "下一页",       //下一页按钮显示的文字
            hashUrl: null,           //构造页码按钮链接href的方法,包含一个pageIndex参数，不传则返回"javascript:;"
            jumpChange: null         //点击页码后的回调函数，包含一个pageIndex参数
        };
        this.elCell = elem;
        this.opts = $.extend(defaults, options || {});
        this.init();
    };
    $.fn.jeTablePage = function(options) {
        return this.each(function() {
            return new jePage($(this), options || {});
        });
    };
    var jepg = jePage.prototype;
    jepg.init = function () {
        var that = this, opts = that.opts;
        this.createHtml(opts.pageIndex);
        that.bindEvent();
    };
    jepg.createHtml = function(pagenum) {
        pagenum = parseInt(pagenum);
        if(isEven(this.opts.pageSize)){alert("请将pageSize设为奇数，且不能小于3");return}
        var that = this, opts = that.opts, html = [],
            start = opts.pageIndex, group = opts.pageSize,
            pageCount = Math.ceil(opts.pageCount),
            dataCount = parseInt(opts.dataCount),
            onBoth = Math.floor(opts.pageSize / 2);
        if (pagenum >= group) {
            start = pagenum - onBoth;
            group = pagenum + onBoth;
        }
        if (group > pageCount) {
            start = pageCount - onBoth*2;
            group = pageCount;
        }
        if (start < 1) start = 1;
        //统计页码的条数
        html.push('<span class="pagecount">共<em>' + pageCount + '</em>页</span>');
        //统计数据的条数
        if (dataCount > 0 || dataCount != "") {
            html.push('<span class="datacount">共<em>' + dataCount + '</em>条记录</span>');
        }
        //生成上一页的按钮
        if (pagenum > 1) {
            html.push('<a data-page="' + (pagenum - 1) + '" href="' + that.hashUrl(pagenum - 1) + '" class="flip" title="上一页">' + opts.prevText + '</a>');
        } else {
            html.push('<span class="flip noPage" title="上一页">' + opts.prevText + '</span>');
        }
        // 第一页
        if (pagenum > opts.pageSize - 1) {
            var firstText = opts.ellipsis ? (opts.firstText == "" ? 1 : opts.firstText) : opts.firstText;
            html.push("<a href='" + that.hashUrl(1) + "' data-page='" + 1 + "' class='flip' title='"+firstText+"'>"+firstText+"</a> ");
            if(opts.ellipsis) html.push("<span>···</span>");
        }
        // 循环渲染可见的按钮
        for (var i = start; i <= group; i++) {
            if(i == pagenum){
                html.push('<span class="current">' + i + '</span>');
            }else{
                html.push('<a href="' + that.hashUrl(i) + '" data-page="' + i + '" title="' + i + '">' + i + '</a>');
            }
        }
        // 最后一页
        if (pagenum < pageCount - (onBoth + 1)) {
            var lastText =  opts.ellipsis ? (opts.lastText == "" ? pageCount : opts.lastText) : opts.lastText;
            if(opts.ellipsis) html.push("<span>···</span> ");
            html.push("<a href='" + this.hashUrl(pageCount) + "' data-page='" + pageCount + "' class='flip' title='" + lastText + "'>" + lastText + "</a> ");
        }
        //生成下一页的按钮
        if (pagenum < pageCount) {
            html.push('<a data-page="' + (pagenum + 1) + '" href="' + that.hashUrl(pagenum + 1) + '" class="flip" title="下一页">' + opts.nextText + '</a>');
        } else {
            html.push('<span class="flip noPage">' + opts.nextText + '</span>');
        }
        //跳转设置页码
        html.push('<span>转到<input type="text" class="gopage"><button type="button" class="gobtn">Go</button></span>');
        that.elCell.html("<div class='pagebox'>"+html.join("")+"</div>");
    };
    jepg.bindEvent = function() {
        var that = this, opts = that.opts;
        that.elCell.on("click", "a", function() {
            var pageIndex = parseInt($(this).data("page"), 10);
            that.createHtml(pageIndex);
            opts.jumpChange && opts.jumpChange(pageIndex);
        });
        that.elCell.on("click", ".gobtn", function() {
            var indexVal = that.elCell.find(".gopage").val();
            if(indexVal != ""){
                that.setPageIndex(indexVal);
            } 
        });
    };
    jepg.hashUrl = function(pageIndex) {
        var that = this, opts = that.opts;
        if ($.isFunction(opts.hashUrl)) {
            return opts.hashUrl(pageIndex);
        }
        return "javascript:;";
    };
    jepg.setPageIndex = function(pageIndex) {
        this.createHtml(pageIndex);
        this.opts.jumpChange && this.opts.jumpChange(pageIndex);
    };
    var jeTablePage = function(y,m,d) {
        return new jePage(new Date(y,m,d));
    };
    return jeTablePage;
})(jQuery);