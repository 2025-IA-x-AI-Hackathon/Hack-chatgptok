# Hack-chatgptok Backend

## 빠른 시작

```bash
# 1. 환경변수 설정
.env 파일 받아서 프로젝트에 넣기

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm start
```

## Docker 배포

```bash
# 처음 실행
make build
make run

# 코드 수정 후 재배포
make deploy

# 로그 확인
make logs
```

## 주요 명령어

- `make build` - Docker 이미지 빌드
- `make run` - 컨테이너 실행
- `make deploy` - 재배포 (중지 + 빌드 + 실행)
- `make stop` - 컨테이너 중지
- `make logs` - 로그 보기
- `make clean` - 컨테이너/이미지 삭제
