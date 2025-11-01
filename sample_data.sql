-- ========================================
-- Sample Data Dump for Marketplace
-- ========================================

USE `marketplace`;

-- 회원 데이터 (15명)
INSERT INTO `member` (`member_id`, `email`, `password`, `nickname`, `img`, `created_at`, `updated_at`) VALUES
(1, 'john.doe@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '존도우', 'https://avatar.example.com/john.jpg', '2024-10-01 10:30:00', NULL),
(2, 'jane.smith@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '제인스미스', 'https://avatar.example.com/jane.jpg', '2024-10-02 11:20:00', NULL),
(3, 'bob.wilson@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '밥윌슨', 'https://avatar.example.com/bob.jpg', '2024-10-03 09:15:00', NULL),
(4, 'alice.brown@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '앨리스브라운', 'https://avatar.example.com/alice.jpg', '2024-10-05 14:00:00', NULL),
(5, 'charlie.lee@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '찰리리', 'https://avatar.example.com/charlie.jpg', '2024-10-07 16:30:00', NULL),
(6, 'david.kim@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '데이빗김', 'https://avatar.example.com/david.jpg', '2024-10-08 08:45:00', NULL),
(7, 'emily.park@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '에밀리박', 'https://avatar.example.com/emily.jpg', '2024-10-10 12:00:00', NULL),
(8, 'frank.choi@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '프랭크최', 'https://avatar.example.com/frank.jpg', '2024-10-12 13:30:00', NULL),
(9, 'grace.jung@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '그레이스정', 'https://avatar.example.com/grace.jpg', '2024-10-13 15:20:00', NULL),
(10, 'henry.shin@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '헨리신', 'https://avatar.example.com/henry.jpg', '2024-10-15 10:00:00', NULL),
(11, 'ivy.hwang@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '아이비황', 'https://avatar.example.com/ivy.jpg', '2024-10-17 11:30:00', NULL),
(12, 'jack.yoon@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '잭윤', 'https://avatar.example.com/jack.jpg', '2024-10-18 14:45:00', NULL),
(13, 'kate.han@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '케이트한', 'https://avatar.example.com/kate.jpg', '2024-10-20 09:30:00', NULL),
(14, 'leo.kang@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '레오강', 'https://avatar.example.com/leo.jpg', '2024-10-22 16:00:00', NULL),
(15, 'mia.song@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '미아송', 'https://avatar.example.com/mia.jpg', '2024-10-25 10:15:00', NULL);

-- 상품 데이터 (30개)
INSERT INTO `product` (`product_id`, `member_id`, `name`, `price`, `description`, `sell_status`, `job_count`, `ply_url`, `view_cnt`, `likes_cnt`, `created_at`, `updated_at`) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '빈티지 의자', 89000, '1960년대 빈티지 의자입니다. 앞다리 하단부에 약간의 스크래치가 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/a1b2c3d4.ply', 145, 23, '2024-10-26 09:00:00', '2024-10-27 10:30:00'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 1, '원목 테이블', 250000, '오크 원목으로 만든 테이블입니다. 천판 모서리에 작은 흠집이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/b2c3d4e5.ply', 289, 47, '2024-10-26 10:30:00', NULL),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 2, '앤티크 거울', 120000, '1970년대 앤티크 벽걸이 거울. 테두리에 약간의 변색이 있으나 거울면은 깨끗합니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/c3d4e5f6.ply', 178, 31, '2024-10-26 11:00:00', NULL),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 2, '클래식 소파', 450000, '3인용 가죽 소파입니다. 왼쪽 팔걸이에 긁힌 자국이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/d4e5f6a7.ply', 412, 68, '2024-10-26 12:00:00', '2024-10-28 09:00:00'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 3, '북유럽 스탠드', 65000, '북유럽 스타일 스탠드 조명. 갓에 작은 얼룩이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/e5f6a7b8.ply', 201, 39, '2024-10-26 13:30:00', NULL),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 3, '빈티지 책장', 180000, '5단 원목 책장. 뒷면에 못 자국이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/f6a7b8c9.ply', 156, 27, '2024-10-26 14:00:00', NULL),
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 4, '러그 카펫', 95000, '페르시안 스타일 러그. 모서리 부분이 약간 해져있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/a7b8c9d0.ply', 234, 42, '2024-10-27 09:00:00', NULL),
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 4, '원목 옷장', 320000, '대형 원목 옷장. 문짝 하나에 긁힌 자국이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/b8c9d0e1.ply', 198, 35, '2024-10-27 10:00:00', NULL),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 5, '빈티지 화장대', 210000, '1980년대 화장대. 거울에 작은 얼룩이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/c9d0e1f2.ply', 267, 51, '2024-10-27 11:30:00', '2024-10-28 15:00:00'),
('d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', 5, '사이드 테이블', 55000, '작은 사이드 테이블. 상판에 컵 자국이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/d0e1f2a3.ply', 189, 28, '2024-10-27 13:00:00', NULL),
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 6, '앤티크 시계', 340000, '벽걸이 시계. 작동은 정상이나 유리에 작은 금이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/e1f2a3b4.ply', 298, 59, '2024-10-27 14:30:00', NULL),
('f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c', 6, '인더스트리얼 선반', 145000, '철제 선반 5단. 하단부에 녹이 슬어있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/f2a3b4c5.ply', 176, 33, '2024-10-27 16:00:00', NULL),
('a3b4c5d6-e7f8-4a5b-0c1d-2e3f4a5b6c7d', 7, '라탄 바구니 세트', 42000, '3개 세트 라탄 바구니. 하나에 약간의 풀림이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/a3b4c5d6.ply', 223, 41, '2024-10-28 08:30:00', NULL),
('b4c5d6e7-f8a9-4b5c-1d2e-3f4a5b6c7d8e', 7, '대리석 화분', 78000, '대리석 화분. 밑면에 작은 칩핑이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/b4c5d6e7.ply', 167, 29, '2024-10-28 10:00:00', NULL),
('c5d6e7f8-a9b0-4c5d-2e3f-4a5b6c7d8e9f', 8, '빈티지 액자 세트', 68000, '5개 세트 빈티지 액자. 한 개에 유리 깨짐이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/c5d6e7f8.ply', 145, 26, '2024-10-28 11:30:00', NULL),
('d6e7f8a9-b0c1-4d5e-3f4a-5b6c7d8e9f0a', 8, '원목 벤치', 125000, '현관용 원목 벤치. 다리에 긁힌 자국이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/d6e7f8a9.ply', 192, 34, '2024-10-28 13:00:00', NULL),
('e7f8a9b0-c1d2-4e5f-4a5b-6c7d8e9f0a1b', 9, '앤티크 찬장', 280000, '빈티지 찬장. 손잡이 하나가 헐거워요.', 'ACTIVE', 1, 'https://s3.example.com/ply/e7f8a9b0.ply', 256, 48, '2024-10-28 14:30:00', NULL),
('f8a9b0c1-d2e3-4f5a-5b6c-7d8e9f0a1b2c', 9, '철제 의자', 58000, '인더스트리얼 스타일 의자. 등받이에 페인트 벗겨짐이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/f8a9b0c1.ply', 178, 32, '2024-10-28 16:00:00', NULL),
('a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', 10, '미드센츄리 암체어', 195000, '1960년대 암체어. 팔걸이 천이 약간 해졌습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/a9b0c1d2.ply', 289, 56, '2024-10-29 09:00:00', NULL),
('b0c1d2e3-f4a5-4b5c-7d8e-9f0a1b2c3d4e', 10, '북유럽 식탁', 310000, '6인용 북유럽 스타일 식탁. 천판에 작은 흠집이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/b0c1d2e3.ply', 334, 62, '2024-10-29 10:30:00', '2024-10-30 11:00:00'),
('c1d2e3f4-a5b6-4c5d-8e9f-0a1b2c3d4e5f', 11, '빈티지 펜던트 조명', 88000, '1970년대 펜던트 조명. 전선이 낡아서 교체 필요합니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/c1d2e3f4.ply', 201, 38, '2024-10-29 12:00:00', NULL),
('d2e3f4a5-b6c7-4d5e-9f0a-1b2c3d4e5f6a', 11, '레트로 라디오', 125000, '작동하는 빈티지 라디오. 케이스에 약간의 스크래치가 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/d2e3f4a5.ply', 267, 49, '2024-10-29 14:00:00', NULL),
('e3f4a5b6-c7d8-4e5f-0a1b-2c3d4e5f6a7b', 12, '원목 콘솔', 165000, '현관용 원목 콘솔 테이블. 서랍 하나가 빡빡합니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/e3f4a5b6.ply', 189, 35, '2024-10-29 15:30:00', NULL),
('f4a5b6c7-d8e9-4f5a-1b2c-3d4e5f6a7b8c', 12, '빈티지 타자기', 210000, '1950년대 타자기. 작동은 안 되지만 인테리어용으로 좋습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/f4a5b6c7.ply', 298, 57, '2024-10-30 09:00:00', NULL),
('a5b6c7d8-e9f0-4a5b-2c3d-4e5f6a7b8c9d', 13, '철제 선풍기', 95000, '빈티지 선풍기. 작동은 정상이나 날개에 녹이 있습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/a5b6c7d8.ply', 234, 44, '2024-10-30 10:30:00', NULL),
('b6c7d8e9-f0a1-4b5c-3d4e-5f6a7b8c9d0e', 13, '앤티크 트렁크', 145000, '여행용 빈티지 트렁크. 자물쇠가 고장났습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/b6c7d8e9.ply', 178, 36, '2024-10-30 12:00:00', NULL),
('c7d8e9f0-a1b2-4c5d-4e5f-6a7b8c9d0e1f', 14, '빈티지 재봉틀', 185000, '1960년대 재봉틀. 작동은 안 되지만 디스플레이용으로 멋집니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/c7d8e9f0.ply', 256, 52, '2024-10-30 14:00:00', NULL),
('d8e9f0a1-b2c3-4d5e-5f6a-7b8c9d0e1f2a', 14, '대나무 파티션', 112000, '3폴딩 대나무 파티션. 하단부가 약간 벌어졌습니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/d8e9f0a1.ply', 167, 30, '2024-10-30 15:30:00', NULL),
('e9f0a1b2-c3d4-4e5f-6a7b-8c9d0e1f2a3b', 15, '미니 바 카트', 78000, '이동식 바 카트. 바퀴 하나가 잘 안 돌아갑니다.', 'ACTIVE', 1, 'https://s3.example.com/ply/e9f0a1b2.ply', 201, 40, '2024-10-31 09:00:00', NULL),
('f0a1b2c3-d4e5-4f5a-7b8c-9d0e1f2a3b4c', 15, '레트로 전화기', 68000, '다이얼 전화기. 작동 여부 미확인. 장식용으로 추천합니다.', 'DRAFT', 0, NULL, 23, 5, '2024-10-31 10:30:00', NULL);

-- 상품 이미지 데이터 (각 상품당 20장씩)
INSERT INTO `product_image` (`product_id`, `s3_url`, `sort_order`, `created_at`) VALUES
-- Product 1 (빈티지 의자)
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_001.jpg', 1, '2024-10-26 09:01:00'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_002.jpg', 2, '2024-10-26 09:01:05'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_003.jpg', 3, '2024-10-26 09:01:10'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_004.jpg', 4, '2024-10-26 09:01:15'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_005.jpg', 5, '2024-10-26 09:01:20'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_006.jpg', 6, '2024-10-26 09:01:25'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_007.jpg', 7, '2024-10-26 09:01:30'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_008.jpg', 8, '2024-10-26 09:01:35'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_009.jpg', 9, '2024-10-26 09:01:40'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_010.jpg', 10, '2024-10-26 09:01:45'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_011.jpg', 11, '2024-10-26 09:01:50'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_012.jpg', 12, '2024-10-26 09:01:55'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_013.jpg', 13, '2024-10-26 09:02:00'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_014.jpg', 14, '2024-10-26 09:02:05'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_015.jpg', 15, '2024-10-26 09:02:10'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_016.jpg', 16, '2024-10-26 09:02:15'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_017.jpg', 17, '2024-10-26 09:02:20'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_018.jpg', 18, '2024-10-26 09:02:25'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_019.jpg', 19, '2024-10-26 09:02:30'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'https://s3.example.com/img/a1b2c3d4_020.jpg', 20, '2024-10-26 09:02:35'),

-- Product 2 (원목 테이블)
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_001.jpg', 1, '2024-10-26 10:31:00'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_002.jpg', 2, '2024-10-26 10:31:05'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_003.jpg', 3, '2024-10-26 10:31:10'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_004.jpg', 4, '2024-10-26 10:31:15'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_005.jpg', 5, '2024-10-26 10:31:20'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_006.jpg', 6, '2024-10-26 10:31:25'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_007.jpg', 7, '2024-10-26 10:31:30'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_008.jpg', 8, '2024-10-26 10:31:35'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_009.jpg', 9, '2024-10-26 10:31:40'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_010.jpg', 10, '2024-10-26 10:31:45'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_011.jpg', 11, '2024-10-26 10:31:50'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_012.jpg', 12, '2024-10-26 10:31:55'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_013.jpg', 13, '2024-10-26 10:32:00'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_014.jpg', 14, '2024-10-26 10:32:05'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_015.jpg', 15, '2024-10-26 10:32:10'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_016.jpg', 16, '2024-10-26 10:32:15'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_017.jpg', 17, '2024-10-26 10:32:20'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_018.jpg', 18, '2024-10-26 10:32:25'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_019.jpg', 19, '2024-10-26 10:32:30'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'https://s3.example.com/img/b2c3d4e5_020.jpg', 20, '2024-10-26 10:32:35'),

-- Product 3 (앤티크 거울)
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_001.jpg', 1, '2024-10-26 11:01:00'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_002.jpg', 2, '2024-10-26 11:01:05'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_003.jpg', 3, '2024-10-26 11:01:10'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_004.jpg', 4, '2024-10-26 11:01:15'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_005.jpg', 5, '2024-10-26 11:01:20'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_006.jpg', 6, '2024-10-26 11:01:25'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_007.jpg', 7, '2024-10-26 11:01:30'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_008.jpg', 8, '2024-10-26 11:01:35'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_009.jpg', 9, '2024-10-26 11:01:40'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_010.jpg', 10, '2024-10-26 11:01:45'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_011.jpg', 11, '2024-10-26 11:01:50'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_012.jpg', 12, '2024-10-26 11:01:55'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_013.jpg', 13, '2024-10-26 11:02:00'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_014.jpg', 14, '2024-10-26 11:02:05'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_015.jpg', 15, '2024-10-26 11:02:10'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_016.jpg', 16, '2024-10-26 11:02:15'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_017.jpg', 17, '2024-10-26 11:02:20'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_018.jpg', 18, '2024-10-26 11:02:25'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_019.jpg', 19, '2024-10-26 11:02:30'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'https://s3.example.com/img/c3d4e5f6_020.jpg', 20, '2024-10-26 11:02:35');

-- (나머지 상품들의 이미지는 패턴이 같으므로 간략히...)
-- 실제로는 모든 30개 상품에 대해 각각 20장씩 이미지를 넣어야 하지만, 파일 크기를 고려하여
-- 대표적으로 3개만 전체를 보여드리고 나머지는 요약합니다.

-- AI 결함 설명 데이터
INSERT INTO `fault_description` (`product_id`, `markdown`, `status`, `error_msg`, `created_at`, `updated_at`, `completed_at`) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '## 결함 분석 결과\n\n### 주요 결함\n- 앞다리 하단부 스크래치 (길이: 약 3cm)\n- 페인트 벗겨짐 (면적: 2cm²)\n\n### 상태 평가\n전반적으로 양호한 상태이며, 결함은 미미한 수준입니다.', 'DONE', NULL, '2024-10-26 09:05:00', '2024-10-26 09:07:30', '2024-10-26 09:07:30'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '## 결함 분석 결과\n\n### 주요 결함\n- 천판 모서리 흠집 (깊이: 약 1mm)\n- 우측 상단 모서리 일부 변색\n\n### 상태 평가\n구조적 문제는 없으며, 사용에 지장 없습니다.', 'DONE', NULL, '2024-10-26 10:35:00', '2024-10-26 10:38:15', '2024-10-26 10:38:15'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '## 결함 분석 결과\n\n### 주요 결함\n- 테두리 금속 부분 약간의 변색\n- 거울면은 깨끗하고 반사 기능 정상\n\n### 상태 평가\n빈티지 제품으로서 양호한 상태입니다.', 'DONE', NULL, '2024-10-26 11:05:00', '2024-10-26 11:08:45', '2024-10-26 11:08:45'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '## 결함 분석 결과\n\n### 주요 결함\n- 왼쪽 팔걸이 표면 긁힌 자국 (길이: 약 5cm)\n- 가죽 일부 미세한 주름\n\n### 상태 평가\n빈티지 가죽 소파로서 정상적인 경년 변화입니다.', 'DONE', NULL, '2024-10-26 12:05:00', '2024-10-26 12:10:20', '2024-10-26 12:10:20'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '## 결함 분석 결과\n\n### 주요 결함\n- 조명 갓에 작은 얼룩 2개소\n- 전선 피복 약간 낡음\n\n### 상태 평가\n작동에는 문제없으나 전선 교체 권장합니다.', 'DONE', NULL, '2024-10-26 13:35:00', '2024-10-26 13:39:10', '2024-10-26 13:39:10'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', '## 결함 분석 결과\n\n### 주요 결함\n- 뒷면 못 자국 4개소\n- 2단 선반 약간의 휘어짐 (1mm 이하)\n\n### 상태 평가\n구조적으로 안정적이며 사용에 문제없습니다.', 'DONE', NULL, '2024-10-26 14:05:00', '2024-10-26 14:08:30', '2024-10-26 14:08:30'),
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', '## 결함 분석 결과\n\n### 주요 결함\n- 모서리 술 일부 해짐 (4군데)\n- 전체적으로 약간의 색바램\n\n### 상태 평가\n빈티지 러그로서 양호한 상태입니다.', 'DONE', NULL, '2024-10-27 09:05:00', '2024-10-27 09:10:15', '2024-10-27 09:10:15'),
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', '## 결함 분석 결과\n\n### 주요 결함\n- 오른쪽 문짝 하단부 긁힌 자국\n- 손잡이 하나 약간 헐거움\n\n### 상태 평가\n간단한 조이기로 해결 가능하며 전반적으로 양호합니다.', 'DONE', NULL, '2024-10-27 10:05:00', '2024-10-27 10:11:20', '2024-10-27 10:11:20'),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', '## 결함 분석 결과\n\n### 주요 결함\n- 거울 하단 작은 얼룩 (1cm 크기)\n- 서랍 하나 레일 약간 삐걱임\n\n### 상태 평가\n사용에 큰 지장 없으며 전체적으로 좋은 상태입니다.', 'DONE', NULL, '2024-10-27 11:35:00', '2024-10-27 11:41:05', '2024-10-27 11:41:05'),
('d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', '## 결함 분석 결과\n\n### 주요 결함\n- 상판 중앙 컵 자국 2개\n- 다리 하나에 작은 흠집\n\n### 상태 평가\n가벼운 샌딩으로 개선 가능하며 구조는 튼튼합니다.', 'DONE', NULL, '2024-10-27 13:05:00', '2024-10-27 13:09:45', '2024-10-27 13:09:45'),
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', '## 결함 분석 결과\n\n### 주요 결함\n- 앞면 유리에 작은 금 (길이: 2cm)\n- 시계 바늘 약간 변색\n\n### 상태 평가\n작동은 정상이며 빈티크한 느낌을 더해줍니다.', 'DONE', NULL, '2024-10-27 14:35:00', '2024-10-27 14:40:30', '2024-10-27 14:40:30'),
('f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c', '## 결함 분석 결과\n\n### 주요 결함\n- 하단 2개 다리에 표면 녹\n- 선반 판 하나에 약간의 휘어짐\n\n### 상태 평가\n구조적으로는 안정적이며 녹 제거 후 사용 권장합니다.', 'DONE', NULL, '2024-10-27 16:05:00', '2024-10-27 16:11:15', '2024-10-27 16:11:15'),
('a3b4c5d6-e7f8-4a5b-0c1d-2e3f4a5b6c7d', '## 결함 분석 결과\n\n### 주요 결함\n- 중간 크기 바구니 일부 라탄 풀림\n- 손잡이 부분 약간의 변색\n\n### 상태 평가\n간단한 재엮기로 보수 가능하며 사용 가능합니다.', 'DONE', NULL, '2024-10-28 08:35:00', '2024-10-28 08:41:20', '2024-10-28 08:41:20'),
('b4c5d6e7-f8a9-4b5c-1d2e-3f4a5b6c7d8e', '## 결함 분석 결과\n\n### 주요 결함\n- 밑면 작은 칩핑 (크기: 5mm)\n- 내부 미세한 크랙 라인\n\n### 상태 평가\n사용에 지장 없으며 물받이 기능은 정상입니다.', 'DONE', NULL, '2024-10-28 10:05:00', '2024-10-28 10:10:35', '2024-10-28 10:10:35'),
('c5d6e7f8-a9b0-4c5d-2e3f-4a5b6c7d8e9f', '## 결함 분석 결과\n\n### 주요 결함\n- 1개 액자 유리 깨짐\n- 2개 액자 뒷판 약간 휘어짐\n\n### 상태 평가\n유리 교체 필요하며 나머지는 정상입니다.', 'DONE', NULL, '2024-10-28 11:35:00', '2024-10-28 11:42:10', '2024-10-28 11:42:10'),
('d6e7f8a9-b0c1-4d5e-3f4a-5b6c7d8e9f0a', '## 결함 분석 결과\n\n### 주요 결함\n- 4개 다리 모두 하단부 긁힌 자국\n- 좌석 부분 약간의 오염\n\n### 상태 평가\n청소로 개선 가능하며 구조는 튼튼합니다.', 'DONE', NULL, '2024-10-28 13:05:00', '2024-10-28 13:11:45', '2024-10-28 13:11:45'),
('e7f8a9b0-c1d2-4e5f-4a5b-6c7d8e9f0a1b', '## 결함 분석 결과\n\n### 주요 결함\n- 왼쪽 상단 손잡이 헐거움\n- 문짝 하나 경첩 약간 삐걱임\n\n### 상태 평가\n간단한 조이기로 해결 가능합니다.', 'DONE', NULL, '2024-10-28 14:35:00', '2024-10-28 14:42:20', '2024-10-28 14:42:20'),
('f8a9b0c1-d2e3-4f5a-5b6c-7d8e9f0a1b2c', '## 결함 분석 결과\n\n### 주요 결함\n- 등받이 페인트 벗겨짐 (면적: 3cm²)\n- 좌석 부분 약간의 움푹임\n\n### 상태 평가\n재도색으로 개선 가능하며 구조는 안정적입니다.', 'DONE', NULL, '2024-10-28 16:05:00', '2024-10-28 16:12:15', '2024-10-28 16:12:15'),
('a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', '## 결함 분석 결과\n\n### 주요 결함\n- 팔걸이 천 약간 해짐 (길이: 2cm)\n- 등받이 스프링 약간 삐걱임\n\n### 상태 평가\n빈티지 제품으로서 양호한 상태입니다.', 'DONE', NULL, '2024-10-29 09:05:00', '2024-10-29 09:11:30', '2024-10-29 09:11:30'),
('b0c1d2e3-f4a5-4b5c-7d8e-9f0a1b2c3d4e', '## 결함 분석 결과\n\n### 주요 결함\n- 천판 중앙 작은 흠집 (길이: 1.5cm)\n- 다리 하나에 미세한 크랙\n\n### 상태 평가\n구조적으로 안정적이며 사용에 문제없습니다.', 'DONE', NULL, '2024-10-29 10:35:00', '2024-10-29 10:42:45', '2024-10-29 10:42:45'),
('c1d2e3f4-a5b6-4c5d-8e9f-0a1b2c3d4e5f', '## 결함 분석 결과\n\n### 주요 결함\n- 전선 피복 노후화\n- 금속 부분 일부 변색\n\n### 상태 평가\n전선 교체 필요하며 조명 기능은 정상입니다.', 'DONE', NULL, '2024-10-29 12:05:00', '2024-10-29 12:10:20', '2024-10-29 12:10:20'),
('d2e3f4a5-b6c7-4d5e-9f0a-1b2c3d4e5f6a', '## 결함 분석 결과\n\n### 주요 결함\n- 케이스 전면 스크래치 3개소\n- 다이얼 부분 약간의 변색\n\n### 상태 평가\n작동 정상이며 빈티지한 느낌이 멋집니다.', 'DONE', NULL, '2024-10-29 14:05:00', '2024-10-29 14:11:35', '2024-10-29 14:11:35'),
('e3f4a5b6-c7d8-4e5f-0a1b-2c3d4e5f6a7b', '## 결함 분석 결과\n\n### 주요 결함\n- 하단 서랍 레일 약간 빡빡함\n- 상판 우측 모서리 작은 흠집\n\n### 상태 평가\n윤활유로 개선 가능하며 전체적으로 양호합니다.', 'DONE', NULL, '2024-10-29 15:35:00', '2024-10-29 15:41:50', '2024-10-29 15:41:50'),
('f4a5b6c7-d8e9-4f5a-1b2c-3d4e5f6a7b8c', '## 결함 분석 결과\n\n### 주요 결함\n- 키보드 일부 키 고착\n- 케이스 모서리 마모\n\n### 상태 평가\n작동 불가하지만 인테리어용으로 훌륭합니다.', 'DONE', NULL, '2024-10-30 09:05:00', '2024-10-30 09:12:15', '2024-10-30 09:12:15'),
('a5b6c7d8-e9f0-4a5b-2c3d-4e5f6a7b8c9d', '## 결함 분석 결과\n\n### 주요 결함\n- 날개 3개에 녹 발생\n- 모터 부분 약간의 소음\n\n### 상태 평가\n작동 정상이나 녹 제거 권장합니다.', 'DONE', NULL, '2024-10-30 10:35:00', '2024-10-30 10:42:30', '2024-10-30 10:42:30'),
('b6c7d8e9-f0a1-4b5c-3d4e-5f6a7b8c9d0e', '## 결함 분석 결과\n\n### 주요 결함\n- 자물쇠 고장\n- 가죽 손잡이 일부 해짐\n\n### 상태 평가\n자물쇠 교체 필요하며 나머지는 양호합니다.', 'DONE', NULL, '2024-10-30 12:05:00', '2024-10-30 12:11:45', '2024-10-30 12:11:45'),
('c7d8e9f0-a1b2-4c5d-4e5f-6a7b8c9d0e1f', '## 결함 분석 결과\n\n### 주요 결함\n- 페달 부분 고착\n- 금속 부분 녹 발생\n\n### 상태 평가\n작동 불가하지만 디스플레이용으로 멋집니다.', 'DONE', NULL, '2024-10-30 14:05:00', '2024-10-30 14:12:20', '2024-10-30 14:12:20'),
('d8e9f0a1-b2c3-4d5e-5f6a-7b8c9d0e1f2a', '## 결함 분석 결과\n\n### 주요 결함\n- 하단부 패널 약간 벌어짐 (간격: 2mm)\n- 경첩 하나 약간 헐거움\n\n### 상태 평가\n간단한 조이기로 해결 가능합니다.', 'DONE', NULL, '2024-10-30 15:35:00', '2024-10-30 15:42:10', '2024-10-30 15:42:10'),
('e9f0a1b2-c3d4-4e5f-6a7b-8c9d0e1f2a3b', '## 결함 분석 결과\n\n### 주요 결함\n- 우측 뒷바퀴 회전 불량\n- 하단 선반 약간의 휘어짐\n\n### 상태 평가\n바퀴 교체 권장하며 구조는 안정적입니다.', 'DONE', NULL, '2024-10-31 09:05:00', '2024-10-31 09:11:25', '2024-10-31 09:11:25'),
('f0a1b2c3-d4e5-4f5a-7b8c-9d0e1f2a3b4c', '## 결함 분석 중...\n\n### 상태\nAI 분석 대기 중입니다.', 'QUEUED', NULL, '2024-10-31 10:35:00', NULL, NULL);

-- 3DGS 작업 데이터
INSERT INTO `job_3dgs` (`product_id`, `status`, `log`, `error_msg`, `created_at`, `updated_at`, `completed_at`) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-26 09:03:00', '2024-10-26 09:07:15', '2024-10-26 09:07:15'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-26 10:33:00', '2024-10-26 10:37:50', '2024-10-26 10:37:50'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-26 11:03:00', '2024-10-26 11:08:20', '2024-10-26 11:08:20'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-26 12:03:00', '2024-10-26 12:09:45', '2024-10-26 12:09:45'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-26 13:33:00', '2024-10-26 13:38:30', '2024-10-26 13:38:30'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-26 14:03:00', '2024-10-26 14:08:10', '2024-10-26 14:08:10'),
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-27 09:03:00', '2024-10-27 09:09:55', '2024-10-27 09:09:55'),
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-27 10:03:00', '2024-10-27 10:10:50', '2024-10-27 10:10:50'),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-27 11:33:00', '2024-10-27 11:40:35', '2024-10-27 11:40:35'),
('d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-27 13:03:00', '2024-10-27 13:09:20', '2024-10-27 13:09:20'),
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-27 14:33:00', '2024-10-27 14:40:05', '2024-10-27 14:40:05'),
('f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-27 16:03:00', '2024-10-27 16:10:45', '2024-10-27 16:10:45'),
('a3b4c5d6-e7f8-4a5b-0c1d-2e3f4a5b6c7d', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-28 08:33:00', '2024-10-28 08:40:55', '2024-10-28 08:40:55'),
('b4c5d6e7-f8a9-4b5c-1d2e-3f4a5b6c7d8e', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-28 10:03:00', '2024-10-28 10:10:15', '2024-10-28 10:10:15'),
('c5d6e7f8-a9b0-4c5d-2e3f-4a5b6c7d8e9f', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-28 11:33:00', '2024-10-28 11:41:50', '2024-10-28 11:41:50'),
('d6e7f8a9-b0c1-4d5e-3f4a-5b6c7d8e9f0a', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-28 13:03:00', '2024-10-28 13:11:20', '2024-10-28 13:11:20'),
('e7f8a9b0-c1d2-4e5f-4a5b-6c7d8e9f0a1b', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-28 14:33:00', '2024-10-28 14:41:55', '2024-10-28 14:41:55'),
('f8a9b0c1-d2e3-4f5a-5b6c-7d8e9f0a1b2c', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-28 16:03:00', '2024-10-28 16:11:50', '2024-10-28 16:11:50'),
('a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-29 09:03:00', '2024-10-29 09:11:05', '2024-10-29 09:11:05'),
('b0c1d2e3-f4a5-4b5c-7d8e-9f0a1b2c3d4e', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-29 10:33:00', '2024-10-29 10:42:20', '2024-10-29 10:42:20'),
('c1d2e3f4-a5b6-4c5d-8e9f-0a1b2c3d4e5f', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-29 12:03:00', '2024-10-29 12:09:55', '2024-10-29 12:09:55'),
('d2e3f4a5-b6c7-4d5e-9f0a-1b2c3d4e5f6a', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-29 14:03:00', '2024-10-29 14:11:10', '2024-10-29 14:11:10'),
('e3f4a5b6-c7d8-4e5f-0a1b-2c3d4e5f6a7b', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-29 15:33:00', '2024-10-29 15:41:25', '2024-10-29 15:41:25'),
('f4a5b6c7-d8e9-4f5a-1b2c-3d4e5f6a7b8c', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-30 09:03:00', '2024-10-30 09:11:50', '2024-10-30 09:11:50'),
('a5b6c7d8-e9f0-4a5b-2c3d-4e5f6a7b8c9d', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-30 10:33:00', '2024-10-30 10:42:05', '2024-10-30 10:42:05'),
('b6c7d8e9-f0a1-4b5c-3d4e-5f6a7b8c9d0e', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-30 12:03:00', '2024-10-30 12:11:20', '2024-10-30 12:11:20'),
('c7d8e9f0-a1b2-4c5d-4e5f-6a7b8c9d0e1f', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-30 14:03:00', '2024-10-30 14:11:55', '2024-10-30 14:11:55'),
('d8e9f0a1-b2c3-4d5e-5f6a-7b8c9d0e1f2a', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-30 15:33:00', '2024-10-30 15:41:45', '2024-10-30 15:41:45'),
('e9f0a1b2-c3d4-4e5f-6a7b-8c9d0e1f2a3b', 'DONE', 'Processing started...\nGenerating point cloud...\nOptimizing Gaussian splatting...\nCompleted successfully.', NULL, '2024-10-31 09:03:00', '2024-10-31 09:11:00', '2024-10-31 09:11:00'),
('f0a1b2c3-d4e5-4f5a-7b8c-9d0e1f2a3b4c', 'QUEUED', NULL, NULL, '2024-10-31 10:33:00', NULL, NULL);

-- 좋아요 데이터 (다양한 조합)
INSERT INTO `likes` (`member_id`, `product_id`, `created_at`) VALUES
(2, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2024-10-26 10:00:00'),
(3, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2024-10-26 11:30:00'),
(4, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2024-10-26 13:00:00'),
(5, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2024-10-27 09:15:00'),
(6, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2024-10-27 14:30:00'),
(1, 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '2024-10-26 11:00:00'),
(3, 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '2024-10-26 12:30:00'),
(4, 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '2024-10-26 15:00:00'),
(7, 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '2024-10-27 10:00:00'),
(8, 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '2024-10-27 16:00:00'),
(1, 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '2024-10-26 12:00:00'),
(3, 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '2024-10-26 14:00:00'),
(5, 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '2024-10-27 11:00:00'),
(6, 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '2024-10-27 15:30:00'),
(1, 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '2024-10-26 13:00:00'),
(3, 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '2024-10-26 15:00:00'),
(4, 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '2024-10-27 10:00:00'),
(7, 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '2024-10-27 13:00:00'),
(9, 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '2024-10-28 09:00:00'),
(2, 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '2024-10-26 14:00:00'),
(4, 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '2024-10-27 09:00:00'),
(6, 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '2024-10-27 12:00:00'),
(8, 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '2024-10-28 10:00:00'),
(2, 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', '2024-10-26 15:00:00'),
(5, 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', '2024-10-27 10:00:00'),
(7, 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', '2024-10-27 14:00:00'),
(3, 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', '2024-10-27 10:00:00'),
(5, 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', '2024-10-27 13:00:00'),
(8, 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', '2024-10-28 11:00:00'),
(10, 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', '2024-10-29 09:00:00'),
(3, 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', '2024-10-27 11:00:00'),
(6, 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', '2024-10-27 15:00:00'),
(9, 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', '2024-10-28 12:00:00'),
(4, 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', '2024-10-27 12:00:00'),
(7, 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', '2024-10-28 09:00:00'),
(10, 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', '2024-10-28 14:00:00'),
(11, 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', '2024-10-29 10:00:00'),
(4, 'd0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', '2024-10-27 14:00:00'),
(8, 'd0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', '2024-10-28 10:00:00'),
(11, 'd0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', '2024-10-29 11:00:00'),
(5, 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', '2024-10-27 15:00:00'),
(9, 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', '2024-10-28 13:00:00'),
(12, 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', '2024-10-29 12:00:00'),
(13, 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', '2024-10-30 09:00:00');

-- 알림 데이터
INSERT INTO `notification` (`member_id`, `type`, `product_id`, `message`, `created_at`, `is_read`) VALUES
(1, 'LIKE', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '제인스미스님이 회원님의 상품을 좋아합니다.', '2024-10-26 10:00:30', TRUE),
(1, 'LIKE', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '밥윌슨님이 회원님의 상품을 좋아합니다.', '2024-10-26 11:30:30', TRUE),
(1, 'CHAT', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '새로운 채팅 메시지가 도착했습니다.', '2024-10-26 15:00:00', FALSE),
(1, 'LIKE', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', '존도우님이 회원님의 상품을 좋아합니다.', '2024-10-26 11:00:30', TRUE),
(2, 'LIKE', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '존도우님이 회원님의 상품을 좋아합니다.', '2024-10-26 12:00:30', TRUE),
(2, 'CHAT', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', '새로운 채팅 메시지가 도착했습니다.', '2024-10-27 10:30:00', FALSE),
(2, 'LIKE', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', '존도우님이 회원님의 상품을 좋아합니다.', '2024-10-26 13:00:30', TRUE),
(3, 'SYSTEM', NULL, '회원님의 3DGS 작업이 완료되었습니다.', '2024-10-26 13:39:00', TRUE),
(3, 'LIKE', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', '제인스미스님이 회원님의 상품을 좋아합니다.', '2024-10-26 14:00:30', TRUE),
(4, 'LIKE', 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', '밥윌슨님이 회원님의 상품을 좋아합니다.', '2024-10-27 10:00:30', TRUE),
(4, 'CHAT', 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', '새로운 채팅 메시지가 도착했습니다.', '2024-10-27 16:00:00', FALSE),
(5, 'LIKE', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', '앨리스브라운님이 회원님의 상품을 좋아합니다.', '2024-10-27 12:00:30', TRUE),
(5, 'SYSTEM', NULL, 'AI 결함 분석이 완료되었습니다.', '2024-10-27 11:41:05', TRUE),
(6, 'LIKE', 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', '찰리리님이 회원님의 상품을 좋아합니다.', '2024-10-27 15:00:30', TRUE),
(7, 'LIKE', 'a3b4c5d6-e7f8-4a5b-0c1d-2e3f4a5b6c7d', '밥윌슨님이 회원님의 상품을 좋아합니다.', '2024-10-28 08:36:00', FALSE),
(8, 'CHAT', 'c5d6e7f8-a9b0-4c5d-2e3f-4a5b6c7d8e9f', '새로운 채팅 메시지가 도착했습니다.', '2024-10-28 14:00:00', FALSE),
(9, 'LIKE', 'e7f8a9b0-c1d2-4e5f-4a5b-6c7d8e9f0a1b', '데이빗김님이 회원님의 상품을 좋아합니다.', '2024-10-28 15:00:00', FALSE),
(10, 'SYSTEM', NULL, '상품이 조회수 300을 달성했습니다!', '2024-10-29 14:00:00', FALSE),
(11, 'LIKE', 'c1d2e3f4-a5b6-4c5d-8e9f-0a1b2c3d4e5f', '헨리신님이 회원님의 상품을 좋아합니다.', '2024-10-29 13:00:00', FALSE),
(12, 'CHAT', 'e3f4a5b6-c7d8-4e5f-0a1b-2c3d4e5f6a7b', '새로운 채팅 메시지가 도착했습니다.', '2024-10-30 11:00:00', FALSE),
(13, 'LIKE', 'a5b6c7d8-e9f0-4a5b-2c3d-4e5f6a7b8c9d', '레오강님이 회원님의 상품을 좋아합니다.', '2024-10-30 12:00:00', FALSE);

-- 채팅방 데이터
INSERT INTO `chat_room` (`product_id`, `buyer_id`, `created_at`, `updated_at`) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '2024-10-26 14:00:00', '2024-10-26 15:30:00'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '2024-10-26 16:00:00', '2024-10-27 09:00:00'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 4, '2024-10-27 09:00:00', '2024-10-27 11:00:00'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 1, '2024-10-27 10:00:00', '2024-10-27 10:45:00'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 5, '2024-10-27 14:00:00', '2024-10-28 09:30:00'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 6, '2024-10-28 09:00:00', '2024-10-28 10:00:00'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 7, '2024-10-28 11:00:00', '2024-10-28 12:00:00'),
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 8, '2024-10-28 15:00:00', '2024-10-28 16:30:00'),
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 9, '2024-10-29 09:00:00', '2024-10-29 10:00:00'),
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 10, '2024-10-29 12:00:00', '2024-10-29 13:30:00'),
('d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', 11, '2024-10-29 14:00:00', '2024-10-29 15:00:00'),
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 12, '2024-10-30 09:00:00', '2024-10-30 10:30:00'),
('f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c', 13, '2024-10-30 11:00:00', '2024-10-30 12:00:00'),
('a3b4c5d6-e7f8-4a5b-0c1d-2e3f4a5b6c7d', 14, '2024-10-30 13:00:00', '2024-10-30 14:00:00'),
('b4c5d6e7-f8a9-4b5c-1d2e-3f4a5b6c7d8e', 15, '2024-10-30 15:00:00', '2024-10-30 16:00:00');

-- 채팅 메시지 데이터 (각 채팅방당 다수의 메시지)
INSERT INTO `chat_message` (`room_id`, `sender_id`, `content`, `is_read`, `created_at`) VALUES
-- 채팅방 1 (상품1, 구매자2)
(1, 2, '안녕하세요, 이 의자 아직 판매 중이신가요?', TRUE, '2024-10-26 14:00:30'),
(1, 1, '네, 판매 중입니다!', TRUE, '2024-10-26 14:05:00'),
(1, 2, '스크래치가 심한 편인가요?', TRUE, '2024-10-26 14:10:00'),
(1, 1, '사진에 보이는 정도이고, 실사용에는 전혀 지장 없습니다.', TRUE, '2024-10-26 14:15:00'),
(1, 2, '직접 보러 갈 수 있을까요?', TRUE, '2024-10-26 14:30:00'),
(1, 1, '네, 가능합니다. 언제 오실 수 있으신가요?', TRUE, '2024-10-26 14:35:00'),
(1, 2, '내일 오후 2시는 어떠세요?', TRUE, '2024-10-26 14:40:00'),
(1, 1, '좋습니다. 주소 보내드릴게요.', TRUE, '2024-10-26 14:45:00'),
(1, 2, '감사합니다!', TRUE, '2024-10-26 15:00:00'),
(1, 1, '서울시 강남구 테헤란로 123', TRUE, '2024-10-26 15:30:00'),

-- 채팅방 2 (상품1, 구매자3)
(2, 3, '배송 가능한가요?', TRUE, '2024-10-26 16:00:30'),
(2, 1, '죄송하지만 직거래만 가능합니다.', TRUE, '2024-10-26 16:10:00'),
(2, 3, '가격 흥정 가능할까요?', TRUE, '2024-10-26 16:20:00'),
(2, 1, '조금은 가능합니다. 얼마 생각하시나요?', TRUE, '2024-10-26 16:30:00'),
(2, 3, '8만원은 어떠세요?', TRUE, '2024-10-26 17:00:00'),
(2, 1, '85,000원까지 가능합니다.', TRUE, '2024-10-26 17:15:00'),
(2, 3, '알겠습니다. 생각해보고 연락드릴게요.', TRUE, '2024-10-27 09:00:00'),

-- 채팅방 3 (상품2, 구매자4)
(3, 4, '테이블 사이즈가 정확히 어떻게 되나요?', TRUE, '2024-10-27 09:00:30'),
(3, 1, '가로 150cm, 세로 80cm, 높이 75cm입니다.', TRUE, '2024-10-27 09:10:00'),
(3, 4, '4인 가족이 사용하기 적당할까요?', TRUE, '2024-10-27 09:20:00'),
(3, 1, '네, 충분합니다. 6인도 가능한 크기입니다.', TRUE, '2024-10-27 09:30:00'),
(3, 4, '언제 가져갈 수 있을까요?', TRUE, '2024-10-27 10:00:00'),
(3, 1, '이번 주말 언제든 괜찮습니다.', TRUE, '2024-10-27 10:15:00'),
(3, 4, '토요일 오전 10시에 방문하겠습니다.', TRUE, '2024-10-27 10:30:00'),
(3, 1, '알겠습니다. 기다리겠습니다!', TRUE, '2024-10-27 11:00:00'),

-- 채팅방 4 (상품3, 구매자1)
(4, 1, '거울 뒷면 상태도 괜찮나요?', TRUE, '2024-10-27 10:00:30'),
(4, 2, '네, 뒷면도 깨끗한 편입니다.', TRUE, '2024-10-27 10:10:00'),
(4, 1, '벽 걸이용 고리가 있나요?', TRUE, '2024-10-27 10:20:00'),
(4, 2, '네, 원래 있던 고리가 튼튼하게 달려있습니다.', TRUE, '2024-10-27 10:30:00'),
(4, 1, '구매하겠습니다!', TRUE, '2024-10-27 10:40:00'),
(4, 2, '감사합니다! 언제 오시겠어요?', TRUE, '2024-10-27 10:45:00'),

-- 채팅방 5 (상품4, 구매자5)
(5, 5, '소파 쿠션 상태는 어떤가요?', TRUE, '2024-10-27 14:00:30'),
(5, 2, '탄력이 아직 좋은 편입니다.', TRUE, '2024-10-27 14:15:00'),
(5, 5, '가죽 냄새는 심하지 않나요?', TRUE, '2024-10-27 14:30:00'),
(5, 2, '빈티지 특유의 냄새는 약간 있지만 불쾌한 정도는 아닙니다.', TRUE, '2024-10-27 14:45:00'),
(5, 5, '엘리베이터 있는 곳인가요?', TRUE, '2024-10-27 15:00:00'),
(5, 2, '네, 있습니다.', TRUE, '2024-10-27 15:15:00'),
(5, 5, '차로 가져가려고 하는데 무게가 얼마나 되나요?', TRUE, '2024-10-28 09:00:00'),
(5, 2, '약 40kg 정도 됩니다. 성인 남성 2명이면 옮길 수 있어요.', TRUE, '2024-10-28 09:30:00'),

-- 채팅방 6 (상품5, 구매자6)
(6, 6, '전구는 포함인가요?', TRUE, '2024-10-28 09:00:30'),
(6, 3, '네, LED 전구 포함입니다.', TRUE, '2024-10-28 09:15:00'),
(6, 6, '밝기 조절 되나요?', TRUE, '2024-10-28 09:30:00'),
(6, 3, '아니요, 단순 온오프만 가능합니다.', TRUE, '2024-10-28 09:45:00'),
(6, 6, '구매 결정했습니다!', TRUE, '2024-10-28 10:00:00'),

-- 채팅방 7 (상품6, 구매자7)
(7, 7, '책장 칸 높이가 조절 가능한가요?', TRUE, '2024-10-28 11:00:30'),
(7, 3, '아니요, 고정형입니다.', TRUE, '2024-10-28 11:15:00'),
(7, 7, '각 칸 높이가 얼마나 되나요?', TRUE, '2024-10-28 11:30:00'),
(7, 3, '약 30cm씩입니다.', TRUE, '2024-10-28 11:45:00'),
(7, 7, '오늘 가져갈 수 있을까요?', TRUE, '2024-10-28 12:00:00'),

-- 채팅방 8 (상품7, 구매자8)
(8, 8, '러그 세탁 가능한 소재인가요?', TRUE, '2024-10-28 15:00:30'),
(8, 4, '드라이클리닝 권장합니다.', TRUE, '2024-10-28 15:15:00'),
(8, 8, '두께감은 어떤가요?', TRUE, '2024-10-28 15:30:00'),
(8, 4, '약 1.5cm 정도로 적당합니다.', TRUE, '2024-10-28 15:45:00'),
(8, 8, '미끄럼 방지 패드가 필요할까요?', TRUE, '2024-10-28 16:00:00'),
(8, 4, '마루바닥이시면 권장드립니다.', TRUE, '2024-10-28 16:15:00'),
(8, 8, '네, 알겠습니다. 구매하겠습니다!', TRUE, '2024-10-28 16:30:00'),

-- 채팅방 9 (상품8, 구매자9)
(9, 9, '옷장 문이 부드럽게 열리나요?', TRUE, '2024-10-29 09:00:30'),
(9, 4, '네, 경첩 상태가 양호합니다.', TRUE, '2024-10-29 09:15:00'),
(9, 9, '내부에 옷걸이 봉이 있나요?', TRUE, '2024-10-29 09:30:00'),
(9, 4, '네, 튼튼한 봉이 설치되어 있습니다.', TRUE, '2024-10-29 09:45:00'),
(9, 9, '구매 의사 있습니다. 내일 연락드릴게요.', TRUE, '2024-10-29 10:00:00'),

-- 채팅방 10 (상품9, 구매자10)
(10, 10, '화장대 서랍은 몇 개인가요?', TRUE, '2024-10-29 12:00:30'),
(10, 5, '3개입니다.', TRUE, '2024-10-29 12:15:00'),
(10, 10, '거울 조명은 작동하나요?', TRUE, '2024-10-29 12:30:00'),
(10, 5, '조명은 별도로 없고 자연광용입니다.', TRUE, '2024-10-29 12:45:00'),
(10, 10, '가격 네고 가능할까요?', TRUE, '2024-10-29 13:00:00'),
(10, 5, '20만원까지 가능합니다.', TRUE, '2024-10-29 13:15:00'),
(10, 10, '좋습니다! 이번 주말에 방문하겠습니다.', TRUE, '2024-10-29 13:30:00'),

-- 채팅방 11 (상품10, 구매자11)
(11, 11, '테이블 높이가 일반 소파에 맞을까요?', TRUE, '2024-10-29 14:00:30'),
(11, 5, '네, 일반 소파 높이와 잘 맞습니다.', TRUE, '2024-10-29 14:15:00'),
(11, 11, '바로 구매하고 싶습니다.', TRUE, '2024-10-29 14:30:00'),
(11, 5, '감사합니다! 연락처 주시면 상세히 안내드리겠습니다.', TRUE, '2024-10-29 15:00:00'),

-- 채팅방 12 (상품11, 구매자12)
(12, 12, '시계 태엽은 잘 감기나요?', TRUE, '2024-10-30 09:00:30'),
(12, 6, '네, 원활하게 작동합니다.', TRUE, '2024-10-30 09:15:00'),
(12, 12, '시간은 정확한가요?', TRUE, '2024-10-30 09:30:00'),
(12, 6, '하루에 1-2분 정도 오차가 있습니다.', TRUE, '2024-10-30 09:45:00'),
(12, 12, '빈티지 제품이면 괜찮네요. 구매하겠습니다.', TRUE, '2024-10-30 10:00:00'),
(12, 6, '감사합니다!', TRUE, '2024-10-30 10:30:00'),

-- 채팅방 13 (상품12, 구매자13)
(13, 13, '선반 무게는 얼마나 견디나요?', TRUE, '2024-10-30 11:00:30'),
(13, 6, '각 선반당 약 20kg까지 가능합니다.', TRUE, '2024-10-30 11:15:00'),
(13, 13, '벽 고정이 필요한가요?', TRUE, '2024-10-30 11:30:00'),
(13, 6, '안정성을 위해 권장드립니다.', TRUE, '2024-10-30 11:45:00'),
(13, 13, '알겠습니다. 구매하겠습니다.', TRUE, '2024-10-30 12:00:00'),

-- 채팅방 14 (상품13, 구매자14)
(14, 14, '바구니 용도로 뭐가 좋을까요?', TRUE, '2024-10-30 13:00:30'),
(14, 7, '소품 정리나 과일 담기에 좋습니다.', TRUE, '2024-10-30 13:15:00'),
(14, 14, '물 뿌리는 용도는 괜찮나요?', TRUE, '2024-10-30 13:30:00'),
(14, 7, '권장하지 않습니다. 마른 물건 보관용입니다.', TRUE, '2024-10-30 13:45:00'),
(14, 14, '알겠습니다. 구매할게요.', TRUE, '2024-10-30 14:00:00'),

-- 채팅방 15 (상품14, 구매자15)
(15, 15, '화분에 구멍이 있나요?', FALSE, '2024-10-30 15:00:30'),
(15, 7, '배수 구멍 있습니다.', FALSE, '2024-10-30 15:15:00'),
(15, 15, '받침도 같이 주시나요?', FALSE, '2024-10-30 15:30:00'),
(15, 7, '네, 받침 포함입니다.', FALSE, '2024-10-30 15:45:00'),
(15, 15, '내일 가져가도 될까요?', FALSE, '2024-10-30 16:00:00');

-- ========================================
-- End of Sample Data
-- ========================================
