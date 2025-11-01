-- 채팅방 테이블
CREATE TABLE IF NOT EXISTS chat_room (
    chat_room_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES member(member_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES member(member_id) ON DELETE CASCADE,

    -- 같은 상품에 대한 같은 구매자와 판매자의 채팅방은 하나만 존재
    UNIQUE KEY unique_chat_room (product_id, buyer_id, seller_id),

    INDEX idx_buyer (buyer_id),
    INDEX idx_seller (seller_id),
    INDEX idx_product (product_id),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 메시지 테이블
CREATE TABLE IF NOT EXISTS message (
    message_id VARCHAR(36) PRIMARY KEY,
    chat_room_id VARCHAR(36) NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (chat_room_id) REFERENCES chat_room(chat_room_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES member(member_id) ON DELETE CASCADE,

    INDEX idx_chat_room (chat_room_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
