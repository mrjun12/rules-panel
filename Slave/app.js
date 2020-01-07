/**
 * Created by LiangChen on 2020/1/1/007.
 */
const http = require('http');
const exec = require("child_process").exec;
const schedule = require('node-schedule');
const https = require('https');
//************填写Master URL**************
//列如：https://baidu.com
const master_url = "https://baidu.com"
//************填写节点key**************
const slave_key = '123456';
//************填写主网卡上的IP**************
//如果主网卡IP=公网IP时，当IP变动，需更新此处IP，并且重启本进程！！！
const nic_ip = '1.1.1.1';
//定时器

schedule.scheduleJob('59/2 * * * * *', function (){
    get(master_url+"/api?key="+slave_key,function (res, status, headers) {
        if (status==200) {
            //console.log(res)
            let data = JSON.parse(res);
            if(data.msg == "error"){
                console.log("error,noting to do!!");
            }else if(data.msg == "clear"){
                console.log("clear,now clean forward rules!");
                exe("iptables -t nat -F");
            }else if(data.msg == "rules"){
                console.log("ok,new rules");
                //开始执行
                //清空防火墙
                exe("iptables -t nat -F");
                //循环执行
                for(let i = 0;i<data.rules.length;i++){
                    exe("iptables -w -t nat -A PREROUTING -p tcp --dport "+data.rules[i].local_port+" -j DNAT --to-destination "+data.rules[i].remote_ip+":"+data.rules[i].remote_port+"");
                    exe("iptables -w -t nat -A POSTROUTING -p tcp -d "+data.rules[i].remote_ip+" --dport "+data.rules[i].remote_port+" -j SNAT --to-source "+nic_ip+"");
                    exe("iptables -w -I INPUT -p tcp -m tcp --dport "+data.rules[i].local_port+" -j ACCEPT");
                    exe("iptables -w -t nat -A PREROUTING -p udp --dport "+data.rules[i].local_port+" -j DNAT --to-destination "+data.rules[i].remote_ip+":"+data.rules[i].remote_port+"");
                    exe("iptables -w -t nat -A POSTROUTING -p udp -d "+data.rules[i].remote_ip+" --dport "+data.rules[i].remote_port+" -j SNAT --to-source "+nic_ip+"");
                    exe("iptables -w -I INPUT -p udp -m udp --dport "+data.rules[i].local_port+" -j ACCEPT");
                }
            }else{
                console.log('noting to do');
            }
        }else {
            console.log("status err:"+status);
        }
    },"",'utf8').on('error', function (e) {
        callback("server error: " + e.message);
    });	
});

function exe(cmdStr){
    exec(cmdStr, function(err,stdout,stderr){
        if(err) {
            console.log('error:'+stderr);
        } else {
        }
    });
}


function get(url,callback, reqheaders, charset){
    var protocol = getProtocol(url);
    var _defaultCharSet = 'utf8';

    if(typeof charset === 'string' ){
        _defaultCharSet = charset;
    }
    if(typeof(reqheaders) === "string" && charset === undefined) {
        _defaultCharSet = reqheaders;
    }
    var newheader = {};
    if(reqheaders !== undefined && typeof(reqheaders) === "object") {
        for(var ele in reqheaders) {
            newheader[ele.toLowerCase()] = reqheaders[ele];
        }
    }
    newheader["content-length"] = 0;
    var options = {
        host:getHost(url),
        port:getPort(url),
        path:getPath(url),
        method:'GET',
        headers:newheader
    };

    if(protocol === http || protocol === https){
        return _sendReq(protocol,null,options,_defaultCharSet,callback);
    }else{
        throw "sorry,this protocol do not support now";
    }

}

function _sendReq(protocol,data,options,_defaultCharSet,callback){
    var content = "";
    var req = protocol.request(options,function(res){
        var status = res.statusCode;
        var headers = res.headers;
        if(_defaultCharSet==="gbk"){
            res.setEncoding('binary');
        }else{
            res.setEncoding(_defaultCharSet);
        }
        res.on('data',function(chunk){
            content+=chunk;
        });
        res.on('end',function(){
            if(_defaultCharSet==="gbk"){
                content = iconv.decode(new Buffer(content,'binary'),'gbk');
            }
            callback(content,status,headers);
        });
    });
    if(null != data){
        req.write(data+"\n");
    }
    req.end();
    return req;
}
function getProtocol(url){
    return url.substring(0,url.indexOf(":")) === 'https' ? https : http;;
}
function getPort(url) {
    var hostPattern = /\w+:\/\/([^\/]+)(\/)?/i;
    var domain = url.match(hostPattern);

    var pos = domain[1].indexOf(":");
    if(pos !== -1) {
        domain[1] = domain[1].substr(pos + 1);
        return parseInt(domain[1]);
    } else if(url.toLowerCase().substr(0, 5) === "https") return 443;
    else return 80;
}
function getHost(url){
    var hostPattern = /\w+:\/\/([^\/]+)(\/)?/i;
    var domain = url.match(hostPattern);

    var pos = domain[1].indexOf(":");
    if(pos !== -1) {
        domain[1] = domain[1].substring(0, pos);
    }
    return domain[1];
}
function getPath(url){
    var pathPattern = /\w+:\/\/([^\/]+)(\/.+)(\/$)?/i;
    var fullPath = url.match(pathPattern);
    return fullPath?fullPath[2]:'/';
}
