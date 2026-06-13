-- MySQL dump 10.13  Distrib 8.0.35, for Linux (x86_64)
--
-- Host: localhost    Database: dumptest
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(200) NOT NULL COMMENT '公告标题',
  `content` text NOT NULL COMMENT '公告内容',
  `type` varchar(20) DEFAULT 'info' COMMENT '公告类型: info(信息), warning(警告), error(错误), success(成功)',
  `priority` int DEFAULT '0' COMMENT '优先级: 0=普通, 1=重要, 2=紧急',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 0=禁用, 1=启用',
  `publish_at` datetime DEFAULT NULL COMMENT '发布时间（NULL表示立即发布）',
  `expires_at` datetime DEFAULT NULL COMMENT '过期时间（NULL表示永不过期）',
  `created_by` int DEFAULT NULL COMMENT '创建者用户ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `display_strategy` varchar(20) DEFAULT 'always' COMMENT '显示策略: always(每次显示), once(仅显示一次), hourly(每小时显示)',
  `display_interval` int DEFAULT NULL COMMENT '显示间隔(小时)，用于hourly策略',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_publish_at` (`publish_at`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='公告表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_packages`
--

DROP TABLE IF EXISTS `coin_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '套餐名称',
  `coins` decimal(10,2) NOT NULL COMMENT '金币数量',
  `price` decimal(10,2) NOT NULL COMMENT '价格（人民币）',
  `bonus_coins` decimal(10,2) DEFAULT '0.00' COMMENT '赠送金币',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '套餐描述',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='金币充值套餐表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_packages`
--

LOCK TABLES `coin_packages` WRITE;
/*!40000 ALTER TABLE `coin_packages` DISABLE KEYS */;
INSERT INTO `coin_packages` VALUES (6,'10金币',10.00,1.00,0.00,'新手首充',1,1,'2025-11-03 00:15:24','2025-11-03 00:15:24'),(12,'50金币',50.00,5.00,5.00,'赠送5金币',1,2,'2025-11-03 00:16:13','2025-11-03 00:16:13'),(13,'100金币',100.00,10.00,15.00,'赠送15金币',1,3,'2025-11-03 00:16:13','2025-11-03 00:16:13');
/*!40000 ALTER TABLE `coin_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_size_config`
--

DROP TABLE IF EXISTS `coin_size_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_size_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型：download=下载，dump=砸壳',
  `min_size_mb` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '最小大小（MB）',
  `max_size_mb` decimal(10,2) DEFAULT NULL COMMENT '最大大小（MB），NULL表示无上限',
  `coin_cost` decimal(10,2) NOT NULL COMMENT '金币消耗',
  `sort_order` int DEFAULT '0' COMMENT '排序顺序',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_size_range` (`min_size_mb`,`max_size_mb`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用大小范围金币配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_size_config`
--

LOCK TABLES `coin_size_config` WRITE;
/*!40000 ALTER TABLE `coin_size_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `coin_size_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coin_transactions`
--

DROP TABLE IF EXISTS `coin_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coin_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `type` enum('charge','consume','refund','reward') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易类型',
  `amount` decimal(10,2) NOT NULL COMMENT '金额',
  `balance_before` decimal(10,2) NOT NULL COMMENT '交易前余额',
  `balance_after` decimal(10,2) NOT NULL COMMENT '交易后余额',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易描述',
  `related_id` int DEFAULT NULL COMMENT '关联ID(任务ID等)',
  `related_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联类型',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='金币交易记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_transactions`
--

LOCK TABLES `coin_transactions` WRITE;
/*!40000 ALTER TABLE `coin_transactions` DISABLE KEYS */;
INSERT INTO `coin_transactions` VALUES (133,2,'consume',-0.01,997.76,997.75,'下载: Guide for PUBG: 和平精英 & 绝地求生M 886770385',NULL,NULL,'2026-06-13 07:48:00');
/*!40000 ALTER TABLE `coin_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_usage`
--

DROP TABLE IF EXISTS `daily_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `action_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型：download, dump',
  `usage_date` date NOT NULL COMMENT '使用日期',
  `usage_count` int NOT NULL DEFAULT '0' COMMENT '使用次数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_action_date` (`user_id`,`action_type`,`usage_date`),
  KEY `idx_usage_date` (`usage_date`)
) ENGINE=InnoDB AUTO_INCREMENT=227 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日使用记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_usage`
--

LOCK TABLES `daily_usage` WRITE;
/*!40000 ALTER TABLE `daily_usage` DISABLE KEYS */;
INSERT INTO `daily_usage` VALUES (1,2,'download','2025-11-03',13,'2025-11-03 01:38:58','2025-11-03 05:45:37'),(2,2,'dump','2025-11-03',20,'2025-11-03 01:39:29','2025-11-03 05:46:02'),(34,2,'download','2025-11-04',5,'2025-11-03 17:34:34','2025-11-03 20:06:16'),(38,2,'dump','2025-11-04',17,'2025-11-03 20:05:59','2025-11-04 00:09:35'),(48,3,'dump','2025-11-04',1,'2025-11-03 23:04:44','2025-11-03 23:04:44'),(57,2,'download','2025-11-05',1,'2025-11-04 16:14:39','2025-11-04 16:14:39'),(58,2,'download','2025-11-06',11,'2025-11-06 09:03:15','2025-11-06 09:19:22'),(63,2,'dump','2025-11-06',1,'2025-11-06 09:07:47','2025-11-06 09:07:47'),(70,2,'download','2025-11-07',10,'2025-11-07 01:05:35','2025-11-07 11:41:26'),(75,3,'download','2025-11-07',6,'2025-11-07 02:18:01','2025-11-07 02:18:18'),(81,4,'download','2025-11-07',3,'2025-11-07 02:28:00','2025-11-07 02:28:07'),(86,2,'dump','2025-11-07',1,'2025-11-07 10:38:22','2025-11-07 10:38:22'),(90,2,'download','2025-11-08',6,'2025-11-07 22:10:41','2025-11-08 02:10:28'),(96,2,'download','2025-11-09',2,'2025-11-08 23:24:57','2025-11-08 23:27:40'),(98,6,'dump','2025-11-11',1,'2025-11-11 14:49:53','2025-11-11 14:49:53'),(99,2,'download','2025-11-12',1,'2025-11-12 08:16:40','2025-11-12 08:16:40'),(100,2,'dump','2025-11-13',2,'2025-11-12 17:09:24','2025-11-12 18:45:01'),(102,2,'download','2025-11-14',3,'2025-11-14 01:53:33','2025-11-14 15:16:20'),(105,2,'download','2025-12-03',1,'2025-12-02 18:37:13','2025-12-02 18:37:13'),(106,10,'download','2025-12-17',1,'2025-12-16 20:52:46','2025-12-16 20:52:46'),(107,12,'download','2025-12-18',2,'2025-12-18 02:53:36','2025-12-18 02:55:04'),(109,13,'dump','2025-12-21',1,'2025-12-20 18:02:39','2025-12-20 18:02:39'),(110,13,'download','2025-12-21',1,'2025-12-20 18:20:11','2025-12-20 18:20:11'),(111,14,'dump','2025-12-25',1,'2025-12-24 22:14:10','2025-12-24 22:14:10'),(112,14,'download','2025-12-25',1,'2025-12-24 22:20:20','2025-12-24 22:20:20'),(113,13,'download','2025-12-31',1,'2025-12-31 05:55:17','2025-12-31 05:55:17'),(114,15,'dump','2026-01-13',2,'2026-01-13 08:33:37','2026-01-13 08:34:17'),(115,15,'download','2026-01-13',2,'2026-01-13 08:33:58','2026-01-13 08:53:34'),(118,2,'dump','2026-01-28',2,'2026-01-27 16:10:35','2026-01-27 16:11:02'),(120,16,'download','2026-02-09',2,'2026-02-09 06:03:38','2026-02-09 06:04:21'),(122,2,'download','2026-02-09',1,'2026-02-09 06:05:17','2026-02-09 06:05:17'),(123,17,'dump','2026-02-26',2,'2026-02-26 09:45:12','2026-02-26 09:45:13'),(125,18,'download','2026-04-18',4,'2026-04-18 08:15:00','2026-04-18 08:28:41'),(127,18,'dump','2026-04-18',1,'2026-04-18 08:17:38','2026-04-18 08:17:38'),(130,19,'download','2026-04-24',2,'2026-04-24 02:35:59','2026-04-24 02:36:30'),(132,20,'download','2026-04-26',3,'2026-04-26 06:43:46','2026-04-26 06:45:06'),(135,21,'download','2026-04-28',3,'2026-04-28 05:49:50','2026-04-28 05:53:53'),(138,22,'download','2026-04-28',3,'2026-04-28 14:35:46','2026-04-28 14:36:40'),(141,24,'download','2026-04-29',3,'2026-04-29 15:42:38','2026-04-29 15:44:28'),(144,24,'dump','2026-04-29',1,'2026-04-29 15:57:36','2026-04-29 15:57:36'),(145,24,'dump','2026-04-30',1,'2026-04-29 16:00:12','2026-04-29 16:00:12'),(146,24,'download','2026-04-30',1,'2026-04-29 16:00:49','2026-04-29 16:00:49'),(147,26,'download','2026-05-03',5,'2026-05-03 10:51:48','2026-05-03 10:55:45'),(152,27,'download','2026-05-04',3,'2026-05-04 02:02:21','2026-05-04 02:04:25'),(155,29,'download','2026-05-08',1,'2026-05-08 06:48:56','2026-05-08 06:48:56'),(156,31,'download','2026-05-08',3,'2026-05-08 12:36:15','2026-05-08 12:38:38'),(159,31,'dump','2026-05-08',3,'2026-05-08 12:39:02','2026-05-08 12:44:43'),(162,32,'download','2026-05-10',2,'2026-05-09 16:11:41','2026-05-09 16:13:52'),(164,32,'dump','2026-05-10',1,'2026-05-09 16:15:37','2026-05-09 16:15:37'),(165,33,'download','2026-05-11',1,'2026-05-11 05:29:42','2026-05-11 05:29:42'),(166,34,'dump','2026-05-13',2,'2026-05-12 18:59:25','2026-05-12 18:59:52'),(168,35,'download','2026-05-18',5,'2026-05-18 03:40:26','2026-05-18 04:19:02'),(170,35,'dump','2026-05-18',4,'2026-05-18 03:42:19','2026-05-18 03:45:32'),(177,36,'dump','2026-05-18',2,'2026-05-18 07:35:13','2026-05-18 07:37:10'),(179,36,'download','2026-05-18',1,'2026-05-18 07:37:57','2026-05-18 07:37:57'),(180,35,'download','2026-05-19',3,'2026-05-19 03:36:50','2026-05-19 03:37:59'),(183,39,'download','2026-05-24',6,'2026-05-24 13:06:21','2026-05-24 13:11:45'),(189,40,'download','2026-05-25',3,'2026-05-24 17:45:42','2026-05-24 17:47:16'),(192,40,'dump','2026-05-25',1,'2026-05-24 17:49:04','2026-05-24 17:49:04'),(193,41,'download','2026-05-25',3,'2026-05-24 20:53:58','2026-05-24 20:58:39'),(195,41,'dump','2026-05-25',1,'2026-05-24 20:56:11','2026-05-24 20:56:11'),(197,39,'download','2026-05-25',3,'2026-05-25 05:16:38','2026-05-25 06:50:17'),(200,42,'dump','2026-05-25',3,'2026-05-25 08:29:14','2026-05-25 12:16:03'),(203,42,'download','2026-05-25',4,'2026-05-25 13:16:01','2026-05-25 13:18:24'),(207,43,'download','2026-05-26',6,'2026-05-26 04:54:15','2026-05-26 04:57:11'),(213,2,'download','2026-06-13',14,'2026-06-13 06:34:38','2026-06-13 07:48:00');
/*!40000 ALTER TABLE `daily_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单号',
  `user_id` int NOT NULL COMMENT '用户ID',
  `product_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '产品类型：coin_package, vip_package',
  `product_id` int NOT NULL COMMENT '产品ID',
  `amount` decimal(10,2) NOT NULL COMMENT '订单金额',
  `final_price_source` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trade_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '支付平台交易号',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `cert_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '证书ID',
  `udid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payment_method_id` int DEFAULT NULL COMMENT '支付方式ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'COIN1762132965357DNLSQSIN3',2,'coin_package',13,10.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2025-11-03 01:22:45','2025-11-03 01:22:45'),(2,'COIN1762133144667JP4SC3MS0',2,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2025-11-03 01:25:44','2025-11-03 01:25:44'),(3,'COIN1762567912176K4OJZHOMZ',2,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2025-11-08 02:11:52','2025-11-08 02:11:52'),(4,'COIN1763084731120TVVUAXJTD',2,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2025-11-14 01:45:31','2025-11-14 01:45:31'),(5,'COIN1764400370202NTO61MAM4',9,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2025-11-29 07:12:50','2025-11-29 07:12:50'),(6,'COIN17765001658191B54X3OC6',18,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2026-04-18 08:16:05','2026-04-18 08:16:05'),(7,'COIN1779077273618EDHGCBAHQ',35,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2026-05-18 04:07:53','2026-05-18 04:07:53'),(8,'COIN1779077279205HSU07DN9D',35,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2026-05-18 04:07:59','2026-05-18 04:07:59'),(9,'COIN1779077281933AQSQ5Y94V',35,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2026-05-18 04:08:01','2026-05-18 04:08:01'),(10,'COIN1779161856687EMIQ600ID',35,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2026-05-19 03:37:36','2026-05-19 03:37:36'),(11,'COIN1781332623066I8PQZD5WE',2,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2026-06-13 06:37:03','2026-06-13 06:37:03'),(12,'COIN1781332869113PUDBALM4Y',2,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2026-06-13 06:41:09','2026-06-13 06:41:09'),(13,'COIN1781334532896OOMCE7NO0',2,'coin_package',6,1.00,NULL,NULL,'pending',NULL,NULL,NULL,1,'2026-06-13 07:08:52','2026-06-13 07:08:52');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_configs`
--

DROP TABLE IF EXISTS `payment_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_method_id` int NOT NULL COMMENT '支付方式ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置键名',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '配置值',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payment_method_key` (`payment_method_id`,`config_key`),
  KEY `idx_payment_method_id` (`payment_method_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_configs`
--

LOCK TABLES `payment_configs` WRITE;
/*!40000 ALTER TABLE `payment_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付方式名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '支付方式代码：alipay, wechat等',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '支付方式描述',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付类型：alipay, wechat, bank等',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图标URL',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：0禁用，1启用',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `config` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '配置信息，JSON格式',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付方式表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'支付宝','alipay','安全快捷的在线支付','alipay',NULL,1,0,NULL,'2025-11-03 01:19:25','2025-11-03 01:19:25');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_config`
--

DROP TABLE IF EXISTS `site_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_config`
--

LOCK TABLES `site_config` WRITE;
/*!40000 ALTER TABLE `site_config` DISABLE KEYS */;
INSERT INTO `site_config` VALUES (1,'main_site_token','23441232413412343241','主站API Token，用于与主站对接','2025-11-03 00:32:08','2026-06-13 07:34:45');
/*!40000 ALTER TABLE `site_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置键名',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '配置值',
  `config_group` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general' COMMENT '配置分组',
  `config_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '配置描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` VALUES (1,'coin_download_cost','0.01','coin','普通用户下载消耗金币数','2025-11-03 07:56:20','2025-11-03 07:56:20'),(2,'coin_dump_cost','0.01','coin','普通用户砸壳消耗金币数','2025-11-03 07:56:20','2025-11-03 07:56:20'),(3,'free_download_daily','3','limit','普通用户每天免费下载次数','2025-11-03 07:56:20','2025-11-03 07:56:20'),(4,'free_dump_daily','3','limit','普通用户每天免费砸壳次数','2025-11-03 07:56:20','2026-06-13 15:33:44'),(5,'vip_download_free','1','vip','会员下载是否免费（1=是，0=否）','2025-11-03 07:56:20','2025-11-03 07:56:20'),(6,'vip_dump_free','1','vip','会员砸壳是否免费（1=是，0=否）','2025-11-03 07:56:20','2025-11-03 07:56:20'),(7,'vip_free_download_daily','20','vip','会员每天免费下载次数','2025-11-03 07:56:20','2025-11-03 07:56:20'),(8,'vip_free_dump_daily','20','vip','会员每天免费砸壳次数','2025-11-03 07:56:20','2025-11-03 07:56:20'),(9,'default_user_coins','0','coin','新用户注册默认金币','2025-11-03 07:56:20','2026-06-13 15:33:44'),(20,'seo.site_title','分站演示','seo','SEO设置: site_title','2025-11-04 12:24:23','2026-06-13 15:46:50'),(21,'seo.site_subtitle','分站演示','seo','SEO设置: site_subtitle','2025-11-04 12:24:23','2026-06-13 15:46:50'),(22,'seo.site_description','分站演示','seo','SEO设置: site_description','2025-11-04 12:24:23','2026-06-13 15:46:50'),(23,'seo.site_keywords','分站演示','seo','SEO设置: site_keywords','2025-11-04 12:24:23','2026-06-13 15:46:50'),(24,'site_free_mode','0','limit',NULL,'2025-11-06 17:19:14','2025-11-07 10:15:00'),(25,'site.logo_url','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAADICAMAAAApx+PaAAADAFBMVEVHcEz2y9X+veP+0ub/0bH/2b3/xZ/+tYL5sYP8uIn8xJ/90bn+xdv/yfL/x/b/vfL/xPT/yPj/z/b/0/j/2Pj/1ff/0vj+7/7+4///2P//xv7/tP//uf/9ofL/nPP/mvX/off/pfb/uPf/tPH/qu/+nun+lub+j+X+guT+qPP+rvH+pe/8lOX/m+/+i57/oKb/vebksL7+5NP617j31rf/4fbbztLx7Kru8M/t+NX5/9n9/9/0/8/v/8Do+L6GqvNrVWYUA2gyVYVMcrEqPGYrKTimdY6AWIfa8Lvd67fc8b3K5aLY767W77PP7qnZ8Lff9MPq99Xx+eD2++ry+eLh87/k9cPa8LnZ8LfQ667D5ZrE5Zqz1Ieg0GCdx2qbyl6LtlSr4GZmhj1+XFCTk1Kec3/cltY9OiZDTU5deThQbDBNZS9GWig0Qh9CVSgeKREfKxIYHRgPEg4VGCAhLRsmNBodJxBfeztdeTdhfjt5nUiezGKr1Hm11Im41JCpu46LqmWMtVqLtVd7oEmWvmeBqVGfx2yo0HfH3Za53YvA4pG33Imz14eu0YWrzoOoyoGjxX+ev32buXqQrncpMSEuNSNGRDpdXU7cgMWxhKWUfYF8hl1yfVJsc05la0tidUFIHuuXmtG1sfCNfuReOPxrUf5pTPtuZPRjdftghvtcmfhbqPt0teCQw7uazqGv1XWcv2fU9pS783HD/Haz6Wyt4GWp2maj1GKez1+byV2XxVuTwFmQvFaOuVaLtVWIsVOFrVCBqU5+pEx6n0p3nEh1l0hxk0RtjkFqikBnhj5kgjxhfztffDlceDdYczVUbjNQaTFOZi5LYS5HXSpGWC1AVCc8TSU1RSAxPh4rORooNRYlMhYjLhchKhccJRYbJgwZIg0WHA0NFgwWFhUBAAIPDB0MDQsaFjomHFpAL5YzJnlKNq5TPcRcRNhjSetlSfJlTfJnTe1mSvKEpejAtLSkn+b/y/b+yvT8uPH8qOz9su7+rPD/tvH+tfP7q+zcxLhLdlREAAABAHRSTlMAIjVceYiHgZRZmavMt9jMzMzLzM3ZovXr6+vq7Z3ZzMvMzMvMzMzMzNtYa9ixy87p1MO/z9zfycqx/+rq6+jf/P7/////bXdmQVTcutnMzMzLzM3aodmOeIF4genscd7R0drcpcSY6BTllK/TtUN1xtroo1WLJCB0xci/XMLX4uexh29SPSOXLqj///////////7//////9ro9/7///////3/9P///////////////v///////////////////////////////////////////v///////////////////////////////////v///9+eWDF7qL54kY+AgHeq2UYVjhjOXAAAPolJREFUeNrs3Qe03HWd///n6/P9zsxt6QmCYCiiNOn7c3dFXASEBMS26yqgiAUMKKALAkIUgQAJiytYcS2sXVf/uoqQgGCvu0ov0ntLv7ltyvf7ef2XaXfIvSmwJyDH+zgnc3Jy5p5D5sn7PZ/vzNwbJkyYMGHChAkTJkyYMGHChAkTJkyYMGHChAkTJkyYMGHChAkTJkyYMGHChAkTJkyYMGHChAkTJjyVQtDEo/DXxLvsuvXs2VvvGiceimeNeI5VXiIA7Acnxv1ZkvIc+xtRJ3abqPEsCTy3NCAa1F+byPHXMen5LmXAANprIsfzOvq8yZQBuuBC1icHQA4BDTA+5ZCYp8GBOHFCePYOcqfltTSXTjKE4WphSu0SO8lcvZRxZbvWcuwQDLqHccTdK0WojjwS2UjdERn+YY8LJ/pu+ujz+jRyXI9oCkNZd8EAKPtUwRcxhl8C5FYw3OWUsbwrVYAivpWNEnsMR4V7+fInpIv4i9Leg50ufB6v9xPz7KThvCRwMEBMi6mBkNZIPyDi2Aa+46UCBQNkjMON5lQp7rJx1buBo84CwinYH+cvT2meA1aeEMGfft6e3k/90AePOfaUWJqUGKs8NEJEXakBjazOsMx73/v+D37oVDrlEGOQAUgYR42WqsRGkIAQHAKgk0/mL5ATI7CDgp6vB7kTC+9VkmREMgTKoitdWS0pEIMqIzGbgpOhqgonqTLUeyFtwmBYd/S/YdROt7FhXQZ9LCZgEOYvUDAoyhByeF5O+qknn/SuNdXh/hiNFCOEaJFVykbRBAzYSgXxmHee3J527/AS2l4qxnK5CrZjjF4jNkI0vP2IxLYs++RT+csjBAoQwM/H6PM+dOxxVHOXh8uJXS0L8mKaFmOSJCGCuoulbiB29/VgKBZPyE6hwXfSdtcdYixXDGDb8T42QhD4/O+EJDgUbXsNf4GC1Hpe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','site','site设置: logo_url','2026-06-13 15:47:10','2026-06-13 15:47:47'),(26,'site.site_name','','site','site设置: site_name','2026-06-13 15:47:10','2026-06-13 15:47:47');
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_tasks`
--

DROP TABLE IF EXISTS `user_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '分站用户ID',
  `main_task_id` int NOT NULL COMMENT '主站任务ID',
  `bundle_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '应用Bundle ID',
  `app_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '应用名称',
  `version` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'App Store发行号',
  `real_version` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '真实版本号',
  `country` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cn' COMMENT '国家/地区',
  `icon_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '应用图标URL',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'queued' COMMENT '任务状态：queued, running, done, error',
  `progress` int DEFAULT '0' COMMENT '进度（0-100）',
  `error` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '错误信息',
  `download_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '下载链接',
  `alist_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Alist链接',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_main_task_id` (`main_task_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户任务表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tasks`
--

LOCK TABLES `user_tasks` WRITE;
/*!40000 ALTER TABLE `user_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invite_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inviter_id` int DEFAULT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `device_udid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：0禁用，1启用',
  `is_admin` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否管理员',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注信息',
  `last_login` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registration_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '注册IP地址',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `balance` decimal(10,2) DEFAULT '0.00' COMMENT '金币余额',
  `agent_level` int NOT NULL DEFAULT '0' COMMENT '代理级别',
  `agent_discount` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '代理折扣百分比',
  `is_agent` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为代理: 0=否, 1=是',
  `is_vip` tinyint(1) DEFAULT '0' COMMENT '是否为VIP用户',
  `vip_level` int DEFAULT '0' COMMENT '会员等级',
  `vip_expires_at` datetime DEFAULT NULL COMMENT 'VIP过期时间',
  `auto_login` tinyint(1) NOT NULL DEFAULT '0' COMMENT '自动登录：1启用，0禁用',
  `email_notifications` tinyint(1) NOT NULL DEFAULT '1' COMMENT '邮箱通知：1启用，0禁用',
  `push_notifications` tinyint(1) NOT NULL DEFAULT '1' COMMENT '推送通知：1启用，0禁用',
  `theme` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'light' COMMENT '主题：light,dark,auto',
  `language` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'zh-CN' COMMENT '语言设置',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_is_admin` (`is_admin`),
  KEY `idx_is_vip` (`is_vip`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,NULL,NULL,'admin','$2b$10$DZCP/cPcFp2XhNKQlQJVGeFPZxb9kmTUvMf3ui1nqbW8c6ZAFnKPe',NULL,'admin@example.com',NULL,1,1,NULL,'2026-06-13 15:48:07','2025-11-02 23:58:53','127.0.0.1','2026-06-13 07:48:07',997.75,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(3,NULL,NULL,'112233','$2b$10$HtehBW7o76uMegyxvqMP2.y7CLurhNH1FCjUg1TCebjkEBzlUfvHi',NULL,'112233',NULL,1,0,NULL,'2025-11-07 10:17:58','2025-11-03 23:04:23','127.0.0.1','2025-11-07 02:18:18',9.97,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(4,NULL,NULL,'11223344','$2b$10$RCroWSRJGoKqeq.KTUF9y.K3o/l1wW2ayc2lXodb.eZwEirtxb4Aa',NULL,'11223344@qq.com',NULL,1,0,NULL,'2025-11-07 10:27:57','2025-11-07 02:27:54','127.0.0.1','2025-11-07 02:27:57',0.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(5,NULL,NULL,'yaohuai','$2b$10$MH7n8Y.NJvC9D9ZCHw0TCOWzT2Xsy6vQoyQhANV5c4G3d6upLI20O',NULL,'1507341@qq.com',NULL,1,0,NULL,'2025-11-11 21:23:34','2025-11-11 13:23:21','127.0.0.1','2025-11-11 13:23:34',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(6,NULL,NULL,'531829935','$2b$10$loGgsDCQIHC7C16pb7gfw.V0PZNY16t5PzH96.3Ue8JfnzkBwPY2O',NULL,'531829935@qq.com',NULL,1,0,NULL,'2025-11-11 22:48:43','2025-11-11 14:48:13','127.0.0.1','2025-11-11 14:49:53',9.99,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(7,NULL,NULL,'ffang','$2b$10$fbfQGShCmeCWL7NHEVHevO/NXrlE2lTZSQ/fe/wIIaXKb6PXeE7Zq',NULL,NULL,NULL,1,0,NULL,'2025-11-14 09:48:59','2025-11-14 01:48:53','127.0.0.1','2025-11-14 01:48:59',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(8,NULL,NULL,'184244746','$2b$10$JOiFjbNi.6hMHRWAau5VbuLkSUKsQ30So87KYp5WackWorXN8ze0e',NULL,'184244746@qq.com',NULL,1,0,NULL,'2025-11-26 17:01:03','2025-11-26 09:00:49','127.0.0.1','2025-11-26 09:01:03',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(9,NULL,NULL,'635231','$2b$10$Y.Mg59Bd2uADv.LwJFzEze/X6nP.Dj/n16jAPUUrOgnj7zhGLwOgu',NULL,NULL,NULL,1,0,NULL,'2025-11-29 15:11:21','2025-11-29 07:11:13','127.0.0.1','2025-11-29 07:11:21',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(10,NULL,NULL,'xq1026','$2b$10$dSm7l5ydzZIQVkbBfCByxeGXFcEEtUFOcO78QysxYmePmpcuCNmaC',NULL,NULL,NULL,1,0,NULL,'2025-12-17 04:52:02','2025-12-16 20:51:49','127.0.0.1','2025-12-16 20:52:02',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(11,NULL,NULL,'Lafu','$2b$10$vpcZe7PbaknTSnV9LX4JnOA8GHP6TJesF7Ki0kJGWC5IHC9mYEg8e',NULL,'3988439559@qq.com',NULL,1,0,NULL,'2025-12-17 22:19:07','2025-12-17 14:18:25','127.0.0.1','2025-12-17 14:19:07',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(12,NULL,NULL,'13380459048','$2b$10$0b3kNub7GZidWNmoK2MWL.CdIiw6dsaZ.FsnYW66.F8KrR/W8a482',NULL,'2763232009@qq.com',NULL,1,0,NULL,'2025-12-18 10:51:45','2025-12-18 02:51:25','127.0.0.1','2025-12-18 02:51:45',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(13,NULL,NULL,'zenyang','$2b$10$t3c2hb0IO73t3bg3rMjR9O1XGPHAzyyrku6g0terWES1y6iivTD3W',NULL,'532149572@qq.com',NULL,1,0,NULL,'2026-01-06 20:11:35','2025-12-19 22:09:28','127.0.0.1','2026-01-06 12:11:35',9.99,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(14,NULL,NULL,'chen363700','$2b$10$wj2bwKDH5i62K6gjEPqmWuKdOKrhiTIVecU/QItUKNAnuh/ZeiRnK',NULL,NULL,NULL,1,0,NULL,'2025-12-25 06:13:39','2025-12-24 22:13:31','127.0.0.1','2025-12-24 22:14:10',9.99,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(15,NULL,NULL,'1030377263','$2b$10$Lc6pVwKmsNPbG.2ZNX8eyepMpR3/.JEnL/SfCF07dDOEytmkpvgx2',NULL,NULL,NULL,1,0,NULL,'2026-01-13 16:50:38','2026-01-13 08:32:49','127.0.0.1','2026-01-13 08:50:38',9.98,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(16,NULL,NULL,'2544745208','$2b$10$7xRP979o6h5MYTrQK0tRxO14LWufX.wt36c9Lf/f3a.2VKlH2lm4m',NULL,NULL,NULL,1,0,NULL,'2026-02-09 14:03:46','2026-02-09 06:03:11','127.0.0.1','2026-02-09 06:03:46',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(17,NULL,NULL,'yejinxuan','$2b$10$WiXiHiYSFm1WmqAQlme5Ge/.9voscBsXQIeK6.WtHcIqOvnyWZACe',NULL,NULL,NULL,1,0,NULL,'2026-02-26 17:44:37','2026-02-26 09:44:12','127.0.0.1','2026-02-26 09:45:13',9.98,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(18,NULL,NULL,'zjschyl','$2b$10$6hPcN6APGjEuGf/Vo.eABuh6eTdMx6pL/driCRa6UwImkEulZkB7a',NULL,NULL,NULL,1,0,NULL,'2026-04-18 16:28:44','2026-04-18 08:14:29','127.0.0.1','2026-04-18 08:28:44',9.98,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(19,NULL,NULL,'一小坑hhh','$2b$10$IsNN/clRiRVVMGm67cRIKupep2iXJPfF.C0P7QjSiZra.VJzVh9FS',NULL,NULL,NULL,1,0,NULL,'2026-04-24 10:36:34','2026-04-24 02:35:23','127.0.0.1','2026-04-24 02:36:34',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(20,NULL,NULL,'heidongke','$2b$10$G43TNbQ5gZLXJD9cdATGmemxJyHnWtNBbXiyHf1BDYfSxRriS78ZK',NULL,NULL,NULL,1,0,NULL,'2026-04-26 14:44:47','2026-04-26 06:43:17','127.0.0.1','2026-04-26 06:44:47',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(21,NULL,NULL,'xiaohevs','$2b$10$lNRaWDNWEaq/WImukXnUbeoT21RdnKZ7bERVTAdYQGzgx15v3ybfa',NULL,NULL,NULL,1,0,NULL,'2026-04-28 13:50:59','2026-04-28 05:48:04','127.0.0.1','2026-04-28 05:50:59',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(22,NULL,NULL,'u033033','$2b$10$zALHpp7nw8U6etu.9j6bg.u1.IVUbiOVn6aeZol3d8MHypS4hH90u',NULL,NULL,NULL,1,0,NULL,'2026-04-28 22:36:43','2026-04-28 14:35:20','127.0.0.1','2026-04-28 14:36:43',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(23,NULL,NULL,'5555555','$2b$10$sGBtd/jg0mH8cmnkNBJso.bzko6.42G1kkBL1BJenKhwcI0GcIyiK',NULL,'992542586@qq.com',NULL,1,0,NULL,NULL,'2026-04-29 15:38:04','127.0.0.1','2026-04-29 15:38:04',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(24,NULL,NULL,'666666','$2b$10$9t/3EdKMyoUyZ1YC7Gv0WOpWrsGYf7SzhYf.cOu7XV5GlmdvCRpDq',NULL,'992542586@qq.com1',NULL,1,0,NULL,'2026-04-30 00:00:19','2026-04-29 15:40:12','127.0.0.1','2026-04-29 16:00:19',9.98,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(25,NULL,NULL,'gao204','$2b$10$JDzIU.Nju68eE/fJcCZzsubv2fQEVQe6uYUOJL3VQUj87q4cydsOe',NULL,'gao204@126.com',NULL,1,0,NULL,NULL,'2026-05-03 04:01:29','127.0.0.1','2026-05-03 04:01:29',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(26,NULL,NULL,'2876772130','$2b$10$m9DpDSmk3OF.oPI5so7daO7Op/R0zMDhTnFMNSCHMT7IUFpysa0wu',NULL,NULL,NULL,1,0,NULL,'2026-05-03 18:55:09','2026-05-03 10:51:18','127.0.0.1','2026-05-03 10:55:45',9.98,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(27,NULL,NULL,'qwer123456','$2b$10$VQtmtXuF43fCoFEkcKYIxu8TSHHF57OjoGmDADzBtm50.T6cUovq.',NULL,NULL,NULL,1,0,NULL,'2026-05-04 10:04:45','2026-05-04 02:01:45','127.0.0.1','2026-05-04 02:04:45',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(28,NULL,NULL,'tivon.lee','$2b$10$tpsjVLzq6t0FoPFZsUQa3OSlZ2Rtpj/lLSUQwXHK2l4.hrgIl3A3m',NULL,'iamleetvin@gmail.com',NULL,1,0,NULL,NULL,'2026-05-04 06:29:16','127.0.0.1','2026-05-04 06:29:16',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(29,NULL,NULL,'1728904006','$2b$10$h0Vea4yFzAYLACWr.z4cseqrzMpMNsBO96cLXk1h7UPfDNUw6tdaC',NULL,'1728904006@qq.com',NULL,1,0,NULL,'2026-05-08 14:48:45','2026-05-08 06:48:33','127.0.0.1','2026-05-08 06:48:45',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(30,NULL,NULL,'caojian','$2b$10$DKNnK7lXxyHqLJaBSdot..JZugqxyY70ricGQqmnTmjUULIr8OSKm',NULL,NULL,NULL,1,0,NULL,'2026-05-08 15:19:28','2026-05-08 07:19:23','127.0.0.1','2026-05-08 07:19:28',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(31,NULL,NULL,'qq244529657','$2b$10$XuGh.W51RrKcq8C7F3FjSuXLF6SRCJ5CZNSf2OQYsQBCdwg1k1R8S',NULL,'244529657@qq.com',NULL,1,0,NULL,'2026-05-08 20:44:13','2026-05-08 12:35:22','127.0.0.1','2026-05-08 12:44:43',9.97,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(32,NULL,NULL,'27748162','$2b$10$n1ZB6zn6zwOZboFLNiOZk.DdK94C8i6lSpxnV0C9kYBQLLNSBWQfm',NULL,'27748162@qq.com',NULL,1,0,NULL,'2026-05-10 00:14:12','2026-05-09 16:09:26','127.0.0.1','2026-05-09 16:15:37',9.99,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(33,NULL,NULL,'13072823332','$2b$10$rOuWWV6fN/pwFYjNylvgxuQ9EhOVjkw4Evxk4LTA.ae4euqQl1Vce',NULL,NULL,NULL,1,0,NULL,'2026-05-11 13:29:53','2026-05-11 05:28:53','127.0.0.1','2026-05-11 05:29:53',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(34,NULL,NULL,'wer','$2b$10$Cvy.DQ5fbyeFsZ2CbHzLfOwE3UbBiZr5SeFzPh2SwwjoT71koX2Re',NULL,NULL,NULL,1,0,NULL,'2026-05-13 03:00:08','2026-05-12 18:58:30','127.0.0.1','2026-05-12 19:00:08',9.98,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(35,NULL,NULL,'bai123321','$2b$10$.RkRBF.PyHl.LJrA1/pBI.jt94iIe/kRwlkCvijBctvJWD.n4OHWS',NULL,NULL,NULL,1,0,NULL,'2026-05-19 11:37:16','2026-05-18 03:39:30','127.0.0.1','2026-05-19 03:37:16',9.94,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(36,NULL,NULL,'77302885','$2b$10$VTApqwgF6gyLqkL1pt2eXegem7SzNcyT3exX0OsuGoVE4bzy5Voj2',NULL,'77302885@qq.com',NULL,1,0,NULL,'2026-05-18 15:37:19','2026-05-18 07:33:22','127.0.0.1','2026-05-18 07:37:19',9.98,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(37,NULL,NULL,'yukiki03','$2b$10$hRJMkdEHaC.TpafL7jPorOcNA9sbrg3tCklWsyIp2QdJryY8ITam.',NULL,NULL,NULL,1,0,NULL,'2026-05-18 23:39:38','2026-05-18 15:39:30','127.0.0.1','2026-05-18 15:39:38',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(38,NULL,NULL,'17729768886','$2b$10$k02x0QdBIEqlVkkvSM1vfuk24tRiVmt21pBNEHP/Jksr97alZRb5m',NULL,NULL,NULL,1,0,NULL,NULL,'2026-05-23 10:22:11','127.0.0.1','2026-05-23 10:22:11',10.00,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(39,NULL,NULL,'eaglesty','$2b$10$HzHc6m9U9z50mQ6wrc20Pu./FAlf5hXe7zRraqRp8J.ES.K/qE6GC',NULL,NULL,NULL,1,0,NULL,'2026-05-25 14:49:49','2026-05-23 16:19:42','127.0.0.1','2026-05-25 06:49:49',9.97,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(40,NULL,NULL,'2542437440','$2b$10$ln3MgXu6uMG8vSBUIq/Id.DYLK0lb64Nw31EnTPYVjbD/U1kTLFDO',NULL,'2542437440@qq.com',NULL,1,0,NULL,'2026-05-25 01:47:34','2026-05-24 17:44:02','127.0.0.1','2026-05-24 17:49:04',9.99,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(41,NULL,NULL,'在线脱壳1235','$2b$10$ZrXKR8ici8k.2FgQAl7OY.sEMIFrhfsXtgrRsYqVpiSaxwjnKAmJy',NULL,NULL,NULL,1,0,NULL,'2026-05-25 04:59:08','2026-05-24 20:51:48','127.0.0.1','2026-05-24 20:59:08',9.99,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(42,NULL,NULL,'2227891243','$2b$10$6FK8h2qn1vxBv4VeXqpPNe2VvPYYMJj0oivoixGCkbISpl1v16V7u',NULL,'2227891243@qq.com',NULL,1,0,NULL,'2026-05-25 21:17:39','2026-05-25 08:27:04','127.0.0.1','2026-05-25 13:18:24',9.96,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN'),(43,NULL,NULL,'ipa123','$2b$10$wd.zFwPQSy2./uDbma078.oNkAOIcvP69WNs03SSFQx.TAPTN/Gc2',NULL,NULL,NULL,1,0,NULL,'2026-05-26 12:56:36','2026-05-26 04:51:47','127.0.0.1','2026-05-26 04:57:11',9.97,0,0.00,0,0,0,NULL,0,1,1,'light','zh-CN');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vip_orders`
--

DROP TABLE IF EXISTS `vip_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vip_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `package_id` int NOT NULL COMMENT '套餐ID',
  `order_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单号',
  `package_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '套餐名称',
  `amount` decimal(10,2) NOT NULL COMMENT '支付金额',
  `duration` int DEFAULT NULL COMMENT '有效期天数',
  `pay_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付方式：coin(金币), alipay(支付宝), wechat(微信)',
  `payment_method_id` int DEFAULT NULL COMMENT '支付方式ID',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT '订单状态：pending(待支付), paid(已支付), expired(已过期), cancelled(已取消)',
  `paid_at` timestamp NULL DEFAULT NULL COMMENT '支付时间',
  `expire_time` datetime DEFAULT NULL COMMENT '会员到期时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员订单记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vip_orders`
--

LOCK TABLES `vip_orders` WRITE;
/*!40000 ALTER TABLE `vip_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `vip_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vip_packages`
--

DROP TABLE IF EXISTS `vip_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vip_packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '套餐名称',
  `vip_level` int DEFAULT '0' COMMENT '会员等级',
  `price` decimal(10,2) NOT NULL COMMENT '价格（人民币）',
  `duration` int NOT NULL COMMENT '有效期天数',
  `coin_price` decimal(10,2) DEFAULT NULL COMMENT '金币价格',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '套餐描述',
  `features` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '特权功能，JSON格式',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `is_popular` tinyint(1) DEFAULT '0' COMMENT '是否热门',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='VIP套餐表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vip_packages`
--

LOCK TABLES `vip_packages` WRITE;
/*!40000 ALTER TABLE `vip_packages` DISABLE KEYS */;
INSERT INTO `vip_packages` VALUES (7,'月度会员',1,9.90,30,100.00,'享受1个月会员特权，免费下载砸壳',NULL,1,0,1,1,'2025-11-03 00:16:13','2025-11-03 00:16:13'),(8,'季度会员',2,24.90,90,250.00,'享受3个月会员特权，更优惠',NULL,2,0,1,1,'2025-11-03 00:16:13','2025-11-03 00:16:13'),(9,'年度会员',3,88.00,365,900.00,'享受12个月会员特权，最超值',NULL,3,0,1,1,'2025-11-03 00:16:13','2025-11-03 00:16:13');
/*!40000 ALTER TABLE `vip_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'dumptest'
--

--
-- Dumping routines for database 'dumptest'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-13 16:09:20
