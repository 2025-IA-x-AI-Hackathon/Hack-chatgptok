"""
S3 utility functions for downloading images
"""
import boto3
import unicodedata
from pathlib import Path
from typing import List
from PIL import Image
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


async def download_s3_images(s3_paths: List[str], dest_dir: Path) -> int:
    """
    S3에서 이미지를 다운로드하여 로컬 디렉토리에 저장

    Args:
        s3_paths: S3 경로 리스트 (s3://bucket/key 형식)
        dest_dir: 저장할 로컬 디렉토리 (Path 객체)

    Returns:
        int: 성공적으로 다운로드한 이미지 개수

    Raises:
        ValueError: S3 경로 형식이 잘못된 경우
        Exception: S3 다운로드 실패 시
    """
    import asyncio

    s3 = boto3.client('s3')
    dest_dir.mkdir(parents=True, exist_ok=True)

    def _download_single_image(s3_path: str, index: int) -> bool:
        """단일 이미지 다운로드 (동기 함수)"""
        try:
            # S3 경로 파싱
            if not s3_path.startswith('s3://'):
                raise ValueError(f"Invalid S3 path format: {s3_path}. Must start with 's3://'")

            path = s3_path.replace("s3://", "")
            parts = path.split("/", 1)

            if len(parts) != 2:
                raise ValueError(f"Invalid S3 path format: {s3_path}. Expected s3://bucket/key")

            bucket, key = parts

            # 한글 파일명 정규화 (NFC 통일)
            key = unicodedata.normalize('NFC', key)

            # 파일 확장자 추출
            file_ext = Path(key).suffix or ".jpg"

            # 저장할 로컬 파일명 (순서대로 번호 부여)
            local_filename = f"image_{index:04d}{file_ext}"
            local_path = dest_dir / local_filename

            logger.info(f"Downloading S3 image {index+1}: s3://{bucket}/{key} → {local_path}")

            # S3에서 임시 파일로 다운로드
            temp_path = local_path.parent / f"temp_{local_filename}"
            s3.download_file(bucket, key, str(temp_path))

            # 이미지 리사이즈 (항상 1600px로)
            try:
                img = Image.open(temp_path)
                width, height = img.size

                # MAX_IMAGE_SIZE(1600)보다 크면 리사이즈
                if width > settings.MAX_IMAGE_SIZE or height > settings.MAX_IMAGE_SIZE:
                    ratio = min(settings.MAX_IMAGE_SIZE / width, settings.MAX_IMAGE_SIZE / height)
                    new_width = int(width * ratio)
                    new_height = int(height * ratio)
                    img = img.resize((new_width, new_height), Image.LANCZOS)
                    logger.info(f"Resized {local_filename}: {width}x{height} → {new_width}x{new_height}")

                # 리사이즈된 이미지 저장
                img.save(str(local_path), quality=95)

                # 임시 파일 삭제
                temp_path.unlink()

            except Exception as e:
                logger.warning(f"Failed to resize {local_filename}: {e}. Using original.")
                # 리사이즈 실패 시 원본 사용
                if temp_path.exists():
                    temp_path.rename(local_path)

            logger.info(f"Successfully downloaded and processed: {local_filename}")
            return True

        except Exception as e:
            logger.error(f"Failed to download {s3_path}: {e}")
            return False

    # 비동기로 모든 이미지 다운로드 (동기 함수를 thread에서 실행)
    tasks = [
        asyncio.to_thread(_download_single_image, s3_path, i)
        for i, s3_path in enumerate(s3_paths)
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 성공한 개수 계산
    success_count = sum(1 for r in results if r is True)

    logger.info(f"Downloaded {success_count}/{len(s3_paths)} images successfully")

    if success_count == 0:
        raise Exception("Failed to download any images from S3")

    return success_count
