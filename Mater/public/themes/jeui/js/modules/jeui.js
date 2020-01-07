/**
 * @Name：jeui 常用元素或工具
 * @Author：chen guojun
 */

;!function(win){ 
    "use strict";
    var JEUI = function(){
        this.version = "1.0.2" ; //版本号
    };
    var extend = function(){
        var options, name, src, copy,
            target = arguments[0],i = 1,
            length = arguments.length,
            deep = false;
        //处理深拷贝的情况
        if (typeof (target) === "boolean") deep = target,target = arguments[1] || {},i = 2;
        //处理时，目标是一个字符串或（深拷贝可能的情况下）的东西
        if (typeof (target) !== "object" && typeof (target) !== "function") target = {};
        //如果只有一个参数传递
        if (length === i) target = this,--i;
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name],copy = options[name];
                    if (target === copy) continue;
                    if (copy !== undefined) target[name] = copy;
                }
            }
        }
        return target;
    };
    var jepro = JEUI.prototype;
    var getPath = (function() {
        var tags = document.getElementsByTagName("script"),
            script = tags[tags.length - 1],
            url = script.hasAttribute ? script.src : script.getAttribute( 'src', 4 );
        return url.replace(/\/[^\/]+$/, "");
    })();    
    //加载JS与CSS
    var jeRequire = function () {
        var seaset = {
            baseUrl:'',
            paths:{},
            urlArgs:""
        };
        this.config = function (opts) {
            return extend(seaset, opts || {});
        };
        this.use = function (srcurl,sucfun) {
            if(srcurl && typeof (srcurl) == "function"){
                this.ready(srcurl);
            }else {
                new loadrun(srcurl,sucfun);
            }
        };
        this.ready = function ( callback ) {
            if ( document.readyState === "complete" ) {
                callback && callback();
            } else {
                var docReady = (function () {
                    document.addEventListener("DOMContentLoaded", function () {
                        document.removeEventListener("DOMContentLoaded", docReady);
                        callback && callback();
                    });
                })();
            }
        };
        var getKey = function (obj) {
            var keyArr = [];
            for(var key in obj){ keyArr.push(key); }
            return keyArr;
        }, arrayContain = function(array, obj){
            for (var i = 0; i < array.length; i++){
                if (array[i] == obj) return true;
            }
            return false;
        };
        var opts = this.config(), basePath = opts.baseUrl != "" ? opts.baseUrl : getPath;
        var head = document.head || document.getElementsByTagName('head')[0];
        function loadrun(urls,callback) {
            var loader = function (urlarr, sucfun) {
                var returl,spath,tmp,srcl,url = arrayContain(getKey(opts.paths),urlarr) ? opts.paths[urlarr] : urlarr;
                var ext = url.split(/\./).pop(),
                    isCSS = (ext.replace(/[\?#].*/, '').toLowerCase() == "css"),
                    node = document.createElement(isCSS ? "link" : "script");
                
                if (/^(\w+)(\d)?:.*/.test(url)) { //如果本来就是完整路径
                    returl = url;
                } else {
                    tmp = url.charAt(0);
                    spath = url.slice(0,2);
                    if(tmp != "." && tmp != "/"){ //当前路径
                        returl = basePath + "/" + url;
                    }else if(spath == "./"){ //当前路径
                        returl = basePath + url.slice(1);
                    }else if(spath == ".."){ //相对路径
                        srcl = basePath;
                        url = url.replace(/\.\.\//g,function(){
                            srcl = srcl.substr(0,srcl.lastIndexOf("/"));
                            return "";
                        });
                        returl = srcl + "/" + url;
                    }
                }
                //为uri添加一个统一的后缀
                if (!isCSS && !/\.js$/.test(returl)) {
                    returl += ".js";
                }
                node.src = opts.baseUrl + returl + opts.urlArgs;
                if (isCSS) {
                    node.type = "text/css";
                    node.rel = "stylesheet";
                } else {
                    node.type = "text/javascript";
                    node.async = true;
                }
                head.appendChild(node);

                node.onerror = function (oError) {
                    console.error("Error: "+ url + " \u4E0D\u5B58\u5728\u6216\u65E0\u6CD5\u8BBF\u95EE");
                };
                if (node.readyState) {
                    //IE
                    node.onreadystatechange = function () {
                        if (node.readyState == "loaded" || node.readyState == "complete") {
                            node.onreadystatechange = null;
                            sucfun && sucfun();
                        }
                    };
                } else {
                    //Others
                    node.onload = function () {
                        sucfun && sucfun();
                    };
                }
            };
            var index = 0, loadStart = function (url) {
                loader(url, function () {
                    var idx = ++index;
                    if(idx == urls.length){
                        callback && callback();
                    }else {
                        loadStart(urls[index]);
                    }
                });
            };
            if (urls && urls.length > 0) {
                loadStart(urls[index]);
            };

        }
    };
    /**
     * 随机ID，默认10位
     * @param num 生成ID的位数
     * @returns
     */
    jepro.uuid = function(num) {
        var len = num || 10, str = "", arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        for (var i = 0; i < len; i++) str += arr[Math.round(Math.random() * (arr.length - 1))];
        return str;
    };
    /** 
     * 解析URL地址 
     * @param url 域名路径
     * jeui.parsURL( url ).file;     // = 'index.html'  	
     * jeui.parsURL( url ).hash;     // = 'top'  	
     * jeui.parsURL( url ).host;     // = 'www.abc.com'
     * jeui.parsURL( url ).query;    // = '?id=255&m=hello'  
     * jeui.parsURL( url ).queryURL  // = 'id=255&m=hello' 	
     * jeui.parsURL( url ).params;   // = Object = { id: 255, m: hello }  	
     * jeui.parsURL( url ).prefix;   // = 'www'
     * jeui.parsURL( url ).path;     // = '/dir/index.html'  	
     * jeui.parsURL( url ).segments; // = Array = ['dir', 'index.html']  	
     * jeui.parsURL( url ).port;     // = '8080'  	
     * jeui.parsURL( url ).protocol; // = 'http'  	
     * jeui.parsURL( url ).source;   // = 'http://www.abc.com:8080/dir/index.html?id=255&m=hello#top' 
     * 如果不填 url 则获取的是当前域名路径
    */
    jepro.parsURL = function ( url ) { 
        url = arguments[0] == undefined ? window.location.href : url;	
        var a =  document.createElement('a');  	
        a.href = url;  	
        return {  	
            source: url,	
            protocol: a.protocol.replace(':',''),	
            host: a.hostname,	
            port: a.port,  	
            query: a.search,
            params: (function(){  	
                var ret = {},seg = a.search.replace(/\?/,'').split('&'),len = seg.length, i = 0, s;
                for (;i<len;i++) {  	
                    if (!seg[i]) { continue; }  	
                    s = seg[i].split('=');
                    var isw = /\?/.test(s[0]) ? s[0].split("?")[1] : s[0];
                    ret[isw] = s[1];
                }  	
                return ret;  
            })(),  
            prefix: a.hostname.split('.')[0],
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1], 	
            hash: a.hash.replace('#',''),  	
            path: a.pathname.replace(/^([^\/])/,'/$1'),  	
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],  	
            segments: a.pathname.replace(/^\//,'').split('/'),
            queryURL:a.search.replace(/^\?/,''),
        };  	
    };
    /**
     * 保留符点数后几位，默认保留一位
     * @param num 要格式化的数字
     * @param pos 要保留的位数,不传默认保留两位
     * @returns
     */
    jepro.formatNum = function (num,pos){
        // 默认保留一位
        pos = pos ? pos : 2;
        // 四舍五入
        var pnum = Math.round(num*Math.pow(10,pos))/Math.pow(10,pos), 
            snum = pnum.toString(), len = snum.indexOf('.');
        // 如果是整数，小数点位置为-1
        if(len<0){
            len = snum.length;
            snum += '.';
        }
        // 不足位数以零填充
        while(snum.length<=len+pos){
            snum += '0';
        }
        return snum;
    };
    /**
     * 保留符点数后几位，默认保留一位
     * @param wrapCell  外层ID或类名
     * @param checkCell 全选ID或类名
     * @param curr      选中后的样式
     */
    jepro.chunkSelect = function(wrapCell,checkCell,curr){
        $(checkCell).on('click', function(event){
            var that = $(this);
            wrapCell.each(function(i,cls){
                var inthat = $(this);
                if(that.is(':checked')){
                    inthat.prop("checked",true).parent().addClass(curr);
                    that.parent().addClass(curr);
                }else {
                    inthat.prop("checked",false).parent().removeClass(curr);
                    that.parent().removeClass(curr);
                }
                
            })
        });
        wrapCell.on("click",function () {
            var inthat = $(this);
            if(inthat.is(':checked')){
                inthat.prop("checked",true).parent().addClass(curr);
            }else {
                inthat.prop("checked",false).parent().removeClass(curr);
            }
        })
    };
    jepro.progress = function (cell, options) {
        var jeProgress = function(elem, params){
            var config = {
                skin:"je-progress",
                success:null                             //加载成功后的回调
            };
            var opts = $.extend(config, params || {}),elCell = $(elem);
            //加载数据
            elCell.each(function(){
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
        new jeProgress(cell, options);
    };
    
    var jeSea = new jeRequire();
    jepro.seaConfig = jeSea.config;
    jepro.use = jeSea.use;
    jepro.ready = jeSea.ready;
    
    win.jeui = new JEUI();

}(window);