"""
COLMAP pipeline for Structure-from-Motion reconstruction
"""
import shutil
from pathlib import Path
from app.config import settings
from app.core.pipeline import run_command
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class COLMAPPipeline:
    """COLMAP pipeline for Structure-from-Motion reconstruction"""

    def __init__(self, job_dir: Path):
        self.job_dir = job_dir
        self.database_path = job_dir / "colmap" / "database.db"
        self.images_path = job_dir / "upload" / "images"
        self.sparse_path = job_dir / "colmap" / "sparse"
        self.work_path = job_dir / "work"

    async def extract_features(self, log_file) -> None:
        """Extract SIFT features from images"""
        logger.info(f"Extracting features for job {self.job_dir.name}")

        cmd = [
            "colmap", "feature_extractor",
            "--database_path", str(self.database_path),
            "--image_path", str(self.images_path),
            "--ImageReader.camera_model", settings.COLMAP_CAMERA_MODEL,
            "--SiftExtraction.max_num_features", str(settings.COLMAP_MAX_FEATURES),
            "--FeatureExtraction.num_threads", str(settings.COLMAP_NUM_THREADS)
        ]

        await run_command(cmd, log_file)

    async def match_features(self, log_file) -> None:
        """Match features between images"""
        logger.info(f"Matching features for job {self.job_dir.name}")

        cmd = [
            "colmap", "exhaustive_matcher",
            "--database_path", str(self.database_path),
            "--FeatureMatching.num_threads", str(settings.COLMAP_NUM_THREADS)
        ]

        await run_command(cmd, log_file)

    async def reconstruct(self, log_file) -> Path:
        """Perform sparse reconstruction (SfM)"""
        logger.info(f"Reconstructing sparse model for job {self.job_dir.name}")

        self.sparse_path.mkdir(parents=True, exist_ok=True)

        cmd = [
            "colmap", "mapper",
            "--database_path", str(self.database_path),
            "--image_path", str(self.images_path),
            "--output_path", str(self.sparse_path)
        ]

        await run_command(cmd, log_file)

        model0_path = self.sparse_path / "0"
        if not model0_path.exists():
            raise RuntimeError("COLMAP reconstruction failed: no sparse model generated")

        return model0_path

    async def undistort_images(self, model_path: Path, log_file) -> Path:
        """Undistort images and prepare for Gaussian Splatting"""
        logger.info(f"Undistorting images for job {self.job_dir.name}")

        self.work_path.mkdir(parents=True, exist_ok=True)

        cmd = [
            "colmap", "image_undistorter",
            "--image_path", str(self.images_path),
            "--input_path", str(model_path),
            "--output_path", str(self.work_path),
            "--output_type", "COLMAP"
        ]

        await run_command(cmd, log_file)

        # GS expects sparse model in sparse/0/ subdirectory
        sparse_0_dir = self.work_path / "sparse" / "0"
        sparse_0_dir.mkdir(parents=True, exist_ok=True)

        # Move sparse files
        sparse_dir = self.work_path / "sparse"
        for item in sparse_dir.iterdir():
            if item.is_file():
                shutil.move(str(item), str(sparse_0_dir / item.name))

        return self.work_path

    async def convert_to_text(self, sparse_dir: Path, log_file) -> None:
        """Convert COLMAP binary model to text format"""
        logger.info(f"Converting COLMAP model to text format")

        cmd = [
            "colmap", "model_converter",
            "--input_path", str(sparse_dir),
            "--output_path", str(sparse_dir),
            "--output_type", "TXT"
        ]

        await run_command(cmd, log_file)
