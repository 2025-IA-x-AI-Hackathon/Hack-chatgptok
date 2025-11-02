#!/bin/bash

# Hack-chatgptok 전체 서비스 실행 스크립트
# 프론트엔드, 백엔드, AI 서비스를 한번에 실행합니다.

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 프로젝트 루트 디렉토리
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info "Hack-chatgptok 서비스를 시작합니다..."
log_info "프로젝트 루트: $PROJECT_ROOT"

# PID 파일 저장 디렉토리
PID_DIR="$PROJECT_ROOT/.pids"
mkdir -p "$PID_DIR"

# 종료 함수
cleanup() {
    log_warning "서비스를 종료합니다..."

    # 저장된 PID로 프로세스 종료
    if [ -f "$PID_DIR/backend.pid" ]; then
        kill $(cat "$PID_DIR/backend.pid") 2>/dev/null || true
        rm "$PID_DIR/backend.pid"
    fi

    if [ -f "$PID_DIR/frontend.pid" ]; then
        kill $(cat "$PID_DIR/frontend.pid") 2>/dev/null || true
        rm "$PID_DIR/frontend.pid"
    fi

    log_success "모든 로컬 서비스가 종료되었습니다."
    exit 0
}

# Ctrl+C 시그널 처리
trap cleanup SIGINT SIGTERM

# 1. 백엔드 실행
log_info "===================================================="
log_info "1. 백엔드 서버 시작 (http://localhost:8000)"
log_info "===================================================="

cd "$PROJECT_ROOT/backend"

# .env 파일 확인
if [ ! -f ".env" ]; then
    log_error "backend/.env 파일이 없습니다. .env 파일을 생성해주세요."
    exit 1
fi

# node_modules 확인
if [ ! -d "node_modules" ]; then
    log_info "의존성을 설치합니다..."
    npm install
fi

# 백엔드 실행
log_info "백엔드 서버를 시작합니다..."
npm start > "$PROJECT_ROOT/backend.log" 2>&1 &
echo $! > "$PID_DIR/backend.pid"
log_success "백엔드 서버가 백그라운드에서 실행 중입니다 (PID: $(cat $PID_DIR/backend.pid))"

# 2. 프론트엔드 실행
log_info "===================================================="
log_info "2. 프론트엔드 서버 시작 (http://localhost:3000)"
log_info "===================================================="

cd "$PROJECT_ROOT/frontend"

# .env.local 파일 확인
if [ ! -f ".env.local" ]; then
    log_warning "frontend/.env.local 파일이 없습니다."
    log_info "기본값으로 .env.local 파일을 생성합니다..."
    echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api" > .env.local
fi

# node_modules 확인
if [ ! -d "node_modules" ]; then
    log_info "의존성을 설치합니다..."
    npm install
fi

# 프론트엔드 실행
log_info "프론트엔드 서버를 시작합니다..."
npm run dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
echo $! > "$PID_DIR/frontend.pid"
log_success "프론트엔드 서버가 백그라운드에서 실행 중입니다 (PID: $(cat $PID_DIR/frontend.pid))"

# AI 서버는 외부에서 실행 중
log_info "===================================================="
log_info "AI 서버 상태 확인"
log_info "===================================================="
log_info "AI 서버들은 외부 서버에서 실행됩니다:"
log_info "  - Gaussian AI (3D 재구성):  http://kaprpc.iptime.org:5051"
log_info "  - Description AI (결함 감지): http://kaprpc.iptime.org:5052"
log_warning "로컬에서 AI 서버를 실행하려면 각 디렉토리의 README를 참고하세요."

# 서버 시작 대기
log_info "===================================================="
log_info "서버가 시작되는 중입니다. 잠시만 기다려주세요..."
log_info "===================================================="
sleep 5

# 상태 확인
log_info "===================================================="
log_info "실행 중인 서비스 목록:"
log_info "===================================================="
log_success "✓ 백엔드:        http://localhost:8000 (log: backend.log)"
log_success "✓ 프론트엔드:    http://localhost:3000 (log: frontend.log)"
log_info ""
log_info "외부 AI 서버:"
log_success "✓ Gaussian AI:   http://kaprpc.iptime.org:5051 (3D 재구성)"
log_success "✓ Description AI: http://kaprpc.iptime.org:5052 (결함 감지)"

log_info "===================================================="
log_info "로그 확인 방법:"
log_info "===================================================="
echo "  - 백엔드:        tail -f $PROJECT_ROOT/backend.log"
echo "  - 프론트엔드:    tail -f $PROJECT_ROOT/frontend.log"

log_info "===================================================="
log_warning "종료하려면 Ctrl+C를 누르세요."
log_info "===================================================="

# 무한 대기
while true; do
    sleep 1
done
