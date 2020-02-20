-- Adminer 4.7.5 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `rules_log`;
CREATE TABLE `rules_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `server_id` int(11) NOT NULL COMMENT '服务器的ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `username` varchar(255) NOT NULL COMMENT '用户名称',
  `doing_type` int(255) NOT NULL COMMENT '动作类型：0：增加，1：修改，2：删',
  `local_port` varchar(255) NOT NULL COMMENT '本地监听端口',
  `remote_port` varchar(255) NOT NULL COMMENT '远程监听端口',
  `remote_cname` varchar(255) DEFAULT NULL COMMENT '远程cname',
  `remote_ip` varchar(255) NOT NULL COMMENT '远程服务器ip',
  `date_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;


DROP TABLE IF EXISTS `server_list`;
CREATE TABLE `server_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '服务器ID',
  `name` varchar(255) NOT NULL COMMENT '服务器名称',
  `server_cname` varchar(255) NOT NULL COMMENT '服务器cname',
  `server_ip` varchar(255) NOT NULL COMMENT '服务器IP',
  `server_port` varchar(255) NOT NULL COMMENT '服务器ssh端口',
  `server_key` varchar(255) NOT NULL,
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;


DROP TABLE IF EXISTS `server_log`;
CREATE TABLE `server_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `doing_type` int(11) NOT NULL COMMENT '0:增加，2：删除',
  `server_name` varchar(255) NOT NULL,
  `date_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;


DROP TABLE IF EXISTS `server_rules`;
CREATE TABLE `server_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `server_id` int(11) NOT NULL COMMENT '服务器ID',
  `local_port` int(255) NOT NULL COMMENT '服务器本地监听端口',
  `local_ip` varchar(255) DEFAULT NULL,
  `remote_cname` varchar(255) DEFAULT NULL COMMENT '远程服务器ddns',
  `remote_ip` varchar(255) NOT NULL COMMENT '远程IP',
  `remote_port` int(255) NOT NULL COMMENT '远程监听端口',
  `status` int(255) NOT NULL DEFAULT '0' COMMENT '状态：0：等待生效，1：已生效',
  `enable` int(255) NOT NULL DEFAULT '1',
  `user_id` int(11) NOT NULL,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `user_id` (`user_id`),
  CONSTRAINT `server_rules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键自增ID',
  `username` varchar(255) NOT NULL COMMENT '用户名(唯一)',
  `password` varchar(255) NOT NULL COMMENT '密码（MD5加密）',
  `admin` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:不是管理员，1：是管理员',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

INSERT INTO `user` (`id`, `username`, `password`, `admin`) VALUES
(1,	'admin',	'e10adc3949ba59abbe56e057f20f883e',	1);

DROP TABLE IF EXISTS `user_server`;
CREATE TABLE `user_server` (
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `server_id` int(11) NOT NULL COMMENT '服务器id',
  PRIMARY KEY (`user_id`,`server_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;


-- 2020-02-20 13:19:40
