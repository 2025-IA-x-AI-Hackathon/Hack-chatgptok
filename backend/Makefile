# Docker 설정
IMAGE_NAME = backend-app
CONTAINER_NAME = backend
PORT = 8000

# 기본 명령어
.PHONY: help build run stop restart logs clean deploy

# 도움말
help:
	@echo "=== Backend 배포 명령어 ==="
	@echo "make build    - Docker 이미지 빌드"
	@echo "make run      - 컨테이너 실행"
	@echo "make stop     - 컨테이너 중지"
	@echo "make restart  - 컨테이너 재시작"
	@echo "make logs     - 로그 보기"
	@echo "make deploy   - 재배포 (중지 → 빌드 → 실행)"
	@echo "make clean    - 컨테이너 & 이미지 삭제"
	@echo "make ps       - 실행 중인 컨테이너 확인"

# Docker 이미지 빌드
build:
	@echo "Docker 이미지 빌드 중..."
	docker build -t $(IMAGE_NAME) .
	@echo "빌드 완료!"

# 컨테이너 실행
run:
	@echo "컨테이너 실행 중..."
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):8000 \
		--env-file .env \
		$(IMAGE_NAME)
	@echo "컨테이너 실행 완료!"
	@echo "http://localhost:$(PORT)"

# 컨테이너 중지
stop:
	@echo "컨테이너 중지 중..."
	-docker stop $(CONTAINER_NAME)
	@echo "중지 완료!"

# 컨테이너 재시작
restart: stop
	@echo "컨테이너 재시작 중..."
	-docker rm $(CONTAINER_NAME)
	$(MAKE) run

# 재배포 (중지 → 빌드 → 실행)
deploy: stop
	@echo "재배포 시작..."
	-docker rm $(CONTAINER_NAME)
	$(MAKE) build
	$(MAKE) run
	@echo "재배포 완료!"

# 로그 보기
logs:
	docker logs -f $(CONTAINER_NAME)

# 실행 중인 컨테이너 확인
ps:
	@docker ps -a | grep $(CONTAINER_NAME) || echo "실행 중인 컨테이너 없음"

# 컨테이너 & 이미지 삭제
clean:
	@echo "정리 중..."
	-docker stop $(CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME)
	-docker rmi $(IMAGE_NAME)
	@echo "정리 완료!"
