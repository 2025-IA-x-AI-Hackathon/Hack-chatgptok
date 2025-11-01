#!/usr/bin/env python3
"""
Generate lightweight PLY versions for existing completed jobs

This script scans all completed jobs and creates light/medium versions
of their PLY files if they don't already exist.
"""
import sys
from pathlib import Path

# Add parent directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.utils.ply_downsampler import create_lightweight_versions
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


def generate_lightweight_for_job(job_dir: Path) -> bool:
    """
    Generate lightweight versions for a single job

    Args:
        job_dir: Path to job directory

    Returns:
        True if successful, False otherwise
    """
    job_id = job_dir.name

    # Try new structure first
    ply_file = job_dir / "output" / "point_cloud" / f"iteration_{settings.TRAINING_ITERATIONS}" / "point_cloud_filtered.ply"

    if not ply_file.exists():
        # Fallback to unfiltered
        ply_file = job_dir / "output" / "point_cloud" / f"iteration_{settings.TRAINING_ITERATIONS}" / "point_cloud.ply"

    # Try old structure
    if not ply_file.exists():
        ply_file = job_dir / "gs_output" / "point_cloud" / f"iteration_{settings.TRAINING_ITERATIONS}" / "point_cloud_filtered.ply"

    if not ply_file.exists():
        ply_file = job_dir / "gs_output" / "point_cloud" / f"iteration_{settings.TRAINING_ITERATIONS}" / "point_cloud.ply"

    if not ply_file.exists():
        logger.warning(f"[{job_id}] No PLY file found, skipping")
        return False

    # Check if lightweight versions already exist
    light_file = ply_file.parent / f"{ply_file.stem}_light.ply"
    medium_file = ply_file.parent / f"{ply_file.stem}_medium.ply"

    if light_file.exists() and medium_file.exists():
        logger.info(f"[{job_id}] Lightweight versions already exist, skipping")
        return True

    logger.info(f"[{job_id}] Generating lightweight versions from: {ply_file.name}")

    # Generate lightweight versions
    results = create_lightweight_versions(
        original_ply_path=ply_file,
        create_light=not light_file.exists(),
        create_medium=not medium_file.exists()
    )

    if results.get('light') or results.get('medium'):
        logger.info(f"[{job_id}] ✅ Successfully generated lightweight versions")
        return True
    else:
        logger.error(f"[{job_id}] ❌ Failed to generate lightweight versions")
        return False


def main():
    """Main function to process all jobs"""
    logger.info("=" * 60)
    logger.info("Generating lightweight PLY versions for existing jobs")
    logger.info("=" * 60)

    data_dir = Path(settings.DATA_DIR)

    if not data_dir.exists():
        logger.error(f"Data directory not found: {data_dir}")
        return

    # Get all job directories
    job_dirs = [d for d in data_dir.iterdir() if d.is_dir()]

    logger.info(f"Found {len(job_dirs)} job directories")

    success_count = 0
    skip_count = 0
    fail_count = 0

    for job_dir in job_dirs:
        try:
            result = generate_lightweight_for_job(job_dir)
            if result:
                success_count += 1
            else:
                skip_count += 1
        except Exception as e:
            logger.error(f"[{job_dir.name}] Error: {str(e)}")
            fail_count += 1

    logger.info("=" * 60)
    logger.info("Summary:")
    logger.info(f"  Success: {success_count}")
    logger.info(f"  Skipped: {skip_count}")
    logger.info(f"  Failed:  {fail_count}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
