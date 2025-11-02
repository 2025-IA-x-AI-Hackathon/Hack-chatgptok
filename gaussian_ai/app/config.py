"""
Application configuration settings
"""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings and configuration"""

    # Project paths
    BASE_DIR: Path = Path(__file__).parent.parent
    DATA_DIR: Path = BASE_DIR / "data" / "jobs"
    GAUSSIAN_SPLATTING_DIR: Path = BASE_DIR / "gaussian-splatting"
    TEMPLATES_DIR: Path = BASE_DIR / "templates"
    STATIC_DIR: Path = BASE_DIR / "static"
    LOGS_DIR: Path = BASE_DIR / "logs"

    # Database
    # Use MySQL RDS if credentials are provided, otherwise fallback to SQLite
    _db_host = os.getenv("DB_HOST")
    _db_port = os.getenv("DB_PORT", "3306")
    _db_user = os.getenv("DB_USER")
    _db_password = os.getenv("DB_PASSWORD")
    _db_name = os.getenv("DB_NAME")
    
    if _db_host and _db_user and _db_password and _db_name:
        DATABASE_URL: str = f"mysql+pymysql://{_db_user}:{_db_password}@{_db_host}:{_db_port}/{_db_name}"
    else:
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/jobs.db")

    # API Settings
    APP_TITLE: str = "Gaussian Splatting 3D Reconstruction API"
    APP_DESCRIPTION: str = "Upload images to reconstruct a 3D model using Gaussian Splatting"
    APP_VERSION: str = "2.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    BASE_URL: str = os.getenv("BASE_URL", "http://kaprpc.iptime.org:5051")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # CORS
    CORS_ORIGINS: list = ["*"]

    # Processing limits
    MAX_CONCURRENT_JOBS: int = int(os.getenv("MAX_CONCURRENT_JOBS", "1"))
    MIN_IMAGES: int = int(os.getenv("MIN_IMAGES", "3"))
    MAX_IMAGES: int = int(os.getenv("MAX_IMAGES", "50"))
    MAX_IMAGE_SIZE: int = int(os.getenv("MAX_IMAGE_SIZE", "1600"))
    MIN_IMAGE_SIZE: int = 100
    ALLOWED_IMAGE_EXTENSIONS: set = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}

    # 업로드 검증 (IMPLEMENT.md 기준)
    MAX_FILE_SIZE_MB: int = 30  # 개별 파일 최대 크기
    MAX_TOTAL_SIZE_MB: int = 500  # 전체 업로드 최대 크기
    ALLOWED_MIME_TYPES: set = {'image/jpeg', 'image/png', 'image/webp'}

    # Gaussian Splatting training
    TRAINING_ITERATIONS: int = int(os.getenv("TRAINING_ITERATIONS", "10000"))
    SAVE_ITERATIONS: list = [10000]
    DENSIFY_UNTIL_ITER: int = 5000
    DENSIFICATION_INTERVAL: int = 200
    OPACITY_RESET_INTERVAL: int = 10000

    # COLMAP settings
    COLMAP_MAX_FEATURES: int = int(os.getenv("COLMAP_MAX_FEATURES", "8192"))
    COLMAP_NUM_THREADS: int = int(os.getenv("COLMAP_NUM_THREADS", "8"))
    COLMAP_CAMERA_MODEL: str = "OPENCV"

    # Outlier filtering
    OUTLIER_K_NEIGHBORS: int = 20
    OUTLIER_STD_THRESHOLD: float = 2.0
    OUTLIER_REMOVE_SMALL_CLUSTERS: bool = True
    OUTLIER_MIN_CLUSTER_RATIO: float = 0.01

    # Conda environment
    CONDA_ENV_NAME: str = "codyssey"
    CONDA_PYTHON: Path = Path.home() / "miniconda3" / "envs" / CONDA_ENV_NAME / "bin" / "python"

    # GPU monitoring
    GPU_CHECK_INTERVAL: int = 20  # Check every N read cycles
    MONITOR_GPU: bool = True

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    @classmethod
    def ensure_dirs(cls):
        """Ensure all required directories exist"""
        cls.DATA_DIR.mkdir(parents=True, exist_ok=True)
        cls.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        cls.TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
        cls.STATIC_DIR.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()

# Ensure directories exist on import
settings.ensure_dirs()
