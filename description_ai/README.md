# Fault Detection API

중고 물품 결함 자동 분석 API using Google Gemini 1.5 Flash

## 개요

S3에 저장된 중고 물품 이미지를 분석하여 결함(스크래치, 변색, 찢어짐 등)을 자동으로 감지하고, 상태 등급과 가격 조정 비율을 제안하는 서비스입니다.

## 주요 기능

- 📸 S3 이미지 자동 분석
- 🔍 Gemini 1.5 Flash Vision을 통한 결함 감지
- 📊 상태 등급 평가 (S/A/B/C/D)
- 💰 가격 조정 비율 자동 제안
- 🎯 신뢰도 스코어 제공
- 💸 무료 티어: 월 1,500개 이미지 분석

## 기술 스택

- **AI Model**: Google Gemini 1.5 Flash (Claude 3 Haiku 대비 16배 저렴)
- **Framework**: FastAPI
- **Cloud**: AWS S3
- **Language**: Python 3.11+

## 설치 방법

### 1. 환경 설정

```bash
# 가상환경 생성 (선택)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# 패키지 설치
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 편집:

```env
# Google Gemini API (무료 티어: 월 1,500개)
# API 키 발급: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# AWS Credentials (optional, 기본 ~/.aws/credentials 사용)
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_DEFAULT_REGION=ap-southeast-2

# Server Configuration
HOST=0.0.0.0
PORT=8001
DEBUG=True
```

## 사용 방법

### 서버 시작

```bash
python main.py
```

서버가 `http://localhost:8001`에서 시작됩니다.

### API 문서

서버 시작 후 다음 URL에서 자동 생성된 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

### API 예시

#### 1. 결함 분석

```bash
curl -X POST "http://localhost:8001/inspect/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "s3_path": "s3://ss-s3-project/images/shoe.jpg",
    "item_category": "신발"
  }'
```

**응답 예시:**

```json
{
  "defects": [
    {
      "type": "스크래치",
      "severity": "중",
      "location": "왼쪽 앞코",
      "description": "3cm 길이의 깊은 스크래치가 있습니다"
    },
    {
      "type": "변색",
      "severity": "하",
      "location": "뒷면",
      "description": "약간의 변색이 있으나 눈에 잘 띄지 않습니다"
    }
  ],
  "overall_condition": "B",
  "recommended_price_adjustment": -15,
  "analysis_confidence": 0.92
}
```

#### 2. 헬스 체크

```bash
curl http://localhost:8001/inspect/health
```

## RDS 연동

FAULT_DESC 서비스는 RDS와 연동하여 제품 결함 분석 결과를 저장하고 `job_count`를 관리합니다.

### 워크플로우

```
RDS → FAULT_DESC API → 결함 분석 → job_count 업데이트 → 제품 공개
```

- **job_count = 0**: 초기 상태 (처리 전)
- **job_count = 1**: 한 가지 서비스 완료 (FAULT_DESC 또는 3DGS)
- **job_count = 2**: 두 서비스 모두 완료 → 제품 공개 가능

### API 예시

```bash
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
```

**자세한 내용:** [RDS Integration Guide](docs/RDS_INTEGRATION.md)

## 지원 카테고리

| 카테고리 | 주요 결함 유형 |
|---------|---------------|
| **신발** | 스크래치, 변색, 찢어짐, 밑창 마모, 끈 손상 |
| **가방** | 스크래치, 변색, 찢어짐, 지퍼 불량, 손잡이 손상 |
| **의류** | 얼룩, 변색, 찢어짐, 단추 떨어짐, 주름 |
| **가전** | 스크래치, 깨짐, 변색, 오염, 부품 누락 |
| **가구** | 스크래치, 찍힘, 변색, 못 튀어나옴, 틈새 |

## 상태 등급

| 등급 | 설명 | 가격 조정 |
|------|------|----------|
| **S** | 새것같음 (거의 결함 없음) | 0% ~ -5% |
| **A** | 매우 좋음 (미세한 사용감) | -5% ~ -10% |
| **B** | 양호 (약간의 결함) | -10% ~ -20% |
| **C** | 사용감 있음 (눈에 띄는 결함) | -20% ~ -40% |
| **D** | 불량 (심각한 결함) | -40% ~ -70% |

## Python 코드 예시

```python
from app.services.gemini_inspector import analyze_defects
import asyncio

# S3 이미지 분석 (비동기)
async def main():
    result = await analyze_defects(
        s3_path="s3://my-bucket/images/shoe.jpg",
        item_category="신발"
    )

    print(f"전체 상태: {result.overall_condition}")
    print(f"가격 조정: {result.recommended_price_adjustment}%")

    for defect in result.defects:
        print(f"- {defect.type} ({defect.severity}): {defect.description}")

asyncio.run(main())
```

## 비용

**Gemini 1.5 Flash 무료 티어:**
- 하루 1,500 요청 (RPD)
- 분당 15 요청 (RPM)
- 월 약 45,000개 무료 분석 가능 🎉

**유료 사용 시 (무료 티어 초과):**
- 입력: $0.15 / 1M tokens
- 출력: $0.60 / 1M tokens

**예상 비용 비교:**

| 항목 | Gemini 1.5 Flash | Claude 3 Haiku | 절감 |
|------|-----------------|----------------|-----|
| 이미지 1개 | $0.00044 | $0.00707 | **94%** |
| 월 200개 (개발) | **$0.09** (또는 무료) | $1.41 | **94%** |
| 월 1,000개 | **$0.44** | $7.07 | **94%** |

**결론**: Gemini는 Claude 대비 **16배 저렴**, 무료 티어 활용 시 **100% 무료**!

## 프로젝트 구조

```
FAULT_DESC/
├── app/
│   ├── __init__.py
│   ├── config.py              # 설정
│   ├── main.py                # FastAPI 앱
│   ├── api/
│   │   ├── __init__.py
│   │   └── inspect.py         # API 엔드포인트
│   ├── services/
│   │   ├── __init__.py
│   │   └── claude_inspector.py # Claude 분석 서비스
│   └── schemas/
│       ├── __init__.py
│       └── inspection.py      # Pydantic 모델
├── docs/
│   └── RDS_INTEGRATION.md     # RDS 연동 가이드
├── main.py                    # 서버 실행
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## 문제 해결

### 1. "Gemini API key is required"

**원인:** API 키가 설정되지 않음

**해결:**
```bash
# 1. Google AI Studio에서 API 키 발급
# https://aistudio.google.com/app/apikey

# 2. .env 파일에 API 키 추가
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. "NoSuchKey: The specified key does not exist"

**원인:** S3 경로가 잘못되었거나 권한 없음

**해결:**
- S3 경로 확인
- AWS 자격 증명 확인
- S3 버킷 권한 확인

### 3. "No module named 'google.genai'"

**원인:** 패키지가 설치되지 않음

**해결:**
```bash
pip install -r requirements.txt
# 또는
pip install google-genai
```

### 4. Rate Limit 오류 (429)

**원인:** 무료 티어 한도 초과 (분당 15 요청)

**해결:**
- 요청 간격 조정 (분당 15개 이하)
- 배치 처리 시 지연 추가
- 유료 플랜 고려 (더 높은 RPM)

## 개발

### 테스트 실행

```bash
# TODO: 테스트 추가
pytest tests/
```

### 코드 포맷팅

```bash
black app/
isort app/
```

## 라이센스

MIT License

## 문의

문제가 있거나 기능 요청이 있으시면 이슈를 등록해주세요.

---

**마지막 업데이트:** 2025-11-01
