DROP DATABASE IF EXISTS `marketplace`;
CREATE DATABASE `marketplace`;

USE `marketplace`;

-- 회원 테이블
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
    `member_id`     BIGINT          NOT NULL AUTO_INCREMENT,
    `email`         VARCHAR(100)    NOT NULL UNIQUE,
    `password`      VARCHAR(60)     NOT NULL,
    `nickname`      VARCHAR(30)     NOT NULL UNIQUE,
    `img`           VARCHAR(255)    NULL,
    `created_at`    DATETIME        NOT NULL,
    `updated_at`    DATETIME        NULL,
    PRIMARY KEY (`member_id`)
);

-- 상품 테이블
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
    `product_id`    CHAR(36)        NOT NULL,
    `member_id`     BIGINT          NOT NULL,
    `name`          VARCHAR(80)     NOT NULL,
    `price`         BIGINT          NOT NULL,
    `description`   TEXT            NOT NULL,
    `sell_status`   ENUM('DRAFT', 'ACTIVE', 'DELETED', 'SOLD') NOT NULL DEFAULT 'DRAFT',
    `job_count`     INT             NOT NULL DEFAULT 0,
    `ply_url`       VARCHAR(255)    NULL,
    `viewer_url`    VARCHAR(255)    NULL,
    `view_cnt`      BIGINT          NOT NULL DEFAULT 0,
    `like_cnt`      BIGINT          NOT NULL DEFAULT 0,
    `created_at`    DATETIME        NOT NULL,
    `updated_at`    DATETIME        NULL,
    PRIMARY KEY (`product_id`),
    FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
);

-- 상품 이미지 테이블 (15~25장)
DROP TABLE IF EXISTS `product_image`;
CREATE TABLE `product_image` (
    `image_id`      BIGINT          NOT NULL AUTO_INCREMENT,
    `product_id`    CHAR(36)        NOT NULL,
    `s3_url`        VARCHAR(255)    NOT NULL,
    `sort_order`    INT             NOT NULL,
    `created_at`    DATETIME        NOT NULL,
    PRIMARY KEY (`image_id`),
    FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE
);

-- AI 결함 설명 테이블
DROP TABLE IF EXISTS `fault_description`;
CREATE TABLE `fault_description` (
    `product_id`    CHAR(36)        NOT NULL,
    `markdown`      TEXT            NULL,
    `status`        ENUM('QUEUED', 'RUNNING', 'DONE', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `model`         VARCHAR(20)     NULL,
    `error_msg`     TEXT            NULL,
    `created_at`    DATETIME        NOT NULL,
    `updated_at`    DATETIME        NULL,
    `completed_at`  DATETIME        NULL,
    PRIMARY KEY (`product_id`),
    FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE
);

-- 3DGS 작업 테이블
DROP TABLE IF EXISTS `job_3dgs`;
CREATE TABLE `job_3dgs` (
    `product_id`        CHAR(36)        NOT NULL,
    `status`            ENUM('QUEUED', 'RUNNING', 'DONE', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `s3_input_prefix`   VARCHAR(255)    NOT NULL,
    `s3_output_prefix`  VARCHAR(255)    NULL,
    `log`               TEXT            NULL,
    `error_msg`         TEXT            NULL,
    `created_at`        DATETIME        NOT NULL,
    `updated_at`        DATETIME        NULL,
    `completed_at`      DATETIME        NULL,
    PRIMARY KEY (`product_id`),
    FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE
);

-- 좋아요 테이블
DROP TABLE IF EXISTS `like`;
CREATE TABLE `like` (
    `like_id`       BIGINT          NOT NULL AUTO_INCREMENT,
    `member_id`     BIGINT          NOT NULL,
    `product_id`    CHAR(36)        NOT NULL,
    `created_at`    DATETIME        NOT NULL,
    PRIMARY KEY (`like_id`),
    FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_like` (`member_id`, `product_id`)
);

-- 알림 테이블
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
    `notif_id`      BIGINT          NOT NULL AUTO_INCREMENT,
    `member_id`     BIGINT          NOT NULL,
    `type`          VARCHAR(30)     NOT NULL,
    `product_id`    CHAR(36)        NULL,
    `title`         TEXT            NOT NULL,
    `message`       TEXT            NOT NULL,
    `created_at`    DATETIME        NOT NULL,
    `read_at`       DATETIME        NULL,
    PRIMARY KEY (`notif_id`),
    FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE SET NULL
);

-- 채팅방 테이블
DROP TABLE IF EXISTS `chat_room`;
CREATE TABLE `chat_room` (
    `room_id`       BIGINT          NOT NULL AUTO_INCREMENT,
    `product_id`    CHAR(36)        NOT NULL,
    `seller_id`     BIGINT          NOT NULL,
    `buyer_id`      BIGINT          NOT NULL,
    `created_at`    DATETIME        NOT NULL,
    `updated_at`    DATETIME        NULL,
    PRIMARY KEY (`room_id`),
    FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE,
    FOREIGN KEY (`seller_id`) REFERENCES `member`(`member_id`) ON DELETE CASCADE,
    FOREIGN KEY (`buyer_id`) REFERENCES `member`(`member_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_chat` (`product_id`, `buyer_id`)
);

-- 채팅 메시지 테이블
DROP TABLE IF EXISTS `chat_message`;
CREATE TABLE `chat_message` (
    `msg_id`        BIGINT          NOT NULL AUTO_INCREMENT,
    `room_id`       BIGINT          NOT NULL,
    `sender_id`     BIGINT          NOT NULL,
    `content`       TEXT            NOT NULL,
    `is_read`       BOOLEAN         NOT NULL DEFAULT FALSE,
    `created_at`    DATETIME        NOT NULL,
    PRIMARY KEY (`msg_id`),
    FOREIGN KEY (`room_id`) REFERENCES `chat_room`(`room_id`) ON DELETE CASCADE,
    FOREIGN KEY (`sender_id`) REFERENCES `member`(`member_id`) ON DELETE CASCADE
);
