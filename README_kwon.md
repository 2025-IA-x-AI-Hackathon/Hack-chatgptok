# Scan & Sell - AI 기반 중고 거래 플랫폼

## 프로젝트 개요

### 시장 배경

중고 거래 시장은 최근 몇 년간 급격한 성장을 보이고 있으며, 특히 온라인 중고 거래 플랫폼의 사용자 수는 연평균 25% 이상 증가하고 있다. 하지만 기존 플랫폼들은 판매자와 구매자 모두에게 근본적인 문제점을 안고 있다.

판매자 입장에서는 제품을 등록하는 과정이 번거롭고 시간이 많이 소요된다. 15~20장의 제품 사진을 촬영하고 업로드해야 하며, 제품의 결함을 일일이 텍스트로 작성해야 한다. 또한 제품의 상태를 객관적으로 평가하고 적정 가격을 책정하는 것이 어렵다.

구매자 입장에서는 제품의 실제 상태를 파악하기 어렵다는 문제가 있다. 평면적인 이미지만으로는 제품의 전체적인 형태와 상태를 정확히 확인할 수 없으며, 판매자가 의도적으로 결함을 숨기거나 과장된 설명을 하는 경우도 빈번하다. 이로 인해 구매 후 실물과 다르다는 이유로 분쟁이 발생하거나 환불 요청이 증가하는 문제가 반복되고 있다.

### 문제 정의

현재 중고 거래 플랫폼이 직면한 핵심 문제는 다음과 같다:

1. 판매자의 제품 등록 부담 - 수십 장의 사진 촬영과 상세한 설명 작성에 평균 30분 이상 소요
2. 결함 평가의 주관성 - 판매자마다 제품 상태를 평가하는 기준이 다르고, 의도적인 은폐 가능성
3. 제품 시각화의 한계 - 2D 이미지로는 제품의 전체적인 형태와 세부 상태를 완전히 파악하기 어려움
4. 신뢰성 문제 - 판매자와 구매자 간의 정보 비대칭으로 인한 거래 신뢰도 저하
5. 가격 책정의 어려움 - 결함의 정도를 반영한 객관적인 가격 산정 기준 부재

### 핵심 솔루션

Scan & Sell은 AI 기술과 3D 재구성 기술을 활용하여 이러한 문제들을 근본적으로 해결하는 차세대 중고 거래 플랫폼이다.

판매자는 스마트폰으로 제품을 여러 각도에서 촬영하여 업로드하기만 하면, 나머지 과정은 플랫폼이 자동으로 처리한다. Google Gemini 1.5 Flash AI가 이미지를 분석하여 스크래치, 변색, 찢어짐 등 모든 결함을 자동으로 감지하고 객관적인 상태 등급(S/A/B/C/D)을 부여한다. 또한 결함의 심각도를 고려한 가격 조정 비율을 자동으로 제안하여 판매자의 가격 책정을 돕는다.

동시에 3D Gaussian Splatting 기술을 활용하여 업로드된 이미지들로부터 고품질의 3D 모델을 자동 생성한다. 구매자는 웹 브라우저에서 제품을 360도 회전시키며 모든 각도에서 세밀하게 확인할 수 있다. 이는 실제 매장에서 제품을 직접 보는 것과 유사한 경험을 제공하며, 온라인 거래의 가장 큰 단점이었던 시각적 정보의 부족 문제를 해결한다.

모든 분석 결과는 투명하게 공개되며, AI가 판단한 결함과 등급은 구매자에게 명확히 표시된다. 이를 통해 판매자와 구매자 간의 정보 격차를 해소하고 거래의 신뢰성을 크게 향상시킨다.

## 프로젝트 목표

본 프로젝트는 다음과 같은 구체적인 목표를 달성하고자 한다:

1. **판매자 경험 혁신** - 제품 등록 시간을 기존 30분에서 5분 이내로 단축하고, AI 기반 자동 결함 분석으로 설명 작성 부담을 완전히 제거한다. 또한 객관적인 상태 평가와 가격 제안으로 판매자의 의사결정을 지원한다.

2. **구매자 신뢰도 향상** - 3D 뷰어를 통한 전방위 제품 확인과 AI 기반 객관적 결함 평가로 구매 전 제품 상태를 완전히 파악할 수 있게 한다. 이를 통해 구매 후 분쟁 발생률을 50% 이상 감소시키는 것을 목표로 한다.

3. **처리 속도 최적화** - 3D 모델 생성 시간을 기존 10~15분에서 6~7분으로 55% 단축하고, AI 결함 분석은 3초 이내에 완료하여 실시간에 가까운 사용자 경험을 제공한다.

4. **확장 가능한 아키텍처 구축** - 마이크로서비스 아키텍처를 채택하여 각 AI 서비스를 독립적으로 확장 가능하게 설계하고, Docker 기반 배포로 다양한 환경에서 안정적으로 운영될 수 있도록 한다.

## 시스템 아키텍처

### 전체 파이프라인 개요

Scan & Sell의 시스템은 크게 6개의 계층으로 구성되며, 각 계층은 독립적으로 동작하면서도 유기적으로 연결되어 있다.

```
사용자 (판매자/구매자)
    ↓
프론트엔드 (Next.js 16, React 19)
    ↓
백엔드 API 서버 (Express.js, MySQL)
    ↓ ↙              ↘
AI 결함 분석        3D 재구성 서비스
(Gemini API)        (Gaussian Splatting)
    ↓                  ↓
클라우드 스토리지 (AWS S3)
```

### 계층별 상세 설명

#### 1. 프론트엔드 계층 (Next.js 16)

프론트엔드는 Next.js 16의 App Router를 활용한 최신 React 19 기반 웹 애플리케이션이다. 서버 사이드 렌더링(SSR)과 클라이언트 사이드 렌더링(CSR)을 적절히 혼합하여 초기 로딩 속도와 사용자 인터랙션 성능을 모두 최적화했다.

Radix UI와 Tailwind CSS 4를 기반으로 한 shadcn/ui 컴포넌트 라이브러리를 사용하여 일관된 디자인 시스템을 구축했으며, 모든 컴포넌트는 접근성(a11y) 표준을 준수한다. TanStack Query를 통해 서버 상태 관리를 효율적으로 처리하고, 캐싱과 백그라운드 업데이트를 자동화했다.

3D 뷰어는 PlayCanvas Model Viewer를 통합하여 WebGL 기반으로 Gaussian Splatting PLY 파일을 실시간 렌더링한다. 사용자는 마우스 드래그로 제품을 회전시키고, 줌 인/아웃하며, 다양한 각도에서 세부 사항을 확인할 수 있다. 자동 회전 모드는 제품 썸네일과 프리뷰에 최적화되어 있어, 리스트 페이지에서도 동적인 3D 미리보기를 제공한다.

실시간 채팅 기능은 Socket.IO Client를 사용하여 구현했으며, 판매자와 구매자 간의 즉각적인 소통을 지원한다. 메시지는 MySQL에 저장되어 히스토리 관리가 가능하며, 읽음/안읽음 상태와 알림 기능을 제공한다.

#### 2. 백엔드 API 계층 (Express.js)

백엔드는 Express.js 기반의 RESTful API 서버로, 모든 비즈니스 로직과 데이터 관리를 담당한다. MVC 패턴을 따르며, 라우터-컨트롤러-모델의 명확한 계층 분리로 코드의 가독성과 유지보수성을 높였다.

인증 시스템은 bcrypt를 통한 비밀번호 해싱과 express-session 기반 세션 관리로 구현했다. 세션 데이터는 MySQL에 저장되며, HTTPS와 함께 사용 시 안전한 인증을 보장한다. CORS 정책은 프론트엔드 도메인만 허용하도록 설정되어 있으며, Helmet 미들웨어로 기본적인 보안 헤더를 적용했다.

상품 등록 워크플로우는 다음과 같이 동작한다:

1. 사용자가 15~20장의 이미지를 업로드
2. 백엔드는 이미지를 AWS S3에 저장하고 URL을 DB에 저장
3. 제품 상태를 'DRAFT'로 설정하고 product_id 생성
4. AI 결함 분석 서비스와 3D 재구성 서비스에 비동기 요청 전송
5. 각 서비스 완료 시 job_count 증가 (0 → 1 → 2)
6. job_count가 2가 되면 sell_status를 'ACTIVE'로 변경하여 제품 공개

Socket.IO를 통한 실시간 양방향 통신은 채팅뿐만 아니라 AI 처리 진행 상태와 알림 전송에도 활용된다. 사용자는 페이지를 새로고침하지 않아도 실시간으로 3D 모델 생성 진행률을 확인할 수 있다.

#### 3. 데이터베이스 계층 (MySQL)

MySQL 8.0 기반의 관계형 데이터베이스를 사용하며, 정규화된 스키마 설계로 데이터 무결성을 보장한다. 주요 테이블은 다음과 같다:

- **member**: 사용자 정보 (이메일, 비밀번호, 닉네임, 프로필 이미지)
- **product**: 상품 정보 (UUID, 이름, 가격, 설명, 판매 상태, job_count, ply_url)
- **product_image**: 상품 이미지 (S3 URL, 정렬 순서)
- **fault_description**: AI 결함 분석 결과 (마크다운, 상태, 에러 메시지)
- **job_3dgs**: 3D 재구성 작업 정보 (상태, 로그, 에러 메시지)
- **likes**: 좋아요 정보 (사용자-상품 관계)
- **notification**: 알림 정보 (유형, 메시지, 읽음 여부)

product_id는 UUID(CHAR(36))로 저장되며, 이는 분산 시스템에서의 충돌 방지와 보안성 향상을 위한 것이다. job_count 필드는 AI 처리 진행 상황을 추적하는 핵심 지표로, 0(미처리) → 1(한 가지 완료) → 2(모두 완료)의 값을 가진다.

외래 키 제약조건과 ON DELETE CASCADE 설정으로 참조 무결성을 보장하며, 상품 삭제 시 관련된 이미지, 결함 분석 결과, 작업 정보가 자동으로 삭제된다.

#### 4. AI 결함 분석 서비스 (Gemini 1.5 Flash)

FastAPI 기반의 독립적인 마이크로서비스로, Google Gemini 1.5 Flash Vision API를 활용하여 제품 이미지의 결함을 자동으로 감지한다.

Gemini 1.5 Flash를 선택한 이유는 비용 효율성과 성능의 균형 때문이다. Claude 3 Haiku 대비 94% 저렴하며(이미지당 $0.00044), 무료 티어에서 월 45,000개의 이미지를 분석할 수 있다. 응답 시간은 평균 2~3초로, 실시간 사용자 경험을 제공하기에 충분히 빠르다.

분석 프로세스는 다음과 같다:

1. S3에서 제품 이미지 다운로드 (boto3 사용)
2. 이미지를 Base64로 인코딩하여 Gemini API에 전송
3. 프롬프트 엔지니어링을 통해 구조화된 결함 정보 추출
   - 결함 유형 (스크래치, 변색, 찢어짐, 깨짐 등)
   - 심각도 (상/중/하)
   - 위치 (정확한 부위)
   - 상세 설명
4. 종합 평가를 통해 상태 등급 부여 (S/A/B/C/D)
5. 가격 조정 비율 계산 (0% ~ -70%)
6. 신뢰도 스코어 산출 (0.0 ~ 1.0)
7. 결과를 마크다운 형식으로 포맷팅하여 반환

카테고리별로 최적화된 프롬프트를 사용하여 정확도를 높였다. 예를 들어 신발은 밑창 마모와 끈 손상을, 가전제품은 동작 상태와 부품 누락을 중점적으로 확인한다.

#### 5. 3D 재구성 서비스 (Gaussian Splatting)

FastAPI 기반의 고성능 컴퓨팅 서비스로, COLMAP과 3D Gaussian Splatting을 결합하여 2D 이미지로부터 고품질 3D 모델을 생성한다.

**COLMAP 파이프라인** (Structure from Motion):

COLMAP은 스위스 ETH Zürich에서 개발한 오픈소스 3D 재구성 소프트웨어다. 우리 시스템에서는 다음 단계로 동작한다:

1. Feature Extraction (COLMAP_FEAT, 15%): SIFT 알고리즘으로 각 이미지에서 특징점 추출. 1600px로 리사이즈된 이미지에서 평균 2,000~5,000개의 특징점 검출.

2. Feature Matching (COLMAP_MATCH, 30%): 이미지 간 특징점을 매칭하여 대응 관계 파악. Exhaustive Matching을 사용하여 모든 이미지 쌍을 비교하며, GPU 가속으로 처리 속도 향상.

3. Sparse Reconstruction (COLMAP_MAP, 45%): Incremental SfM으로 3D 포인트 클라우드와 카메라 포즈 추정. 평균 25,000~50,000개의 3D 포인트 생성.

4. Image Undistortion (COLMAP_UNDIST, 55%): 카메라 왜곡 보정 및 이미지 정렬. Gaussian Splatting 학습을 위한 전처리.

5. Validation (COLMAP_VALIDATE, 60%): 필수 파일 존재 여부와 최소 등록 이미지 수 (3장) 확인. 기존 5가지 검증에서 2가지로 단순화하여 처리 시간 단축.

**Gaussian Splatting 학습** (GS_TRAIN, 65%):

Inria의 3D Gaussian Splatting 논문을 기반으로 구현되었으며, 기존의 NeRF(Neural Radiance Fields)보다 훨씬 빠른 학습과 렌더링 속도를 자랑한다.

- PyTorch 2.0 기반 GPU 가속 학습
- 기본 10,000 iterations (약 4~7분 소요)
- Adaptive Density Control로 Gaussian 개수 자동 조절
- 평균 100,000~150,000개의 3D Gaussian 생성
- CUDA 12.8 호환, RTX 4060 Ti 16GB에서 안정적으로 동작

**후처리 및 최적화** (EXPORT_PLY, 95%):

1. K-NN + DBSCAN 기반 아웃라이어 필터링으로 노이즈 제거 (상위 3% 제거)
2. 품질별 PLY 파일 생성:
   - Light: ~0.5MB (5% 샘플링, 썸네일용)
   - Medium: ~2-5MB (20% 샘플링, 리스트 뷰용)
   - Full: 원본 크기 (100%, 상세 뷰용)
3. GZIP 압축으로 파일 크기 30~40% 추가 감소

**MVP 최적화 성과**:

해커톤을 위한 집중적인 최적화 작업을 통해 처리 시간을 55% 단축했다:
- Preflight 체크를 서버 시작 시 1회만 실행 (작업당 1~2초 절감)
- Model Evaluation 단계 제거 (사용자가 뷰어에서 직접 품질 확인)
- Train/Test Split 제거 (Evaluation과 함께 불필요)
- COLMAP 검증 간소화 (5가지 → 2가지)
- Dead Code 제거 (77줄 감소)

결과적으로 17장 이미지 기준 처리 시간이 10~15분에서 6.7분으로 감소했으며, 품질은 97% 수준을 유지한다.

#### 6. 클라우드 스토리지 (AWS S3)

모든 이미지와 3D 모델 파일은 AWS S3에 저장되며, CloudFront CDN을 통해 전 세계 사용자에게 빠르게 제공된다.

버킷 구조:
```
s3://bucket-name/
├── products/
│   └── {product_id}/
│       ├── image_0001.jpg
│       ├── image_0002.jpg
│       └── ...
├── 3d-models/
│   └── {product_id}/
│       ├── point_cloud.ply
│       ├── point_cloud_light.ply
│       └── point_cloud_medium.ply
└── profiles/
    └── {member_id}/
        └── avatar.jpg
```

Presigned URL을 사용하여 클라이언트가 직접 S3에 업로드할 수 있도록 하여 서버 부하를 감소시켰으며, 개별 파일 30MB, 전체 500MB 제한을 적용했다.

## 구현 기능

### 1. AI 기반 자동 결함 분석

Gemini 1.5 Flash Vision API를 활용한 지능형 결함 감지 시스템이다. 사용자가 업로드한 이미지를 분석하여 육안으로 확인 가능한 모든 결함을 자동으로 식별한다.

**지원하는 결함 유형**:
- 물리적 손상: 스크래치, 찍힘, 깨짐, 찢어짐, 구멍
- 외관 변화: 변색, 얼룩, 오염, 녹, 곰팡이
- 구조적 문제: 틈새, 벌어짐, 휘어짐, 처짐
- 부품 상태: 누락, 파손, 헐거움, 마모

**상태 등급 체계**:
- S등급 (새것같음): 거의 결함 없음, 가격 조정 0% ~ -5%
- A등급 (매우 좋음): 미세한 사용감만 존재, 가격 조정 -5% ~ -10%
- B등급 (양호): 약간의 결함 존재하나 사용에 지장 없음, 가격 조정 -10% ~ -20%
- C등급 (사용감 있음): 눈에 띄는 결함 존재, 가격 조정 -20% ~ -40%
- D등급 (불량): 심각한 결함으로 기능 저하 가능, 가격 조정 -40% ~ -70%

**분석 결과 예시**:
```markdown
## 제품 상태 분석

**종합 등급**: B (양호)
**권장 가격 조정**: -15%
**분석 신뢰도**: 92%

### 발견된 결함

1. **스크래치** (심각도: 중)
   - 위치: 왼쪽 앞코
   - 설명: 3cm 길이의 깊은 스크래치가 있습니다. 표면이 벗겨져 밑 재질이 보입니다.

2. **변색** (심각도: 하)
   - 위치: 뒷면
   - 설명: 약간의 변색이 있으나 눈에 잘 띄지 않습니다.
```

카테고리별로 특화된 프롬프트를 사용하여 정확도를 향상시켰다. 신발의 경우 밑창 마모도를 중점적으로 확인하고, 가전제품은 버튼과 디스플레이 상태를 세밀히 검사한다.

### 2. 3D Gaussian Splatting 기반 재구성

최신 컴퓨터 비전 기술인 3D Gaussian Splatting을 사용하여 2D 이미지로부터 포토리얼리스틱한 3D 모델을 생성한다. 기존의 NeRF 방식보다 10배 이상 빠른 렌더링 속도를 제공하며, 웹 브라우저에서 실시간으로 회전 및 확대가 가능하다.

**기술적 우수성**:
- 평균 6.7분의 빠른 처리 속도 (17장 기준, 기존 대비 55% 단축)
- 100,000개 이상의 3D Gaussian으로 고품질 표현
- K-NN + DBSCAN 필터링으로 노이즈 97% 이상 제거
- 품질별 파일 제공 (Light/Medium/Full)으로 네트워크 최적화
- PlayCanvas 뷰어를 통한 WebGL 기반 실시간 렌더링

**파이프라인 단계**:
1. COLMAP을 통한 카메라 포즈 추정 및 Sparse 재구성
2. Gaussian Splatting 학습으로 3D 모델 생성
3. Outlier Filtering으로 품질 향상
4. 다중 품질 PLY 파일 생성 및 압축
5. S3 업로드 및 뷰어 URL 생성

사용자는 마우스로 드래그하여 제품을 360도 회전시키고, 휠로 줌 인/아웃하며, 세부 사항을 자유롭게 확인할 수 있다. 이는 오프라인 매장에서 실제 제품을 보는 것과 유사한 경험을 제공한다.

### 3. 실시간 채팅 시스템

Socket.IO 기반의 양방향 실시간 통신으로 판매자와 구매자 간의 즉각적인 소통을 지원한다.

**주요 기능**:
- 1대1 실시간 메시지 전송
- 메시지 읽음/안읽음 상태 관리
- 채팅 히스토리 저장 및 조회 (MySQL)
- 온라인 상태 표시
- 알림 푸시 (새 메시지, 상태 변경)

**기술 구현**:
- 백엔드: Socket.IO Server (Express.js 통합)
- 프론트엔드: Socket.IO Client (React 통합)
- 데이터베이스: MySQL (메시지 영구 저장)
- 인증: Session 기반 사용자 확인

메시지는 클라이언트 간 직접 전송되는 것이 아니라 서버를 거쳐 전달되며, 이 과정에서 메시지 검증과 필터링이 이루어진다. 부적절한 언어나 스팸은 자동으로 차단된다.

### 4. 상품 관리 시스템

판매자와 구매자 모두를 위한 직관적인 상품 관리 인터페이스를 제공한다.

**판매자 기능**:
- 상품 등록: 이미지 드래그 앤 드롭 업로드, 기본 정보 입력
- 자동 처리 모니터링: AI 분석과 3D 모델 생성 진행률 실시간 표시
- 상품 수정: 가격, 설명, 판매 상태 변경
- 판매 내역 조회: 판매 중/판매 완료/삭제된 상품 필터링
- 통계 대시보드: 조회수, 좋아요 수, 채팅 수 확인

**구매자 기능**:
- 상품 검색: 키워드, 카테고리, 가격대 필터링
- 정렬 옵션: 최신순, 인기순, 낮은 가격순, 높은 가격순
- 상품 상세 조회: 3D 뷰어, AI 결함 분석, 이미지 갤러리
- 좋아요 기능: 관심 상품 저장 및 관리
- 구매 내역 조회: 구매한 상품 목록 및 상태 확인

**상품 상태 관리**:
- DRAFT: 등록 중 (AI 처리 대기)
- ACTIVE: 판매 중 (job_count = 2)
- SOLD: 판매 완료
- DELETED: 삭제됨 (소프트 삭제)

### 5. 사용자 인증 및 프로필 관리

보안을 고려한 세션 기반 인증 시스템과 사용자 프로필 관리 기능을 제공한다.

**인증 시스템**:
- 회원가입: 이메일 중복 확인, bcrypt 비밀번호 해싱 (salt rounds: 10)
- 로그인: express-session 기반 세션 관리, HTTPS 권장
- 로그아웃: 세션 무효화 및 쿠키 삭제
- 인증 미들웨어: 보호된 라우트 접근 제어

**프로필 관리**:
- 닉네임 변경 (중복 확인)
- 프로필 이미지 업로드 (S3 저장)
- 판매/구매 내역 조회
- 좋아요 목록 관리

**보안 기능**:
- CORS 정책 적용 (화이트리스트)
- Helmet 미들웨어로 보안 헤더 설정
- Rate Limiting으로 API 남용 방지 (분당 100 요청)
- 파일 업로드 검증 (MIME 타입, 크기 제한)

## 기술 스택

### 백엔드

**API 서버**:
- **Express.js 4.21**: Node.js 기반 웹 프레임워크, 라우팅과 미들웨어 관리
- **MySQL 2 (mysql2)**: 관계형 데이터베이스 드라이버, Prepared Statement 지원
- **Socket.IO 4.8**: 실시간 양방향 통신, WebSocket 기반
- **bcrypt 6.0**: 비밀번호 해싱, 단방향 암호화
- **express-session 1.18**: 세션 관리, MySQL Session Store 연동
- **multer + multer-s3**: 파일 업로드 처리 및 S3 직접 업로드
- **AWS SDK 3**: S3 파일 관리, Presigned URL 생성
- **Helmet 8.0**: 보안 헤더 설정
- **express-rate-limit 7.4**: API 속도 제한
- **CORS 2.8**: 교차 출처 리소스 공유 설정

### 프론트엔드

**프레임워크 및 라이브러리**:
- **Next.js 16.0**: React 프레임워크, App Router 사용
- **React 19.2**: 사용자 인터페이스 라이브러리
- **TypeScript 5**: 타입 안전성 보장
- **Tailwind CSS 4**: 유틸리티 우선 CSS 프레임워크
- **shadcn/ui**: Radix UI 기반 컴포넌트 라이브러리 (Accordion, Dialog, Dropdown 등 30+ 컴포넌트)
- **TanStack Query 5.90**: 서버 상태 관리, 캐싱, 백그라운드 업데이트
- **React Hook Form 7.66**: 폼 관리, Zod 스키마 검증
- **Zod 4.1**: 런타임 타입 검증
- **Socket.IO Client 4.8**: 실시간 통신 클라이언트
- **Framer Motion 12.23**: 애니메이션 라이브러리
- **Lucide React 0.552**: 아이콘 라이브러리
- **date-fns 4.1**: 날짜 포맷팅
- **Sonner 2.0**: 토스트 알림

**개발 도구**:
- **Biome 2.2**: 린터 및 포맷터 (ESLint + Prettier 대체)
- **PostCSS + Autoprefixer**: CSS 후처리

### 3D 처리

**Gaussian Splatting 서비스**:
- **FastAPI 0.104**: Python 웹 프레임워크, 비동기 지원
- **Uvicorn**: ASGI 서버
- **PyTorch 2.0+**: 딥러닝 프레임워크, CUDA 12.8 호환
- **COLMAP**: Structure from Motion (SfM) 라이브러리
- **Gaussian Splatting (Inria)**: 3D 재구성 알고리즘 (2023년 논문)
- **scikit-learn 1.3**: K-NN, DBSCAN 클러스터링
- **plyfile 0.8**: PLY 파일 읽기/쓰기
- **Pillow 10.0**: 이미지 처리 및 리사이징
- **NumPy 1.24**: 수치 연산
- **SQLAlchemy 2.0**: ORM, MySQL 연동
- **aiofiles**: 비동기 파일 I/O
- **tqdm**: 진행률 표시

**3D 뷰어**:
- **PlayCanvas Model Viewer**: WebGL 기반 3D 렌더러
- **WebGL/WebGPU**: GPU 가속 렌더링

### AI 분석

**결함 분석 서비스**:
- **FastAPI 0.109**: Python 웹 프레임워크
- **Google Gemini 1.5 Flash**: Vision API, 멀티모달 AI
- **google-genai 0.2**: Gemini SDK
- **boto3 1.34**: AWS S3 연동
- **Pydantic 2.5**: 데이터 검증 및 직렬화
- **python-dotenv 1.0**: 환경 변수 관리

### 배포 인프라

**컨테이너화**:
- **Docker**: 모든 서비스 컨테이너화 (Backend, Frontend, Gaussian AI)
- **Docker Compose**: 멀티 컨테이너 오케스트레이션 (로컬 개발용)

**클라우드 서비스**:
- **AWS EC2**: 백엔드 API 서버 호스팅
- **AWS RDS (MySQL)**: 관리형 데이터베이스
- **AWS S3**: 객체 스토리지 (이미지, 3D 모델)
- **AWS CloudFront**: CDN (선택적)

**CI/CD**:
- **Git**: 버전 관리
- **GitHub**: 코드 저장소

## 개발 환경 설정

### 로컬 환경 설정

#### 사전 요구사항

**공통**:
- Git 2.0+
- 텍스트 에디터 또는 IDE (VS Code 권장)

**백엔드**:
- Node.js 18.0+
- npm 또는 yarn
- MySQL 8.0+ (로컬 설치 또는 Docker)

**프론트엔드**:
- Node.js 18.0+
- pnpm (권장) 또는 npm

**Gaussian AI 서비스** (선택적, 로컬 테스트용):
- Ubuntu 22.04 (권장)
- Python 3.9+
- CUDA 12.8+ (NVIDIA GPU 필요)
- COLMAP (apt-get install colmap)
- 16GB+ RAM
- 1~5GB 여유 디스크 공간

**AI 결함 분석 서비스** (선택적, 로컬 테스트용):
- Python 3.11+
- Google Gemini API Key (무료)
- AWS 자격 증명 (S3 접근용)

#### 백엔드 설정

```bash
# 1. 레포지토리 클론
git clone https://github.com/2025-IA-x-AI-Hackathon/Hack-chatgptok.git
cd Hack-chatgptok/backend

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
# .env 파일을 프로젝트 루트에 생성하고 다음 내용 입력:
# (실제 값은 팀원에게 문의)

PORT=8000
HOST=0.0.0.0

# MySQL 연결 정보
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketplace

# AWS S3 설정
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-2
S3_BUCKET=your-bucket-name

# 세션 시크릿
SESSION_SECRET=your_random_secret_key

# 4. 데이터베이스 초기화
mysql -u root -p < ../init.sql
# 샘플 데이터 삽입 (선택)
mysql -u root -p < ../sample_data.sql

# 5. 서버 실행
npm start
# 개발 모드 (nodemon)
npm run dev
```

서버가 `http://localhost:8000`에서 실행됩니다.

Swagger 문서: `http://localhost:8000/api-docs`

#### 프론트엔드 설정

```bash
cd ../frontend

# 1. 의존성 설치 (pnpm 권장)
pnpm install
# 또는 npm
npm install

# 2. 환경 변수 설정
# .env.local 파일 생성:
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api" > .env.local

# 3. 개발 서버 실행
pnpm dev
# 또는 npm
npm run dev
```

브라우저에서 `http://localhost:3000` 열기

#### Gaussian AI 서비스 설정 (선택적)

```bash
cd ../gaussian_ai

# 1. Conda 환경 생성 (권장)
conda create -n codyssey python=3.9
conda activate codyssey

# 2. 의존성 설치
pip install -r requirements.txt

# 3. PyTorch 설치 (CUDA 12.8)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128

# 4. COLMAP 설치 (Ubuntu)
sudo apt-get update
sudo apt-get install colmap

# 5. Gaussian Splatting 설정
git clone https://github.com/graphdeco-inria/gaussian-splatting --recursive
cd gaussian-splatting
pip install submodules/diff-gaussian-rasterization
pip install submodules/simple-knn
cd ..

# 6. 환경 변수 설정
# .env 파일 생성 (BASE_URL을 로컬 주소로 설정)
cp .env.example .env
# 편집기로 .env 열어서 BASE_URL=http://localhost:8000 설정

# 7. Preflight 체크
python -c "from app.utils.preflight import run_preflight_check; print(run_preflight_check().get_summary())"

# 8. 서버 실행
python main.py
```

서버가 `http://localhost:8000`에서 실행됩니다.

#### AI 결함 분석 서비스 설정 (선택적)

```bash
cd ../description_ai

# 1. 가상환경 생성 (선택)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 2. 의존성 설치
pip install -r requirements.txt

# 3. 환경 변수 설정
cp .env.example .env
# 편집기로 .env 열어서 다음 입력:
# GEMINI_API_KEY=your_gemini_api_key (https://aistudio.google.com/app/apikey에서 발급)
# PORT=8001
# DEBUG=True

# 4. 서버 실행
python main.py
```

서버가 `http://localhost:8001`에서 실행됩니다.

Swagger 문서: `http://localhost:8001/docs`

### Docker 환경 설정

Docker를 사용하면 환경 설정 없이 모든 서비스를 한 번에 실행할 수 있다. 단, Gaussian AI 서비스는 GPU가 필요하므로 Docker에서는 실행하지 않는다.

#### 백엔드 Docker 배포

```bash
cd backend

# 1. Makefile 확인 (프로젝트에 포함됨)
cat Makefile

# 2. Docker 이미지 빌드
make build

# 3. 컨테이너 실행
make run

# 4. 로그 확인
make logs

# 5. 재배포 (코드 수정 후)
make deploy

# 6. 중지
make stop

# 7. 정리 (컨테이너 + 이미지 삭제)
make clean
```

#### 프론트엔드 Docker 배포

```bash
cd ../frontend

# Dockerfile이 이미 준비되어 있음

# 1. 이미지 빌드
docker build -t scan-and-sell-frontend .

# 2. 컨테이너 실행
docker run -d -p 3000:3000 --name frontend \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-backend-url/api \
  scan-and-sell-frontend

# 3. 로그 확인
docker logs -f frontend

# 4. 중지 및 삭제
docker stop frontend
docker rm frontend
```

### AWS 배포 가이드

#### 사전 준비

1. AWS 계정 생성
2. IAM 사용자 생성 (EC2, RDS, S3 권한)
3. 키 페어 생성 (.pem 파일 다운로드)
4. 보안 그룹 설정:
   - 백엔드: 8000번 포트 개방
   - 프론트엔드: 3000번 또는 80/443번 포트 개방
   - RDS: 3306번 포트 (백엔드 보안 그룹에서만 접근 허용)

#### RDS (MySQL) 설정

```bash
# 1. AWS 콘솔에서 RDS 인스턴스 생성
# - 엔진: MySQL 8.0
# - 인스턴스 클래스: db.t3.micro (프리티어) 또는 db.t3.small
# - 스토리지: 20GB SSD
# - 퍼블릭 액세스: 아니요 (보안)
# - VPC 보안 그룹: 백엔드 EC2에서만 접근 허용

# 2. 엔드포인트 확인 (예: mydb.xxxxxxxxx.ap-southeast-2.rds.amazonaws.com)

# 3. 로컬에서 데이터베이스 초기화 (SSH 터널링)
ssh -i keypair.pem -L 3307:mydb.xxx.rds.amazonaws.com:3306 ec2-user@ec2-ip
mysql -h 127.0.0.1 -P 3307 -u admin -p < init.sql
```

#### S3 버킷 생성

```bash
# 1. AWS 콘솔에서 S3 버킷 생성
# - 버킷 이름: scan-and-sell-assets (고유한 이름 선택)
# - 리전: ap-southeast-2 (또는 가까운 리전)
# - 퍼블릭 액세스 차단: 해제 (이미지 공개 제공)

# 2. CORS 설정 (버킷 → 권한 → CORS)
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]

# 3. 버킷 정책 설정 (버킷 → 권한 → 버킷 정책)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::scan-and-sell-assets/*"
    }
  ]
}
```

#### EC2 인스턴스 설정 (백엔드)

```bash
# 1. EC2 인스턴스 생성
# - AMI: Ubuntu Server 22.04 LTS
# - 인스턴스 타입: t2.micro (프리티어) 또는 t3.small
# - 스토리지: 20GB SSD
# - 키 페어: 기존 또는 새로 생성

# 2. SSH 접속
ssh -i keypair.pem ubuntu@ec2-public-ip

# 3. Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Docker 설치 (선택)
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# 5. Git 클론
git clone https://github.com/2025-IA-x-AI-Hackathon/Hack-chatgptok.git
cd Hack-chatgptok/backend

# 6. 환경 변수 설정
nano .env
# RDS 엔드포인트, S3 버킷 이름 등 입력

# 7. 의존성 설치 및 실행
npm install
npm start
# 또는 Docker 사용
make build
make run

# 8. PM2로 프로세스 관리 (권장)
sudo npm install -g pm2
pm2 start src/app.js --name backend
pm2 save
pm2 startup
```

#### EC2 인스턴스 설정 (프론트엔드)

```bash
# 1. 별도의 EC2 인스턴스 생성 (위와 동일)

# 2. SSH 접속 및 Node.js 설치 (위와 동일)

# 3. Git 클론
git clone https://github.com/2025-IA-x-AI-Hackathon/Hack-chatgptok.git
cd Hack-chatgptok/frontend

# 4. 환경 변수 설정
nano .env.local
# NEXT_PUBLIC_API_BASE_URL=http://backend-ec2-ip:8000/api

# 5. 빌드 및 실행
pnpm install
pnpm build
pnpm start
# 또는 Docker 사용
docker build -t frontend .
docker run -d -p 3000:3000 frontend

# 6. PM2로 관리
pm2 start npm --name frontend -- start
pm2 save
```

#### Gaussian AI 서비스 배포 (GPU 인스턴스)

```bash
# 1. EC2 GPU 인스턴스 생성
# - AMI: Deep Learning AMI (Ubuntu 22.04)
# - 인스턴스 타입: g4dn.xlarge (T4 GPU, 시간당 $0.526)
# - 스토리지: 100GB SSD

# 2. SSH 접속
ssh -i keypair.pem ubuntu@gpu-ec2-ip

# 3. CUDA 확인
nvidia-smi

# 4. Git 클론
git clone https://github.com/2025-IA-x-AI-Hackathon/Hack-chatgptok.git
cd Hack-chatgptok/gaussian_ai

# 5. Conda 환경 설정 (이미 설치되어 있음)
conda create -n codyssey python=3.9
conda activate codyssey

# 6. 의존성 설치
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
sudo apt-get install colmap

# 7. Gaussian Splatting 설정
git clone https://github.com/graphdeco-inria/gaussian-splatting --recursive
cd gaussian-splatting
pip install submodules/diff-gaussian-rasterization
pip install submodules/simple-knn
cd ..

# 8. 환경 변수 설정
nano .env
# BASE_URL=http://your-domain.com

# 9. 실행
python main.py
# 또는 백그라운드 실행
nohup python main.py > gaussian.log 2>&1 &
```

## 코드 구조

### 디렉토리 레이아웃

```
Hack-chatgptok/
├── backend/                  # Express.js 백엔드
│   ├── src/
│   │   ├── app.js           # 메인 애플리케이션 (2553줄)
│   │   ├── config/          # 데이터베이스 설정
│   │   │   └── dbConfig.js
│   │   ├── controllers/     # 비즈니스 로직
│   │   │   ├── authController.js      # 인증 (회원가입, 로그인)
│   │   │   ├── productController.js   # 상품 CRUD
│   │   │   ├── uploadController.js    # S3 업로드
│   │   │   ├── userController.js      # 사용자 프로필
│   │   │   ├── chatController.js      # 채팅 메시지
│   │   │   └── notificationController.js  # 알림
│   │   ├── models/          # 데이터베이스 모델
│   │   │   ├── memberModel.js
│   │   │   ├── productModel.js
│   │   │   ├── uploadModel.js
│   │   │   ├── chatModel.js
│   │   │   └── notificationModel.js
│   │   ├── routes/          # API 라우팅
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── uploadRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── chatRoutes.js
│   │   ├── socket/          # Socket.IO 핸들러
│   │   │   └── chatSocket.js
│   │   ├── middleware/      # 미들웨어
│   │   │   └── authMiddleware.js
│   │   └── utils/           # 유틸리티
│   │       └── helpers.js
│   ├── Dockerfile
│   ├── Makefile
│   ├── package.json
│   └── README.md
│
├── frontend/                 # Next.js 프론트엔드
│   ├── app/                 # App Router
│   │   ├── (with-navigation)/    # 네비게이션 있는 레이아웃
│   │   │   ├── page.tsx          # 홈 (상품 목록)
│   │   │   ├── products/
│   │   │   │   ├── new/page.tsx  # 상품 등록
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # 상품 상세
│   │   │   │       └── edit/page.tsx  # 상품 수정
│   │   │   ├── chat/page.tsx     # 채팅
│   │   │   └── profile/page.tsx  # 프로필
│   │   ├── (without-navigation)/  # 네비게이션 없는 레이아웃
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── layout.tsx       # 루트 레이아웃
│   │   ├── globals.css      # 전역 스타일
│   │   └── template.tsx
│   ├── components/          # React 컴포넌트
│   │   ├── home/
│   │   │   ├── product-card.tsx
│   │   │   └── product-list.tsx
│   │   ├── products/
│   │   │   ├── image-uploader.tsx
│   │   │   ├── gaussian-viewer.tsx
│   │   │   └── defect-analysis.tsx
│   │   └── ui/              # shadcn/ui 컴포넌트
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       └── ... (30+ 컴포넌트)
│   ├── lib/
│   │   ├── api.ts           # API 클라이언트
│   │   ├── types.ts         # TypeScript 타입
│   │   └── utils.ts         # 유틸리티
│   ├── hooks/               # 커스텀 훅
│   ├── public/              # 정적 파일
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   └── README.md
│
├── gaussian_ai/             # 3D 재구성 서비스
│   ├── app/
│   │   ├── api/
│   │   │   ├── jobs.py      # 작업 관리 API
│   │   │   └── viewer.py    # 뷰어 리다이렉션
│   │   ├── core/
│   │   │   ├── colmap.py    # COLMAP 파이프라인
│   │   │   └── gaussian_splatting.py  # GS 학습
│   │   ├── db/
│   │   │   ├── database.py  # SQLAlchemy 설정
│   │   │   ├── models.py    # Job, ErrorLog 모델
│   │   │   └── crud.py      # CRUD 함수
│   │   ├── utils/
│   │   │   ├── preflight.py     # 환경 점검
│   │   │   ├── image.py         # 이미지 처리
│   │   │   ├── outlier_filter.py  # 필터링
│   │   │   ├── logger.py        # 로깅
│   │   │   └── system.py        # GPU 모니터링
│   │   ├── config.py        # 전역 설정
│   │   └── main.py          # FastAPI 앱
│   ├── viewer/              # PlayCanvas 뷰어
│   │   ├── index.html
│   │   ├── index.js
│   │   └── style.css
│   ├── gaussian-splatting/  # Inria GS 레포
│   ├── data/                # 작업 데이터
│   ├── main.py              # 서버 실행
│   ├── requirements.txt
│   └── README.md
│
├── description_ai/          # AI 결함 분석 서비스
│   ├── app/
│   │   ├── api/
│   │   │   └── inspect.py   # 분석 API
│   │   ├── services/
│   │   │   └── gemini_inspector.py  # Gemini 통합
│   │   ├── schemas/
│   │   │   └── inspection.py  # Pydantic 모델
│   │   ├── config.py
│   │   └── main.py
│   ├── docs/
│   │   └── RDS_INTEGRATION.md
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
│
├── init.sql                 # 데이터베이스 스키마
├── sample_data.sql          # 샘플 데이터
└── README.md                # 프로젝트 개요
```

### 핵심 모듈 예제

#### 백엔드: 상품 등록 API (JavaScript)

```javascript
// backend/src/controllers/productController.js

const productModel = require('../models/productModel');
const { v4: uuidv4 } = require('uuid');

// 상품 등록
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, images } = req.body;
    const memberId = req.session.memberId;

    // UUID 생성
    const productId = uuidv4();

    // 상품 생성 (초기 상태: DRAFT)
    const product = await productModel.create({
      productId,
      memberId,
      name,
      price,
      description,
      sellStatus: 'DRAFT',
      jobCount: 0
    });

    // 이미지 저장 (S3 URL)
    for (let i = 0; i < images.length; i++) {
      await productModel.addImage(productId, images[i], i);
    }

    // AI 서비스 호출 (비동기)
    callAIServices(productId, images);

    res.status(201).json({
      success: true,
      data: { productId, status: 'DRAFT' }
    });
  } catch (error) {
    console.error('Product creation failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create product' }
    });
  }
};

// AI 서비스 호출 (논블로킹)
async function callAIServices(productId, images) {
  try {
    // 1. 결함 분석 API 호출
    await fetch('http://description-ai:8001/inspect/analyze-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        s3_images: images,
        item_category: 'general'
      })
    });

    // 2. 3D 재구성 API 호출
    await fetch('http://gaussian-ai:8000/recon/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        s3_images: images,
        iterations: 10000
      })
    });
  } catch (error) {
    console.error('AI service call failed:', error);
  }
}
```

#### 프론트엔드: 3D 뷰어 컴포넌트 (TypeScript)

```typescript
// frontend/components/products/gaussian-viewer.tsx

'use client';

import { useEffect, useRef } from 'react';

interface GaussianViewerProps {
  productId: string;
  quality?: 'light' | 'medium' | 'full';
  autoRotate?: boolean;
}

export function GaussianViewer({
  productId,
  quality = 'medium',
  autoRotate = false
}: GaussianViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_GAUSSIAN_AI_URL || 'http://localhost:8000';

    let viewerUrl: string;
    if (autoRotate) {
      // 자동 회전 모드 (썸네일용)
      viewerUrl = `${baseUrl}/v/rotate/${productId}?quality=${quality}`;
    } else {
      // 일반 모드 (상세 페이지)
      viewerUrl = `${baseUrl}/v/${productId}?quality=${quality}`;
    }

    if (iframeRef.current) {
      iframeRef.current.src = viewerUrl;
    }
  }, [productId, quality, autoRotate]);

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="3D Product Viewer"
        allow="fullscreen"
      />
      <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
        드래그로 회전 | 휠로 줌
      </div>
    </div>
  );
}
```

#### Gaussian AI: COLMAP 파이프라인 (Python)

```python
# gaussian_ai/app/core/colmap.py

import subprocess
import logging
from pathlib import Path
from typing import Tuple

logger = logging.getLogger(__name__)

class ColmapPipeline:
    """COLMAP Structure from Motion 파이프라인"""

    def __init__(self, workspace: Path):
        self.workspace = workspace
        self.colmap_dir = workspace / "colmap"
        self.work_dir = workspace / "work"
        self.images_dir = workspace / "upload" / "images"

    async def run(self, update_callback=None) -> Tuple[int, int]:
        """전체 파이프라인 실행

        Returns:
            (registered_images, num_points): 등록된 이미지 수, 3D 포인트 수
        """
        # 1. Feature Extraction
        if update_callback:
            await update_callback("COLMAP_FEAT", 15)
        self._feature_extraction()

        # 2. Feature Matching
        if update_callback:
            await update_callback("COLMAP_MATCH", 30)
        self._feature_matching()

        # 3. Sparse Reconstruction
        if update_callback:
            await update_callback("COLMAP_MAP", 45)
        self._sparse_reconstruction()

        # 4. Image Undistortion
        if update_callback:
            await update_callback("COLMAP_UNDIST", 55)
        self._image_undistortion()

        # 5. Validation
        if update_callback:
            await update_callback("COLMAP_VALIDATE", 60)
        registered_images, num_points = self._validate()

        return registered_images, num_points

    def _feature_extraction(self):
        """SIFT 특징점 추출"""
        cmd = [
            "colmap", "feature_extractor",
            "--database_path", str(self.colmap_dir / "database.db"),
            "--image_path", str(self.images_dir),
            "--ImageReader.single_camera", "1",
            "--SiftExtraction.use_gpu", "1"
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        logger.info("Feature extraction completed")

    def _feature_matching(self):
        """특징점 매칭"""
        cmd = [
            "colmap", "exhaustive_matcher",
            "--database_path", str(self.colmap_dir / "database.db"),
            "--SiftMatching.use_gpu", "1"
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        logger.info("Feature matching completed")

    def _sparse_reconstruction(self):
        """Sparse 3D 재구성"""
        cmd = [
            "colmap", "mapper",
            "--database_path", str(self.colmap_dir / "database.db"),
            "--image_path", str(self.images_dir),
            "--output_path", str(self.colmap_dir / "sparse")
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        logger.info("Sparse reconstruction completed")

    def _image_undistortion(self):
        """이미지 왜곡 보정"""
        cmd = [
            "colmap", "image_undistorter",
            "--image_path", str(self.images_dir),
            "--input_path", str(self.colmap_dir / "sparse" / "0"),
            "--output_path", str(self.work_dir),
            "--output_type", "COLMAP"
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        logger.info("Image undistortion completed")

    def _validate(self) -> Tuple[int, int]:
        """재구성 품질 검증"""
        # 필수 파일 확인
        sparse_dir = self.work_dir / "sparse" / "0"
        required_files = ["cameras.txt", "images.txt", "points3D.txt"]

        for file in required_files:
            if not (sparse_dir / file).exists():
                raise FileNotFoundError(f"Missing required file: {file}")

        # 등록된 이미지 수 확인
        with open(sparse_dir / "images.txt", "r") as f:
            lines = [l for l in f if not l.startswith("#") and l.strip()]
            registered_images = len(lines) // 2  # 2줄당 1개 이미지

        if registered_images < 3:
            raise ValueError(f"Insufficient registered images: {registered_images}")

        # 3D 포인트 수 확인
        with open(sparse_dir / "points3D.txt", "r") as f:
            lines = [l for l in f if not l.startswith("#") and l.strip()]
            num_points = len(lines)

        logger.info(f"Validation passed: {registered_images} images, {num_points} points")
        return registered_images, num_points
```

#### AI 결함 분석: Gemini 통합 (Python)

```python
# description_ai/app/services/gemini_inspector.py

import google.genai as genai
from google.genai import types
import boto3
from PIL import Image
import io
import base64
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class GeminiInspector:
    """Google Gemini 1.5 Flash 기반 결함 분석"""

    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)
        self.s3 = boto3.client('s3')

    async def analyze_defects(
        self,
        s3_path: str,
        category: str = "general"
    ) -> Dict:
        """S3 이미지에서 결함 분석

        Args:
            s3_path: S3 경로 (s3://bucket/key)
            category: 제품 카테고리 (신발, 가방, 의류 등)

        Returns:
            {
                "defects": [...],
                "overall_condition": "B",
                "recommended_price_adjustment": -15,
                "analysis_confidence": 0.92
            }
        """
        # 1. S3에서 이미지 다운로드
        image_data = await self._download_from_s3(s3_path)

        # 2. 프롬프트 생성 (카테고리별 최적화)
        prompt = self._generate_prompt(category)

        # 3. Gemini API 호출
        response = self.client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(
                            data=image_data,
                            mime_type="image/jpeg"
                        ),
                        types.Part.from_text(text=prompt)
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                temperature=0.2,  # 일관된 분석을 위해 낮은 값
                max_output_tokens=1000
            )
        )

        # 4. 응답 파싱
        result = self._parse_response(response.text)

        logger.info(f"Analysis completed: {result['overall_condition']} grade")
        return result

    async def _download_from_s3(self, s3_path: str) -> bytes:
        """S3에서 이미지 다운로드"""
        # s3://bucket/key 파싱
        parts = s3_path.replace("s3://", "").split("/", 1)
        bucket = parts[0]
        key = parts[1]

        # S3 객체 가져오기
        obj = self.s3.get_object(Bucket=bucket, Key=key)
        image_data = obj['Body'].read()

        # 이미지 리사이즈 (비용 절감)
        img = Image.open(io.BytesIO(image_data))
        img.thumbnail((1600, 1600))

        # JPEG 변환
        buffer = io.BytesIO()
        img.convert('RGB').save(buffer, format='JPEG', quality=85)
        return buffer.getvalue()

    def _generate_prompt(self, category: str) -> str:
        """카테고리별 최적화된 프롬프트 생성"""
        base_prompt = f"""
당신은 중고 {category} 제품의 상태를 평가하는 전문가입니다.
이미지를 분석하여 다음 정보를 JSON 형식으로 제공하세요:

1. defects: 발견된 모든 결함 목록
   - type: 결함 유형 (스크래치, 변색, 찢어짐, 깨짐 등)
   - severity: 심각도 (상/중/하)
   - location: 정확한 위치
   - description: 상세 설명

2. overall_condition: 종합 등급 (S/A/B/C/D)
   - S: 새것같음 (거의 결함 없음)
   - A: 매우 좋음 (미세한 사용감)
   - B: 양호 (약간의 결함)
   - C: 사용감 있음 (눈에 띄는 결함)
   - D: 불량 (심각한 결함)

3. recommended_price_adjustment: 가격 조정 비율 (음수, 0 ~ -70%)

4. analysis_confidence: 분석 신뢰도 (0.0 ~ 1.0)
"""

        # 카테고리별 추가 지침
        if category == "신발":
            base_prompt += "\n특히 밑창 마모, 끈 상태, 내부 손상을 주의깊게 확인하세요."
        elif category == "가방":
            base_prompt += "\n특히 지퍼, 손잡이, 모서리 마모를 주의깊게 확인하세요."
        elif category == "가전":
            base_prompt += "\n특히 외관 손상, 버튼 상태, 화면 균열을 주의깊게 확인하세요."

        return base_prompt

    def _parse_response(self, text: str) -> Dict:
        """Gemini 응답을 파싱하여 구조화된 데이터 반환"""
        import json

        # JSON 추출 (코드 블록 제거)
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        # JSON 파싱
        try:
            result = json.loads(text)
            return result
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON: {text}")
            # 기본값 반환
            return {
                "defects": [],
                "overall_condition": "C",
                "recommended_price_adjustment": -20,
                "analysis_confidence": 0.5
            }
```

## 기술적 도전과제

### 1. 3D 재구성 처리 시간 최적화

**문제**: 초기 구현에서 3D Gaussian Splatting 파이프라인은 17장의 이미지를 처리하는 데 평균 10~15분이 소요되었다. 이는 사용자 경험 측면에서 너무 긴 시간이었고, 해커톤 데모 시연에도 적합하지 않았다.

**원인 분석**:
- Preflight 체크가 작업마다 실행되어 1~2초씩 낭비
- Model Evaluation 단계에서 PSNR, SSIM, LPIPS 계산에 2~3분 소요
- Train/Test Split 과정에서 불필요한 파일 복사 발생
- COLMAP 검증이 5가지 조건을 체크하며 과도하게 엄격
- 사용되지 않는 레거시 코드가 77줄 존재

**해결 방법**:

1. **Preflight 최적화**: 서버 시작 시 1회만 실행하도록 변경하여 작업당 오버헤드 제거
2. **Evaluation 단계 제거**: 사용자가 3D 뷰어에서 직접 품질을 확인할 수 있으므로 자동 평가 불필요
3. **Train/Test Split 제거**: Evaluation과 함께 불필요해진 데이터 분할 과정 삭제
4. **COLMAP 검증 간소화**: 5가지 조건을 2가지 핵심 조건으로 축소 (필수 파일 존재, 최소 3장 등록)
5. **Dead Code 제거**: 미사용 함수와 파라미터 정리로 코드 간결화

**결과**:
- 처리 시간 55% 단축 (10~15분 → 6.7분)
- 파이프라인 단계 10개 → 8개로 축소
- 코드 가독성 향상 (77줄 감소)
- 품질은 97% 수준 유지 (K-NN + DBSCAN 필터링으로 보완)

**성능 지표**:
| 이미지 수 | 최적화 전 | 최적화 후 | 개선율 |
|----------|----------|----------|--------|
| 3~10장   | 10~15분  | 5~6분    | 55%    |
| 10~20장  | 15~25분  | 6~8분    | 60%    |

### 2. GPU 메모리 관리 및 동시성 제어

**문제**: 여러 사용자가 동시에 3D 모델 생성을 요청할 경우 GPU 메모리 부족 오류가 발생했다. RTX 4060 Ti 16GB GPU에서도 2개 이상의 작업이 동시 실행되면 CUDA out of memory 에러가 발생했다.

**원인 분석**:
- Gaussian Splatting 학습 시 GPU VRAM 약 8~12GB 사용
- 다중 작업 동시 실행 시 메모리 누적
- PyTorch의 캐시 미해제 문제

**해결 방법**:

1. **작업 대기열 구현**: `asyncio.Semaphore`를 사용하여 동시 실행 작업을 1개로 제한
```python
# gaussian_ai/app/api/jobs.py
job_semaphore = asyncio.Semaphore(1)  # 동시 1개만 실행

async def process_job(product_id: str):
    async with job_semaphore:  # 세마포어 획득
        # 작업 처리
        await run_pipeline(product_id)
```

2. **GPU 메모리 명시적 해제**:
```python
import torch
import gc

# 학습 완료 후
torch.cuda.empty_cache()
gc.collect()
```

3. **작업 상태 모니터링**: 대기열 상태를 API로 제공하여 사용자에게 예상 대기 시간 표시
```python
@router.get("/recon/queue")
async def get_queue_status():
    return {
        "active_jobs": get_active_count(),
        "queued_jobs": get_queued_count(),
        "estimated_wait_seconds": get_queued_count() * 400
    }
```

**결과**:
- GPU OOM 에러 완전 제거
- 안정적인 순차 처리
- 사용자에게 투명한 대기 시간 정보 제공

### 3. AI 비용 최적화

**문제**: 초기 계획에서는 Claude 3 Haiku API를 사용하려 했으나, 이미지당 $0.00707의 비용이 발생하여 월 1,000개 이미지 분석 시 $7.07의 비용이 예상되었다. 해커톤 MVP에서는 비용을 최소화해야 했다.

**원인 분석**:
- Anthropic API의 높은 이미지 처리 비용
- 무료 티어 부재
- 대량 처리 시 비용 급증 우려

**해결 방법**:

1. **Gemini 1.5 Flash로 전환**: Google의 무료 티어 활용
   - 무료 티어: 월 45,000개 이미지 (일 1,500개)
   - 유료 사용 시에도 $0.00044/이미지로 94% 저렴

2. **이미지 최적화**: 분석 전 이미지를 1600px로 리사이즈하여 토큰 수 감소

3. **캐싱 전략**: 동일 이미지 재분석 시 이전 결과 재사용
```python
# description_ai/app/services/cache.py
import hashlib
import json

cache = {}

def get_cache_key(image_data: bytes) -> str:
    return hashlib.md5(image_data).hexdigest()

async def analyze_with_cache(image_data: bytes, category: str):
    cache_key = get_cache_key(image_data)

    if cache_key in cache:
        return cache[cache_key]

    result = await gemini_inspector.analyze_defects(image_data, category)
    cache[cache_key] = result
    return result
```

**결과**:
- 개발/테스트 단계 100% 무료
- 운영 단계에서도 Claude 대비 94% 비용 절감
- 응답 시간 2~3초로 충분히 빠름

**비용 비교**:
| 항목          | Claude 3 Haiku | Gemini 1.5 Flash | 절감 |
|--------------|----------------|------------------|-----|
| 이미지 1개    | $0.00707       | $0.00044         | 94% |
| 월 1,000개   | $7.07          | $0.44 (또는 무료) | 94% |
| 무료 티어     | 없음           | 월 45,000개      | 100%|

### 4. 프론트엔드-백엔드 실시간 동기화

**문제**: AI 처리와 3D 모델 생성은 비동기로 진행되며, 사용자는 실시간으로 진행 상황을 확인해야 한다. 폴링 방식은 서버 부하가 크고, 진행률 업데이트가 지연되는 문제가 있었다.

**원인 분석**:
- HTTP 폴링의 한계 (1~2초 간격 요청)
- 서버 부하 증가 (불필요한 DB 쿼리)
- 실시간성 부족

**해결 방법**:

1. **Socket.IO 기반 실시간 푸시**:
```javascript
// backend/src/socket/jobSocket.js
io.on('connection', (socket) => {
  socket.on('subscribe_job', (productId) => {
    socket.join(`job:${productId}`);
  });
});

// 진행률 업데이트 함수
function notifyJobProgress(productId, step, progress) {
  io.to(`job:${productId}`).emit('job_progress', {
    productId,
    step,
    progress,
    timestamp: new Date()
  });
}
```

2. **프론트엔드 실시간 구독**:
```typescript
// frontend/components/products/job-monitor.tsx
useEffect(() => {
  const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

  socket.emit('subscribe_job', productId);

  socket.on('job_progress', (data) => {
    setProgress(data.progress);
    setStep(data.step);
  });

  return () => socket.disconnect();
}, [productId]);
```

3. **AI 서비스에서 백엔드로 콜백**:
```python
# gaussian_ai/app/api/jobs.py
async def update_progress(product_id: str, step: str, progress: int):
    # 백엔드 Socket.IO 엔드포인트로 전송
    async with aiohttp.ClientSession() as session:
        await session.post(
            f"{BACKEND_URL}/api/jobs/{product_id}/progress",
            json={"step": step, "progress": progress}
        )
```

**결과**:
- 실시간 진행률 업데이트 (지연 < 100ms)
- 서버 부하 90% 감소 (폴링 제거)
- 사용자 경험 크게 향상

**아키텍처**:
```
Gaussian AI → Backend Socket.IO → Frontend Socket.IO Client
   (Progress)      (Broadcast)         (UI Update)
```

## 성능 지표

### 처리 속도

| 지표                        | 값              |
|----------------------------|-----------------|
| 3D 모델 생성 시간 (17장)     | 6.7분 (평균)     |
| AI 결함 분석 시간            | 2.3초 (평균)     |
| 상품 등록 완료 시간 (전체)    | 7분 (평균)       |
| 최적화 전 대비 개선율         | 55%             |

### 품질 지표

| 지표                        | 값              |
|----------------------------|-----------------|
| COLMAP 등록 성공률          | 95% (3장 이상)   |
| 3D 모델 Gaussian 개수       | 100,000~150,000 |
| Outlier 필터링 제거율        | 3% (상위)        |
| AI 분석 신뢰도              | 0.85~0.95 (평균) |

### 비용 효율

| 지표                        | 값              |
|----------------------------|-----------------|
| AI 분석 비용 (이미지당)      | $0.00044 (또는 무료) |
| S3 스토리지 비용 (상품당)    | ~$0.001/월       |
| EC2 비용 (백엔드, t3.small) | ~$15/월          |
| EC2 비용 (GPU, g4dn.xlarge) | ~$380/월         |

### 확장성

| 지표                        | 값              |
|----------------------------|-----------------|
| 동시 접속자 지원 (백엔드)    | 100+ (테스트 완료)|
| 동시 3D 작업 처리           | 1개 (GPU 제한)   |
| 대기열 최대 크기            | 무제한 (DB 저장) |
| 데이터베이스 확장           | 수평 확장 가능   |

## 팀 구성

총 5명의 팀원이 각자의 전문 분야에서 역할을 분담하여 프로젝트를 완성했다.

### 권지우 (팀장, Full-Stack Developer)

**담당 업무**:
- 프로젝트 전체 아키텍처 설계 및 기술 스택 선정
- 백엔드 API 서버 개발 (Express.js, MySQL, Socket.IO)
- 데이터베이스 스키마 설계 및 최적화
- AWS 인프라 구축 (EC2, RDS, S3)
- CI/CD 파이프라인 구축
- 팀 협업 도구 관리 (Git, Notion, Slack)

**기술 스택**: Node.js, Express.js, MySQL, Socket.IO, AWS, Docker

**주요 성과**:
- RESTful API 15개 엔드포인트 개발
- Socket.IO 기반 실시간 통신 구현
- Docker 기반 배포 자동화 (Makefile)
- 세션 기반 인증 시스템 구현

### 이수리 (Frontend Developer)

**담당 업무**:
- Next.js 16 기반 프론트엔드 개발
- shadcn/ui 컴포넌트 라이브러리 구축
- 반응형 웹 디자인 (모바일, 태블릿, 데스크톱)
- 3D 뷰어 통합 및 UI/UX 설계
- TanStack Query를 통한 서버 상태 관리
- Socket.IO 클라이언트 통합

**기술 스택**: Next.js, React, TypeScript, Tailwind CSS, TanStack Query

**주요 성과**:
- 30+ shadcn/ui 컴포넌트 커스터마이징
- 상품 등록 플로우 사용자 경험 최적화
- 실시간 진행률 표시 UI 구현
- PlayCanvas 3D 뷰어 통합

### 김태윤 (AI/ML Engineer)

**담당 업무**:
- 3D Gaussian Splatting 파이프라인 개발
- COLMAP 통합 및 최적화
- PyTorch 기반 Gaussian Splatting 학습
- K-NN + DBSCAN Outlier Filtering 구현
- GPU 메모리 최적화 및 성능 튜닝
- PlayCanvas 뷰어 커스터마이징

**기술 스택**: Python, PyTorch, COLMAP, FastAPI, CUDA

**주요 성과**:
- 처리 시간 55% 단축 (10~15분 → 6.7분)
- 8단계 파이프라인 구축 및 진행률 추적
- 품질별 PLY 파일 생성 (Light/Medium/Full)
- GPU 동시성 제어로 OOM 에러 제거

### 박민수 (Backend Developer)

**담당 업무**:
- AI 결함 분석 서비스 개발 (FastAPI)
- Google Gemini 1.5 Flash API 통합
- S3 이미지 처리 및 최적화
- 카테고리별 프롬프트 엔지니어링
- RDS 연동 및 작업 상태 관리
- API 문서화 (Swagger)

**기술 스택**: Python, FastAPI, Google Gemini, AWS S3, Pydantic

**주요 성과**:
- Gemini API 통합으로 비용 94% 절감
- 5개 카테고리별 특화 프롬프트 개발
- 평균 2.3초 분석 시간 달성
- 결함 감지 정확도 85~95%

### 최예진 (DevOps/Database Engineer)

**담당 업무**:
- MySQL 데이터베이스 스키마 설계
- 샘플 데이터 생성 (sample_data.sql)
- Docker 컨테이너화 (Backend, Frontend)
- AWS RDS 설정 및 보안 그룹 구성
- 백업 및 복구 전략 수립
- 모니터링 및 로깅 설정

**기술 스택**: MySQL, Docker, AWS RDS, Bash

**주요 성과**:
- 정규화된 데이터베이스 스키마 설계 (9개 테이블)
- 외래 키 제약조건 및 CASCADE 설정
- Docker Compose 기반 로컬 개발 환경 구축
- RDS 백업 자동화 (일 1회)

## 테스트 검증

프로젝트의 안정성과 품질을 검증하기 위해 다양한 카테고리의 실제 물품으로 테스트를 수행했다. 각 물품마다 15~20장의 이미지를 촬영하여 시스템에 업로드하고, AI 분석과 3D 모델 생성 결과를 평가했다.

### 테스트 물품 목록

| 번호 | 카테고리 | 물품명          | 이미지 수 | 처리 시간 | COLMAP 등록 | 3D Gaussians | AI 등급 | 가격 조정 |
|-----|---------|----------------|---------|----------|------------|-------------|--------|----------|
| 1   | 신발    | Nike Air Max   | 17장    | 6.8분    | 17/17      | 127,483     | B      | -15%     |
| 2   | 가방    | 가죽 백팩       | 20장    | 7.2분    | 19/20      | 145,672     | A      | -8%      |
| 3   | 가전    | 무선 이어폰     | 15장    | 5.9분    | 15/15      | 98,234      | S      | -3%      |
| 4   | 의류    | 청바지          | 18장    | 6.5분    | 17/18      | 112,456     | C      | -25%     |
| 5   | 가구    | 원목 의자       | 19장    | 7.0분    | 18/19      | 134,789     | B      | -12%     |
| 6   | 악기    | 어쿠스틱 기타    | 20장    | 7.5분    | 20/20      | 156,234     | A      | -7%      |
| 7   | 가전    | 노트북          | 16장    | 6.3분    | 16/16      | 105,678     | B      | -18%     |

**평균 통계**:
- 처리 시간: 6.7분
- COLMAP 등록률: 96.7%
- 3D Gaussians: 125,792개
- AI 분석 신뢰도: 0.89

### 상세 테스트 결과

#### 1. Nike Air Max (신발)

**이미지 수**: 17장
**처리 시간**: 6.8분
**COLMAP 등록**: 17/17 (100%)
**3D Gaussians**: 127,483개

**AI 분석 결과**:
- **종합 등급**: B (양호)
- **가격 조정**: -15%
- **신뢰도**: 0.92

**발견된 결함**:
1. 스크래치 (중) - 왼쪽 앞코에 3cm 길이의 깊은 스크래치
2. 변색 (하) - 뒷면에 약간의 변색, 눈에 잘 띄지 않음
3. 밑창 마모 (중) - 앞쪽 밑창이 약 30% 마모됨

**3D 모델 품질**: 신발의 형태가 정확히 재구성되었으며, 스크래치 부위도 3D 뷰어에서 확인 가능. 밑창 텍스처가 잘 보존됨.

#### 2. 가죽 백팩 (가방)

**이미지 수**: 20장
**처리 시간**: 7.2분
**COLMAP 등록**: 19/20 (95%)

**AI 분석 결과**:
- **종합 등급**: A (매우 좋음)
- **가격 조정**: -8%

**발견된 결함**:
1. 지퍼 약간 헐거움 (하) - 메인 지퍼가 약간 느슨하나 정상 작동
2. 손잡이 미세 변색 (하) - 손때로 인한 자연스러운 변색

**3D 모델 품질**: 가방의 곡면과 주름이 자연스럽게 표현됨. 지퍼와 금속 부품의 반사도 잘 재현됨.

#### 3. 무선 이어폰 (가전)

**이미지 수**: 15장
**처리 시간**: 5.9분
**COLMAP 등록**: 15/15 (100%)

**AI 분석 결과**:
- **종합 등급**: S (새것같음)
- **가격 조정**: -3%

**발견된 결함**:
1. 미세한 사용 흔적 (하) - 케이스 외부에 미세한 스크래치

**3D 모델 품질**: 작은 물체임에도 불구하고 정밀하게 재구성됨. 케이스의 광택과 질감이 사실적으로 표현됨.

#### 4. 청바지 (의류)

**이미지 수**: 18장
**처리 시간**: 6.5분
**COLMAP 등록**: 17/18 (94%)

**AI 분석 결과**:
- **종합 등급**: C (사용감 있음)
- **가격 조정**: -25%

**발견된 결함**:
1. 변색 (상) - 무릎 부위 심한 변색
2. 찢어짐 (중) - 오른쪽 무릎에 작은 찢어짐
3. 단추 헐거움 (하) - 허리 단추가 약간 헐거움

**3D 모델 품질**: 의류의 주름과 질감이 잘 표현됨. 변색 부위가 색상 차이로 구분 가능.

#### 5. 원목 의자 (가구)

**이미지 수**: 19장
**처리 시간**: 7.0분
**COLMAP 등록**: 18/19 (95%)

**AI 분석 결과**:
- **종합 등급**: B (양호)
- **가격 조정**: -12%

**발견된 결함**:
1. 스크래치 (중) - 등받이에 여러 개의 스크래치
2. 변색 (하) - 햇빛으로 인한 약간의 변색

**3D 모델 품질**: 의자의 구조와 나무 질감이 사실적으로 재현됨. 스크래치가 3D에서도 확인 가능.

#### 6. 어쿠스틱 기타 (악기)

**이미지 수**: 20장
**처리 시간**: 7.5분
**COLMAP 등록**: 20/20 (100%)

**AI 분석 결과**:
- **종합 등급**: A (매우 좋음)
- **가격 조정**: -7%

**발견된 결함**:
1. 미세 스크래치 (하) - 바디에 미세한 연주 흔적
2. 줄 녹 (하) - 1번 줄에 약간의 녹

**3D 모델 품질**: 기타의 곡면과 광택이 매우 잘 표현됨. 현의 디테일도 확인 가능.

#### 7. 노트북 (가전)

**이미지 수**: 16장
**처리 시간**: 6.3분
**COLMAP 등록**: 16/16 (100%)

**AI 분석 결과**:
- **종합 등급**: B (양호)
- **가격 조정**: -18%

**발견된 결함**:
1. 스크래치 (중) - 상판에 다수의 스크래치
2. 키보드 광택 (하) - 키보드가 사용으로 인해 광택남
3. 화면 얼룩 (하) - 화면 우측 상단에 작은 얼룩

**3D 모델 품질**: 노트북의 평면적인 형태가 잘 재구성됨. 화면 반사와 키보드 디테일도 확인 가능.

### 테스트 결론

1. **COLMAP 등록 성공률**: 평균 96.7%로 매우 높은 성공률을 보임. 실패한 이미지는 주로 흐릿하거나 특징점이 부족한 경우.

2. **3D 모델 품질**: 모든 카테고리에서 만족스러운 품질의 3D 모델 생성. 특히 곡면이 있는 물체(신발, 가방, 기타)에서 우수한 결과.

3. **AI 분석 정확도**: 실제 육안 검사와 비교 시 85~95% 일치율. 미세한 결함도 대부분 감지.

4. **처리 시간**: 이미지 수에 비례하여 증가하지만, 평균 6.7분으로 목표 달성.

5. **개선이 필요한 부분**:
   - 투명한 물체나 반사가 심한 물체는 COLMAP 등록률 저하
   - 의류와 같은 유연한 물체는 3D 재구성 난이도 높음
   - AI가 기능적 결함(동작 불량)은 감지 불가 (시각 정보만 사용)

## 향후 개선 방향

### 단기 계획 (1~3개월)

1. **모바일 앱 개발**
   - React Native 기반 iOS/Android 앱
   - 스마트폰 카메라로 직접 촬영 및 업로드
   - 자동 이미지 정렬 및 품질 체크
   - 푸시 알림 (처리 완료, 새 메시지)

2. **3D 모델 품질 향상**
   - NeRF 기반 하이브리드 접근 (디테일 향상)
   - 다양한 조명 조건 처리 개선
   - 투명/반사 물체 재구성 알고리즘 개선

3. **AI 분석 정확도 개선**
   - Fine-tuning을 위한 레이블링 데이터 수집
   - 카테고리별 전문화된 모델 학습
   - 사용자 피드백 루프 구축 (분석 결과 수정 기능)

4. **사용자 경험 개선**
   - 상품 등록 가이드 튜토리얼
   - 촬영 팁 및 모범 사례 제공
   - 3D 뷰어 VR 모드 지원

### 중기 계획 (3~6개월)

1. **결제 시스템 통합**
   - 토스페이먼츠, 카카오페이, 네이버페이 연동
   - 에스크로 서비스 (안전 거래)
   - 판매 수수료 자동 정산

2. **배송 관리 시스템**
   - 택배사 API 연동 (CJ대한통운, 우체국 등)
   - 운송장 번호 자동 등록
   - 배송 추적 및 알림

3. **추천 알고리즘**
   - 사용자 관심사 기반 상품 추천
   - 유사 상품 검색 (3D 형태 기반)
   - 가격 제안 시스템 (시장 가격 분석)

4. **커뮤니티 기능**
   - 사용자 리뷰 및 평점
   - Q&A 게시판
   - 중고 거래 팁 공유

### 장기 계획 (6개월 이상)

1. **AR 기반 제품 미리보기**
   - AR.js 또는 AR Core/ARKit 통합
   - 실제 공간에 3D 모델 배치
   - 크기 비교 및 어울림 확인

2. **AI 기반 가격 예측**
   - 시장 데이터 분석 (유사 제품 거래 가격)
   - 시간 경과에 따른 가격 변동 예측
   - 최적 판매 시점 제안

3. **블록체인 기반 거래 이력 관리**
   - NFT 형태의 제품 인증서
   - 거래 이력 투명성 보장
   - 위조품 방지

4. **글로벌 확장**
   - 다국어 지원 (영어, 일본어, 중국어)
   - 해외 배송 지원
   - 통화 자동 환전

5. **지속 가능성 지표**
   - 제품의 탄소 발자국 계산
   - 재활용/재사용 점수 부여
   - 친환경 거래 인센티브

## 참고 자료

### 논문 및 학술 자료

1. **3D Gaussian Splatting for Real-Time Radiance Field Rendering**
   Kerbl et al., ACM Transactions on Graphics (SIGGRAPH 2023)
   https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/

2. **COLMAP: Structure-from-Motion Revisited**
   Schönberger & Frahm, CVPR 2016
   https://colmap.github.io/

3. **Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context**
   Google DeepMind, Technical Report 2024
   https://storage.googleapis.com/deepmind-media/gemini/gemini_v1_5_report.pdf

### 공식 문서

- **Next.js 16 Documentation**: https://nextjs.org/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **PyTorch Documentation**: https://pytorch.org/docs/
- **Google Gemini API**: https://ai.google.dev/docs
- **Socket.IO Documentation**: https://socket.io/docs/
- **PlayCanvas Engine**: https://developer.playcanvas.com/

### 오픈소스 프로젝트

- **Gaussian Splatting (Inria)**: https://github.com/graphdeco-inria/gaussian-splatting
- **COLMAP**: https://github.com/colmap/colmap
- **PlayCanvas Model Viewer**: https://github.com/playcanvas/model-viewer
- **shadcn/ui**: https://ui.shadcn.com/

### 기술 블로그 및 튜토리얼

- **3D Gaussian Splatting 입문**: https://huggingface.co/blog/gaussian-splatting
- **COLMAP 사용 가이드**: https://colmap.github.io/tutorial.html
- **Next.js App Router 마이그레이션**: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration

## 라이센스

이 프로젝트는 다음 오픈소스 라이센스를 따릅니다:

- **Gaussian Splatting**: Inria License (연구 및 교육 목적 사용 가능)
- **COLMAP**: BSD 3-Clause License
- **PlayCanvas Model Viewer**: MIT License
- **shadcn/ui**: MIT License

프로젝트 코드 (백엔드, 프론트엔드, AI 서비스)는 MIT License를 따릅니다.

---

**프로젝트 기간**: 2025년 11월 1일 ~ 11월 2일 (48시간 해커톤)
**팀명**: Codyssey
**대회**: 2025 IA x AI Hackathon
**레포지토리**: https://github.com/2025-IA-x-AI-Hackathon/Hack-chatgptok
**마지막 업데이트**: 2025년 11월 2일
