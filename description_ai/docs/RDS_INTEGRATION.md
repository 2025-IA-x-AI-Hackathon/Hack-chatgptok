# RDS Integration Guide

중고 물품 결함 분석 서비스와 RDS 연동 가이드

## 개요

이 문서는 FAULT_DESC 서비스가 RDS와 연동하여 제품 결함 분석 및 상태 업데이트를 수행하는 방법을 설명합니다.

## 워크플로우

```
RDS → FAULT_DESC API → 결함 분석 → job_count 업데이트 → RDS
```

### 상태 관리

제품의 처리 상태는 `job_count` 필드로 관리됩니다:

- **0**: 초기 상태 (처리 전)
- **1**: 한 가지 서비스 완료 (FAULT_DESC 또는 3DGS)
- **2**: 두 서비스 모두 완료 → **제품 공개 가능**

## API 명세

### 1. 제품 결함 분석 엔드포인트

#### POST `/inspect/analyze-product`

RDS에서 제품 정보를 받아 결함 분석을 수행하고 결과를 반환합니다.

**요청 형식:**

```json
{
  "product_id": "PROD-12345",
  "s3_images": [
    "s3://ss-s3-project/products/PROD-12345/img1.jpg",
    "s3://ss-s3-project/products/PROD-12345/img2.jpg",
    "s3://ss-s3-project/products/PROD-12345/img3.jpg"
  ],
  "item_category": "신발"
}
```

**응답 형식:**

```json
{
  "product_id": "PROD-12345",
  "inspection_results": [
    {
      "image_path": "s3://ss-s3-project/products/PROD-12345/img1.jpg",
      "defects": [
        {
          "type": "스크래치",
          "severity": "중",
          "location": "왼쪽 앞코",
          "description": "3cm 길이의 깊은 스크래치",
          "confidence": 0.92
        }
      ],
      "overall_condition": "B",
      "recommended_price_adjustment": -15,
      "analysis_confidence": 0.88
    }
  ],
  "aggregated_condition": "B",
  "aggregated_price_adjustment": -15,
  "completed_at": "2025-11-01T12:34:56Z"
}
```

### 2. RDS 업데이트 쿼리

FAULT_DESC 서비스 완료 후 RDS에 결과를 저장하고 `job_count`를 증가시킵니다.

#### SQL 예시 (PostgreSQL)

```sql
-- 1. 결함 분석 결과 저장
INSERT INTO product_inspections (
    product_id,
    inspection_type,
    overall_condition,
    price_adjustment,
    defect_summary,
    raw_results,
    completed_at
) VALUES (
    'PROD-12345',
    'FAULT_DESC',
    'B',
    -15,
    '스크래치(중) 1건',
    '{"defects": [...]}',
    NOW()
);

-- 2. job_count 증가 (0 → 1 또는 1 → 2)
UPDATE products
SET
    job_count = job_count + 1,
    updated_at = NOW()
WHERE product_id = 'PROD-12345';

-- 3. job_count가 2가 되면 제품 공개 (is_visible = TRUE)
UPDATE products
SET
    is_visible = CASE
        WHEN job_count >= 2 THEN TRUE
        ELSE is_visible
    END,
    published_at = CASE
        WHEN job_count >= 2 AND published_at IS NULL THEN NOW()
        ELSE published_at
    END
WHERE product_id = 'PROD-12345';
```

#### 트랜잭션 예시

```sql
BEGIN;

-- 결함 분석 결과 저장
INSERT INTO product_inspections (...) VALUES (...);

-- job_count 증가 및 가시성 업데이트
UPDATE products
SET
    job_count = job_count + 1,
    is_visible = CASE WHEN job_count + 1 >= 2 THEN TRUE ELSE FALSE END,
    published_at = CASE WHEN job_count + 1 >= 2 AND published_at IS NULL THEN NOW() ELSE published_at END,
    updated_at = NOW()
WHERE product_id = 'PROD-12345';

COMMIT;
```

## 데이터베이스 스키마

### products 테이블

```sql
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    job_count INTEGER DEFAULT 0,  -- 완료된 서비스 개수 (0, 1, 2)
    is_visible BOOLEAN DEFAULT FALSE,  -- job_count >= 2일 때 TRUE
    published_at TIMESTAMP,  -- 제품 공개 시간
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- job_count 인덱스 (빠른 조회)
CREATE INDEX idx_products_job_count ON products(job_count);
CREATE INDEX idx_products_is_visible ON products(is_visible);
```

### product_inspections 테이블

```sql
CREATE TABLE product_inspections (
    inspection_id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(product_id),
    inspection_type VARCHAR(20),  -- 'FAULT_DESC' 또는 '3DGS'
    overall_condition CHAR(1),  -- 'S', 'A', 'B', 'C', 'D'
    price_adjustment INTEGER,  -- -50 ~ 0
    defect_summary TEXT,  -- 간단한 요약
    raw_results JSONB,  -- 전체 결과 (JSON)
    completed_at TIMESTAMP DEFAULT NOW()
);

-- 제품별 검수 조회 인덱스
CREATE INDEX idx_inspections_product_id ON product_inspections(product_id);
CREATE INDEX idx_inspections_type ON product_inspections(inspection_type);
```

## 구현 예시

### Python (FastAPI + SQLAlchemy)

```python
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

router = APIRouter(prefix="/inspect", tags=["inspection"])

@router.post("/analyze-product")
async def analyze_product(
    product_id: str,
    s3_images: List[str],
    item_category: str,
    db: Session
):
    """
    제품 이미지 일괄 분석 및 RDS 업데이트

    Args:
        product_id: 제품 ID
        s3_images: S3 이미지 경로 리스트
        item_category: 제품 카테고리
        db: DB 세션
    """
    try:
        # 1. 각 이미지 분석
        inspection_results = []
        for s3_path in s3_images:
            result = await analyze_defects(
                s3_path=s3_path,
                item_category=item_category
            )
            inspection_results.append({
                "image_path": s3_path,
                "result": result
            })

        # 2. 종합 평가 (최악의 등급 선택)
        conditions = [r["result"].overall_condition for r in inspection_results]
        aggregated_condition = max(conditions, key=lambda x: "SABCD".index(x))

        adjustments = [r["result"].recommended_price_adjustment for r in inspection_results]
        aggregated_adjustment = min(adjustments)  # 가장 큰 할인율

        # 3. DB에 결과 저장
        inspection = ProductInspection(
            product_id=product_id,
            inspection_type="FAULT_DESC",
            overall_condition=aggregated_condition,
            price_adjustment=aggregated_adjustment,
            defect_summary=f"{len([r for r in inspection_results if r['result'].defects])}개 이미지에서 결함 발견",
            raw_results=inspection_results,
            completed_at=datetime.utcnow()
        )
        db.add(inspection)

        # 4. job_count 증가
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        product.job_count += 1

        # 5. job_count가 2가 되면 제품 공개
        if product.job_count >= 2:
            product.is_visible = True
            if not product.published_at:
                product.published_at = datetime.utcnow()

        product.updated_at = datetime.utcnow()

        db.commit()

        return {
            "product_id": product_id,
            "inspection_results": inspection_results,
            "aggregated_condition": aggregated_condition,
            "aggregated_price_adjustment": aggregated_adjustment,
            "job_count": product.job_count,
            "is_visible": product.is_visible,
            "completed_at": inspection.completed_at
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")
```

## 통합 테스트

### 1. 테스트 시나리오

```bash
# 제품 초기 상태 (job_count = 0)
curl -X POST "http://localhost:8001/inspect/analyze-product" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PROD-12345",
    "s3_images": [
      "s3://ss-s3-project/products/PROD-12345/img1.jpg",
      "s3://ss-s3-project/products/PROD-12345/img2.jpg"
    ],
    "item_category": "신발"
  }'

# 응답 확인: job_count = 1, is_visible = false

# 3DGS 완료 후 (job_count = 2)
# 응답 확인: job_count = 2, is_visible = true
```

### 2. DB 상태 확인

```sql
-- 제품 상태 확인
SELECT
    product_id,
    job_count,
    is_visible,
    published_at
FROM products
WHERE product_id = 'PROD-12345';

-- 검수 이력 확인
SELECT
    inspection_type,
    overall_condition,
    price_adjustment,
    completed_at
FROM product_inspections
WHERE product_id = 'PROD-12345'
ORDER BY completed_at DESC;
```

## 에러 처리

### 1. 이미지 분석 실패

```python
try:
    result = await analyze_defects(s3_path, item_category)
except Exception as e:
    # 로그 기록
    logger.error(f"Image analysis failed: {s3_path}, error: {e}")

    # 기본값 반환 (분석 실패 표시)
    result = InspectionResult(
        defects=[],
        overall_condition="C",
        recommended_price_adjustment=-20,
        analysis_confidence=0.0,
        raw_response=f"Analysis failed: {str(e)}"
    )
```

### 2. DB 업데이트 실패

```python
try:
    db.commit()
except Exception as e:
    db.rollback()
    logger.error(f"DB update failed: {e}")
    raise HTTPException(status_code=500, detail="DB 업데이트 실패")
```

## 모니터링

### 1. 처리 상태 조회

```sql
-- job_count 분포 확인
SELECT
    job_count,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM products
GROUP BY job_count
ORDER BY job_count;

-- 결과:
-- job_count | count | percentage
-- ----------|-------|------------
--     0     |  150  |   30%       (대기 중)
--     1     |  200  |   40%       (한 작업 완료)
--     2     |  150  |   30%       (모두 완료, 공개)
```

### 2. 평균 처리 시간

```sql
SELECT
    inspection_type,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_seconds
FROM product_inspections
GROUP BY inspection_type;
```

## 성능 최적화

### 1. 배치 처리

여러 제품을 동시에 처리하는 경우:

```python
@router.post("/analyze-batch")
async def analyze_batch(products: List[ProductAnalysisRequest], db: Session):
    """여러 제품 일괄 분석"""
    tasks = [
        analyze_product(p.product_id, p.s3_images, p.item_category, db)
        for p in products
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results
```

### 2. 캐싱

동일한 이미지 재분석 방지:

```python
import hashlib
from functools import lru_cache

def get_image_hash(s3_path: str) -> str:
    """S3 경로 해시 생성"""
    return hashlib.md5(s3_path.encode()).hexdigest()

# Redis 캐싱 예시
async def analyze_with_cache(s3_path: str, item_category: str):
    cache_key = f"inspection:{get_image_hash(s3_path)}"

    # 캐시 확인
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    # 분석 수행
    result = await analyze_defects(s3_path, item_category)

    # 캐시 저장 (24시간)
    await redis.setex(cache_key, 86400, json.dumps(result.dict()))

    return result
```

## 보안

### 1. API 인증

```python
from fastapi import Depends, Header, HTTPException

async def verify_api_key(x_api_key: str = Header(...)):
    """API 키 검증"""
    if x_api_key != settings.RDS_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

@router.post("/analyze-product", dependencies=[Depends(verify_api_key)])
async def analyze_product(...):
    ...
```

### 2. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/analyze-product")
@limiter.limit("10/minute")  # 분당 10회 제한
async def analyze_product(...):
    ...
```

## 문의

- 기술 지원: 이슈 등록
- 문서 업데이트: 2025-11-01
