/**
 * Created by sinarts on 17/1/11.
 */
;(function(root, factory) {
    //amd
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') { //umd
        module.exports = factory();
    } else {
        root.jeCheck = factory(window.jQuery || $);
    }
})(this, function($) {
    $.fn.jeCheck = function(options){
        return this.each(function() {
            return new jeCheck($(this), options || {});
        })
    };
    $.extend({
        jeCheck:function(elem, options){
            return $(elem).each(function() {
                return new jeCheck($(this), options || {});
            })
        }
    });
    var jeCheck = function (elem, opts){
        var config = {
            jename:"checkbox",
            radioCls:"je-radio",          //radio最外层的样式
            checkCls:"je-check",          //checkbox最外层的样式
            current:'on',                 //被选中的样式
            disabled:"disabled",          //被禁用的样式
            currDisa:"checkDisa",         //被选中加禁用的样式
            attrName:["jetext","勾选"],    //设置文字属性
            switchText:["NO","OFF"],
            icons:['&#xe65c;','&#xe63c;','&#xe6a0;'], 
            itemfun:function(elem){},     //点击当前的回调，elem为当前点击的ID
            success : null                //加载成功后的回调函数
        };
        this.opts = $.extend(config, opts||{});
        this.elCell = elem;
        this.init();
    };
    var jefn = jeCheck.prototype;
    jefn.init = function () {
        var _this = this, opts = _this.opts, thatCell = _this.elCell,
            inpCell = $(thatCell).find("input[jename="+ opts.jename +"]");
        $.each(inpCell,function () {
            var elthat = $(this);
            if(opts.jename == "switch"){
                _this.switchRadioCheck(elthat,opts.jename);
            }else{
                _this.radioCheck(elthat,opts.jename);
            }
        });
        //加载成功后的回调
        if ($.isFunction(opts.success) || opts.success != ("" || null)) {
            opts.success && opts.success(inpCell,opts.jename);
        }
    };
    jefn.switchRadioCheck = function (elem,elattr) {
        var _this = this, opts = _this.opts;
        if (elem.attr('type') == 'checkbox' || elem.attr('type') == 'radio'){
            var wrapTag = elem.attr('type') == 'checkbox' ? $('<ins class="' + opts.checkCls + '-switch"></ins>') : $('<ins class="' + opts.radioCls + '-switch"></ins>');
            var jename = elem.attr(opts.attrName[0]), typename = jename && jename.split(",");
            var swtB = $.isArray(typename) ? typename[1] : opts.switchText[1];
            //创建元素并获取文字
            var spanCls = "<span>"+swtB+"</span><em></em>";
            elem.attr('small') != undefined ? elem.wrap(wrapTag.addClass('small')).after(spanCls) : elem.wrap(wrapTag).after(spanCls);
            _this.checkedBind(elem,elattr);
        }
    }
    jefn.radioCheck = function (elem,elattr) {
        var _this = this, opts = _this.opts, wrapTag = "";
        //判断是否为多选或单选
        if (elem.attr('type') == 'checkbox' || elem.attr('type') == 'radio'){
            //包裹多选或单选
            if(elattr == 'chunk' && elem.attr('type') == 'checkbox'){
                wrapTag = $('<ins class="' + opts.checkCls + '-chunk"></ins>');
            }else{
                wrapTag = elem.attr('type') == 'checkbox' ? $('<ins class="' + opts.checkCls + '"></ins>') : $('<ins class="' + opts.radioCls + '"></ins>');
            }
            //创建元素并获取文字
            var emCls = "<em>" + (elem.attr('type') == 'checkbox' ? opts.icons[0] : opts.icons[1]) + "</em>",
                spanCls = elattr == 'chunk' ? "":"<span class='" + (elem.attr('type') == 'checkbox' ? opts.checkCls : opts.radioCls) + "-text'>" + (elem.attr(opts.attrName[0]) != undefined ? elem.attr(opts.attrName[0]) : opts.attrName[1]) + "</span>";
            var emSpanHtml = emCls + spanCls;
            elem.wrap(wrapTag).after(emSpanHtml);
            _this.checkedBind(elem,elattr);
        }
    };
    jefn.checkedBind = function (elem,elattr) {
        var _this = this, opts = _this.opts, onCls = opts.current, thatCell = _this.elCell,
        //检查switch模式的选中状态
        onCheckSwitch = function (swelem,onCls) {
            var bool = null;
            if (elattr == 'switch') {
                var jename = swelem.attr(opts.attrName[0]), typename = jename && jename.split(",");
                var swtA = $.isArray(typename) ? typename[0] : opts.switchText[0],
                    swtB = $.isArray(typename) ? typename[1] : opts.switchText[1];
                if (swelem.is(':checked')) {
                    swelem.parent().addClass(onCls);
                    swelem.next().html(swtA);
                    bool = true;
                } else {
                    swelem.parent().removeClass(onCls);
                    swelem.next().html(swtB);
                    bool = false;
                }
            }else {
                bool = _this.onSetStyle(swelem, onCls); 
            }
            return bool;
        };
        elem.on('change', function () {
            var inpthis = $(this), rebl = null;
            if (inpthis.attr('type') == 'radio') {
                $(thatCell).find("input[jename="+ elattr +"]").each(function () {
                    rebl = onCheckSwitch($(this), onCls);
                })
            } else if (inpthis.attr('type') == 'checkbox') {
                rebl = onCheckSwitch(inpthis, onCls);
            }
            //点击当前的回调
            if ($.isFunction(opts.itemfun) || opts.itemfun != ("" || null)) {
                opts.itemfun && opts.itemfun(inpthis,rebl);
            }
        });
        //判断是否为选中
        if (elem.is(':checked')) {
            var jename = elem.attr(opts.attrName[0]), typename = jename && jename.split(","),
                swtA = $.isArray(typename) ? typename[0] : opts.switchText[0];
            elem.parent().addClass(opts.current);
            if (elattr == 'switch'){
                elem.next().text(swtA);
            }else {
                if (elem.attr('type') == 'radio') elem.next().html(opts.icons[2]);
            }
        }
        //判断是否为禁用
        if (elem.prop("disabled") == true) {
            elem.parent().removeClass(opts.current).addClass(opts.disabled);
        }
        //判断是否为选中加禁用
        if (elem.is(':checked') && elem.prop("disabled") == true) {
            elem.parent().addClass(opts.current).removeClass(opts.disabled).addClass(opts.currDisa);
        }
    };
    //设置点击后的样式
    jefn.onSetStyle = function (elem, cls) {
        var _this = this, opts = _this.opts, bool = null;
        if (elem.is(':checked')) {
            elem.parent().addClass(cls);
            if (elem.attr('type') == 'radio') elem.next().html(opts.icons[2]);
            bool = true;
        } else {
            elem.parent().removeClass(cls);
            if (elem.attr('type') == 'radio') elem.next().html(opts.icons[1]);
            bool = false;
        }
        return bool;
    };
    return jeCheck;
});
