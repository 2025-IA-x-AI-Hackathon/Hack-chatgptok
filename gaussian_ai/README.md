# Gaussian AI - 3D Reconstruction Service

**중고 거래 플랫폼을 위한 자동 3D 모델 생성 API**

이 서비스는 사용자가 업로드한 제품 이미지를 3D Gaussian Splatting으로 자동 변환하여, 웹 브라우저에서 360도 회전 가능한 3D 모델을 제공합니다.

## 목차

- [주요 기능](#주요-기능)
- [MVP 최적화 개요](#mvp-최적화-개요)
- [시스템 요구사항](#시스템-요구사항)
- [빠른 시작](#빠른-시작)
- [프로젝트 구조](#프로젝트-구조)
- [API 사용법](#api-사용법)
- [파이프라인 단계](#파이프라인-단계)
- [3D 뷰어](#3d-뷰어)
- [문제 해결](#문제-해결)
- [기술 스택](#기술-스택)

## 주요 기능

### 핵심 기능 (MVP)
- **자동 3D 재구성**: 3~20장의 이미지로 고품질 3D 모델 생성
- **단계별 진행률 추적**: 8단계 파이프라인 실시간 모니터링 (0-100%)
- **PlayCanvas 3D 뷰어**: 공식 Model Viewer로 Gaussian Splatting PLY 실시간 렌더링
- **빠른 처리**: 평균 6-7분 (17장 기준), 최적화 전 대비 55% 단축
- **품질 보장**: K-NN + DBSCAN 기반 아웃라이어 필터링으로 노이즈 제거

### 검증 및 안정성
- **Preflight 체크**: 서버 시작 시 1회만 실행 (Python, CUDA, COLMAP 검증)
- **업로드 검증**: 파일 크기(개별 30MB, 전체 500MB), MIME 타입, 이미지 개수
- **작업 대기열**: asyncio.Semaphore 기반 순차 처리 (GPU 메모리 및 포트 충돌 방지)
- **간소화된 COLMAP 검증**: 2가지 필수 조건만 체크 (등록 이미지 3장 이상, 필수 파일 존재)
- **Health Check**: `/healthz` 엔드포인트 (Kubernetes/Docker 표준)

## MVP 최적화 개요

해커톤 MVP를 위해 핵심 기능에 집중하고 불필요한 단계를 제거하여 처리 시간을 크게 개선했습니다.

### 최적화 결과

| 지표 | 최적화 전 | 최적화 후 | 개선율 |
|------|-----------|-----------|--------|
| **처리 시간** (17장 기준) | 10-15분 | 6.7분 | **55% 단축** |
| **파이프라인 단계** | 10단계 | 8단계 | 2단계 제거 |
| **Preflight 오버헤드** | 작업당 1-2초 | 서버 시작 시 1회 | 작업당 0초 |
| **이미지 리사이즈** | 1600px | 1600px | 품질 유지 |
| **Training Iterations** | 10000 (기본) | 10000 (기본) | - |
| **Gaussian 품질** | - | 97% 유지 (3% 노이즈 제거) | 필터링 적용 |

### 제거된 기능
- **Model Evaluation** (PSNR, SSIM, LPIPS) - 사용자가 3D 뷰어에서 직접 품질 확인
- **Train/Test Split** - Evaluation 제거로 불필요
- **Job별 Preflight Check** - 서버 시작 시 1회만 실행
- **COLMAP 검증 단순화** - 5가지 → 2가지 필수 조건만 (필수 파일 존재, 최소 3장)
- **Dead Code 제거** - 미사용 함수 및 파라미터 정리 (77줄 감소)



## 시스템 요구사항

- **OS**: Ubuntu 22.04 (권장)
- **Python**: 3.9+
- **GPU**: CUDA 지원 GPU (12.8+ 권장, RTX 4060 Ti 16GB 검증 완료)
- **디스크**: 작업당 약 1-5GB 여유 공간
- **RAM**: 최소 16GB 권장
- **Node.js**: 18.0+ (PlayCanvas 뷰어 빌드용, 선택사항)

## 빠른 시작

```bash
# 1. 레포지토리 클론
git clone <repository-url>
cd Hack-chatgptok/gaussian_ai

# 2. Conda 환경 생성 및 활성화
conda create -n codyssey python=3.9
conda activate codyssey

# 3. 의존성 설치
pip install -r requirements.txt

# 4. COLMAP 설치 (Ubuntu)
sudo apt-get update
sudo apt-get install colmap

# 5. Gaussian Splatting 설정
git clone https://github.com/graphdeco-inria/gaussian-splatting --recursive
cd gaussian-splatting
pip install submodules/diff-gaussian-rasterization
pip install submodules/simple-knn
cd ..

# 6. Preflight 체크 (선택)
python -c "from app.utils.preflight import run_preflight_check; print(run_preflight_check().get_summary())"

# 7. 서버 실행
python main.py
```

서버가 `http://0.0.0.0:8000`에서 실행됩니다.

## 프로젝트 구조

```
gaussian_ai/
├── app/                          # FastAPI 애플리케이션
│   ├── api/                      # API 엔드포인트
│   │   ├── jobs.py              # 작업 관리 + 파이프라인 오케스트레이션
│   │   └── viewer.py            # 3D 뷰어 리다이렉션
│   │
│   ├── core/                     # 핵심 처리 로직
│   │   ├── colmap.py            # COLMAP 파이프라인 + train/test split
│   │   └── gaussian_splatting.py # GS 학습 + 평가 파이프라인
│   │
│   ├── db/                       # 데이터베이스
│   │   ├── models.py            # Job, ErrorLog 모델 (메트릭 포함)
│   │   ├── crud.py              # CRUD 함수
│   │   └── database.py          # SQLAlchemy 설정
│   │
│   ├── utils/                    # 유틸리티
│   │   ├── preflight.py         # 환경 사전 점검
│   │   ├── image.py             # 이미지 검증/저장
│   │   ├── outlier_filter.py   # Point cloud 필터링
│   │   ├── logger.py            # 로깅 설정
│   │   └── system.py            # GPU 모니터링
│   │
│   ├── config.py                 # 전역 설정 (모든 환경 변수 관리)
│   └── main.py                   # FastAPI 진입점
│
├── viewer/                       # PlayCanvas Model Viewer
│   ├── index.html               # 뷰어 진입점
│   ├── index.js                 # 뷰어 로직 (번들)
│   ├── style.css                # 뷰어 스타일
│   ├── auto-rotate.js           # 자동 회전 스크립트
│   ├── clean-ui.css             # 최소화된 UI 스타일
│   ├── fonts.css                # 폰트 정의
│   └── static/                  # 아이콘, skybox, 라이브러리
│
├── gaussian-splatting/          # Gaussian Splatting 레포지토리
├── data/                        # 작업 데이터 저장소
│   ├── jobs.db                 # SQLite 데이터베이스 (작업 메타데이터)
│   └── jobs/                   # 작업별 디렉토리
├── static/                      # 정적 파일 (데모 HTML)
│   ├── auto-rotate-demo.html  # 자동 회전 데모
│   ├── debug-viewer.html      # 디버그 뷰어
│   └── test-auto-rotate.html  # 자동 회전 테스트
├── templates/                   # Jinja2 템플릿 (비어있음, 향후 확장용)
├── docs/                        # 문서 (비어있음)
├── migrations/                  # 데이터베이스 마이그레이션
│   └── remove_metrics.py       # 메트릭 제거 마이그레이션
├── scripts/                     # 유틸리티 스크립트
│   └── generate_lightweight_ply.py  # 경량 PLY 생성 스크립트
├── main.py                       # 서버 실행 파일
└── requirements.txt             # Python 의존성
```

### 작업 디렉토리 구조

각 작업은 `data/jobs/{job_id}/` 디렉토리에 저장됩니다:

```
data/jobs/{job_id}/
├── upload/images/              # 업로드된 원본 이미지
│
├── colmap/                     # COLMAP 처리 결과
│   ├── database.db            # COLMAP SQLite DB
│   └── sparse/0/              # Sparse 재구성 (binary)
│
├── work/                       # COLMAP 출력 (GS 입력)
│   ├── images/                # Undistorted 이미지
│   ├── sparse/0/              # txt 형식 카메라/포인트
│   ├── train.txt              # Train set 목록 (80%)
│   ├── test.txt               # Test set 목록 (20%)
│   └── stereo/                # Dense 재구성 (depth maps)
│
├── output/                     # Gaussian Splatting 출력
│   ├── cameras.json
│   ├── cfg_args               # 훈련 설정
│   ├── input.ply              # 초기 point cloud
│   ├── results.json           # 평가 메트릭
│   ├── exposure.json          # 노출 설정 (평가용)
│   ├── per_view.json          # View별 메트릭
│   ├── point_cloud/iteration_10000/
│   │   ├── point_cloud.ply    # 훈련된 Gaussians
│   │   └── point_cloud_filtered.ply  # Outlier 제거 후
│   └── test/ours_10000/       # 평가 결과
│       ├── renders/           # 렌더링된 test 이미지
│       └── gt/                # Ground truth 이미지
│
└── logs/
    └── process.log            # 작업 전체 로그
```

## API 사용법

### 엔드포인트 목록

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | API 정보 및 버전 |
| GET | `/healthz` | Health check (k8s/Docker 표준) |
| POST | `/recon/jobs` | 새 작업 생성 (이미지 업로드) |
| GET | `/recon/jobs/{job_id}/status` | 작업 상태 조회 (step, progress, metrics 포함) |
| GET | `/recon/queue` | 대기열 상태 조회 |
| GET | `/recon/pub/{pub_key}/cloud.ply` | PLY 파일 다운로드 (GZIP 압축) |
| GET | `/recon/pub/{pub_key}/scene.splat` | Splat 파일 다운로드 (deprecated) |
| GET | `/v/{pub_key}` | 3D 뷰어 (일반 모드) |
| GET | `/v/rotate/{pub_key}` | 3D 뷰어 (자동 회전 모드, 썸네일/프리뷰용) |
| GET | `/viewer/` | PlayCanvas Model Viewer 직접 접근 |

### 1. 작업 생성

```bash
curl -X POST http://localhost:8000/recon/jobs \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg" \
  -F "original_resolution=false" \
  -F "iterations=10000"
```

**파라미터**:
- `files`: 이미지 파일 (3~50장, 개별 30MB, 전체 500MB 제한)
- `original_resolution`: 원본 해상도 사용 여부 (기본: false, 1600px로 리사이즈)
- `iterations`: 학습 반복 횟수 (선택, 기본: 10000, 권장: 7000~30000)

**응답:**
```json
{
  "job_id": "6giVuAVu",
  "pub_key": "tmb5Wy5OM9",
  "original_resolution": false
}
```

### 2. 작업 상태 확인

```bash
curl http://localhost:8000/recon/jobs/6giVuAVu/status | jq
```

**응답 예시 (완료 시, MVP 최적화 후):**
```json
{
  "job_id": "6giVuAVu",
  "status": "COMPLETED",
  "step": "DONE",
  "progress": 100,
  "image_count": 17,
  "iterations": 7000,
  "processing_time_seconds": 404.2,
  "colmap_registered_images": 17,
  "colmap_points": 25463,
  "viewer_url": "http://localhost:8000/v/tmb5Wy5OM9",
  "log_tail": [
    ">> Outlier filtering complete!",
    ">> Compressed point_cloud.ply: 6.2MB → 2.8MB (54.8% reduction)",
    ">> Compressed point_cloud_filtered.ply: 6.0MB → 2.7MB (55.0% reduction)"
  ],
  "created_at": "2025-10-26T04:02:09.599000",
  "completed_at": "2025-10-26T04:09:54.258000"
}
```


### 3. 3D 뷰어 접근

```bash
# 방법 1: Public key로 일반 뷰어 (사용자 상호작용 가능)
http://localhost:8000/v/tmb5Wy5OM9

# 방법 2: 자동 회전 뷰어 (썸네일/프리뷰용, 입력 비활성화)
http://localhost:8000/v/rotate/tmb5Wy5OM9

# 방법 3: 직접 PLY 파일 URL 전달
http://localhost:8000/viewer/?load=http://localhost:8000/recon/pub/tmb5Wy5OM9/cloud.ply
```

**자동 회전 모드 특징**:
- 120°/s 속도로 논스톱 회전
- 마우스/터치 입력 비활성화
- 제품 썸네일 및 프리뷰에 최적화
- COLMAP 첫 번째 이미지 기준 180° 회전 카메라 위치

### 4. Health Check

```bash
# Kubernetes/Docker liveness probe
curl http://localhost:8000/healthz
# 응답: "ok"
```

## 파이프라인 단계

전체 파이프라인은 8단계로 구성되며, 각 단계마다 progress가 업데이트됩니다 (MVP 최적화 완료):

| Step | Progress | 설명 | 소요 시간 (예상) | 변경 사항 |
|------|----------|------|-----------------|-----------|
| **QUEUED** | 0% | 대기열 대기 | - | - |
| **COLMAP_FEAT** | 15% | 특징점 추출 (SIFT) | 30초 ~ 1분 | Preflight 제거 |
| **COLMAP_MATCH** | 30% | 특징점 매칭 | 30초 ~ 1분 | - |
| **COLMAP_MAP** | 45% | Sparse 3D 재구성 | 1~2분 | - |
| **COLMAP_UNDIST** | 55% | 이미지 왜곡 보정 | 30초 ~ 1분 | Train/test split 제거 |
| **COLMAP_VALIDATE** | 60% | 재구성 품질 검증 (간소화: 2가지만) | < 1초 | 5가지 → 2가지 |
| **GS_TRAIN** | 65% | Gaussian Splatting 학습 (10000 iterations 기본) | 4~7분 | - |
| **EXPORT_PLY** | 95% | Outlier filtering (노이즈 제거) + GZIP 압축 | 10~30초 | Evaluation 제거 |
| **DONE** | 100% | 완료 | - | - |
| **ERROR** | 0% | 오류 발생 | - | - |

**평균 처리 시간 (MVP 최적화 후, iterations=10000 기본값)**:
- 이미지 3-10장: 약 **5-6분** (기존 10-15분 대비 55% 단축)
- 이미지 10-20장: 약 **6-8분** (기존 15-25분 대비 60% 단축)
- iterations=7000 사용 시 약 1-2분 추가 단축 가능

**제거된 단계**:
- ~~PREFLIGHT~~ → 서버 시작 시 1회만 실행
- ~~EVALUATION~~ → 사용자가 뷰어에서 직접 품질 확인

## 3D 뷰어

### PlayCanvas Model Viewer

공식 PlayCanvas Model Viewer를 사용하여 Gaussian Splatting 결과를 웹에서 실시간으로 확인할 수 있습니다.

**주요 기능**:
- ✅ Gaussian Splatting PLY 파일 네이티브 지원
- ✅ glTF 2.0 형식도 지원
- ✅ WebGL 및 WebGPU 렌더링
- ✅ 직관적인 카메라 컨트롤 (Orbit/Fly 모드)
- ✅ 다양한 스카이박스 프리셋
- ✅ 드래그 앤 드롭으로 추가 모델 로드 가능
- ✅ 라이팅 및 환경 설정

**접근 방법**:
1. **Public key 사용**: `/v/{pub_key}` - 자동으로 PLY 파일 로드
2. **직접 URL**: `/viewer/?load={ply_url}` - 수동으로 파일 URL 지정
3. **드래그 앤 드롭**: 뷰어에 직접 PLY/glTF 파일 드래그

**컨트롤**:
- 좌클릭 + 드래그: 카메라 회전
- 우클릭 + 드래그: 카메라 이동 (Pan)
- 마우스 휠: 줌 인/아웃
- F 키: 모델에 카메라 포커스

**뷰어 설정**:
- 상단 툴바에서 Orbit/Fly 모드 전환
- 스카이박스 변경 (17개 프리셋)
- 라이팅 강도 조절
- 배경 이미지 업로드 (HDR, PNG, JPG)


## 문제 해결

### 1. 서버 시작 실패 (Preflight 실패)

**증상**: 서버가 시작 시 Preflight 체크 오류로 종료됨

**확인**:
```bash
# 수동으로 Preflight 체크 실행
python -c "from app.utils.preflight import run_preflight_check; print(run_preflight_check().get_summary())"
```

**일반적인 원인**:
- CUDA 미설치 또는 인식 불가
- COLMAP 미설치
- Gaussian Splatting 디렉토리 없음
- 파일시스템 쓰기 권한 없음

**해결**:
```bash
# CUDA 확인
nvidia-smi

# COLMAP 설치
sudo apt-get install colmap

# Gaussian Splatting 클론
git clone https://github.com/graphdeco-inria/gaussian-splatting --recursive

# 디렉토리 권한 확인
chmod -R 755 data/
```

**MVP 변경사항**: Preflight 체크는 이제 작업별로 실행되지 않고 서버 시작 시 1회만 실행됩니다.

### 2. COLMAP 실패

**증상**: COLMAP_MAP 단계에서 실패

**원인**:
- 이미지 품질 부족
- 특징점 부족 (흐린 이미지, 단순한 표면)
- 중복 이미지 또는 각도 변화 부족
- 이미지 개수 부족 (<3장)

**해결**:
- 다양한 각도의 고해상도 이미지 사용 (최소 640x480)
- 최소 3장 이상의 이미지 업로드
- 텍스처가 풍부한 물체 촬영

### 2-1. COLMAP 품질 검증 실패

**증상**: COLMAP_VALIDATE 단계에서 실패

**검증 기준** (2가지만):
- 필수 파일 존재 (cameras.txt, images.txt, points3D.txt)
- 최소 등록 이미지 3장 이상

**해결 방법**: COLMAP 로그 확인, 이미지 품질 개선, 텍스처가 풍부한 물체 촬영

### 3. GPU 메모리 부족

**증상**: `CUDA out of memory` 에러

**해결**:
```bash
# 1. GPU 메모리 확인
nvidia-smi

# 2. 기존 프로세스 종료
lsof -ti:8000 | xargs kill -9

# 3. 설정 조정 (app/config.py 파일)
# TRAINING_ITERATIONS을 7000으로 감소 (기본값 10000)
```

### 4. PLY 파일 없음

**확인**:
```bash
# PLY 파일 확인 (iterations에 따라 경로가 다름)
ls -lh data/jobs/{job_id}/output/point_cloud/iteration_*/

# 로그 확인
tail -f data/jobs/{job_id}/logs/process.log

# 디스크 공간 확인
df -h
```

### 5. 포트 충돌

**증상**: `Address already in use`

**해결**:
```bash
# 기존 프로세스 종료
lsof -ti:8000 | xargs kill -9

# 또는 포트 변경 (app/config.py)
# PORT 환경변수 설정: export PORT=8001
```

### 6. 뷰어가 로드되지 않음

**확인**:
```bash
# 1. PLY 파일 존재 확인
ls -la data/jobs/{job_id}/output/point_cloud/iteration_*/

# 2. viewer 디렉토리 확인
ls -la viewer/

# 3. PLY 파일 직접 접근 테스트
curl -I http://localhost:8000/recon/pub/{pub_key}/cloud.ply

# 4. 브라우저 콘솔 확인 (F12 → Console/Network 탭)
```


## 설정 커스터마이징

### 주요 환경 변수

```bash
export BASE_URL=http://localhost:8000  # 뷰어 URL (기본값: http://kaprpc.iptime.org:5051)
export TRAINING_ITERATIONS=10000       # 학습 반복 횟수 (7000=빠름, 10000=고품질)
export MAX_CONCURRENT_JOBS=1           # 동시 처리 작업 수
export MAX_IMAGE_SIZE=1600             # 이미지 리사이즈 크기
export PORT=8000                       # API 서버 포트
export HOST=0.0.0.0                    # API 서버 호스트
```

**중요**: 프로덕션 환경에서는 반드시 `BASE_URL`을 실제 서버 주소로 설정하세요.

상세 설정은 `app/config.py` 파일을 참고하세요.

## 통합 가이드

이 서비스는 중고 거래 플랫폼의 백엔드 시스템과 통합되어 동작합니다.

### RDS 연동 워크플로우

```
제품 등록 → 이미지 업로드(S3) → 3DGS API 호출 → 3D 모델 생성
         → job_count 업데이트 (0→1) → FAULT_DESC 완료 (1→2)
         → sell_status = 'ACTIVE' (제품 공개)
```

### API 호출 예시 (Backend → Gaussian AI)

```python
import requests

# 1. 제품 이미지로 3D 재구성 작업 생성
response = requests.post(
    "http://gaussian-ai-server:8000/recon/jobs",
    files=[
        ("files", open(f"product_{product_id}_1.jpg", "rb")),
        ("files", open(f"product_{product_id}_2.jpg", "rb")),
        # ... 15-20장
    ],
    data={"original_resolution": False}
)

job = response.json()
job_id = job["job_id"]
pub_key = job["pub_key"]

# 2. 작업 완료 대기 (polling 또는 webhook)
status_response = requests.get(
    f"http://gaussian-ai-server:8000/recon/jobs/{job_id}/status"
)

# 3. 완료 시 PLY URL 저장
if status_response.json()["status"] == "COMPLETED":
    ply_url = f"http://gaussian-ai-server:8000/recon/pub/{pub_key}/cloud.ply"
    viewer_url = f"http://gaussian-ai-server:8000/v/{pub_key}"

    # RDS 업데이트
    # UPDATE product SET ply_url=?, viewer_url=?, job_count=job_count+1
```

### 데이터베이스 연동

**job_3dgs 테이블 업데이트**:
```sql
-- 작업 시작 시
INSERT INTO job_3dgs (product_id, status, s3_input_prefix)
VALUES (?, 'QUEUED', ?);

-- 작업 완료 시
UPDATE job_3dgs
SET status='DONE',
    s3_output_prefix=?,
    completed_at=NOW()
WHERE product_id=?;

-- product 테이블 업데이트
UPDATE product
SET job_count = job_count + 1,
    ply_url = ?,
    viewer_url = ?,
    sell_status = CASE WHEN job_count + 1 >= 2 THEN 'ACTIVE' ELSE sell_status END
WHERE product_id = ?;
```

자세한 통합 가이드는 프로젝트 루트의 통합 문서를 참고하세요.


## 기술 스택

- **Backend**: FastAPI 0.104.1, Uvicorn, SQLAlchemy
- **3D Processing**: COLMAP, Gaussian Splatting (Inria 2023)
- **Machine Learning**: PyTorch 2.0+, scikit-learn
- **3D Viewer**: PlayCanvas Model Viewer (Official)
- **Database**: SQLite (기본)
- **Async**: asyncio, aiofiles
- **Validation**: Pydantic, python-multipart


## 라이센스

이 프로젝트는 다음 오픈소스 프로젝트를 사용합니다:
- [Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting) - Inria License
- [COLMAP](https://colmap.github.io/) - BSD License
- [PlayCanvas Model Viewer](https://github.com/playcanvas/model-viewer) - MIT License

## 참고 자료

- [3D Gaussian Splatting 논문](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)
- [COLMAP 문서](https://colmap.github.io/)
- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [PlayCanvas 문서](https://developer.playcanvas.com/)
- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
