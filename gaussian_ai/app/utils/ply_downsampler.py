"""
PLY Point Cloud Downsampling Utility

Reduces PLY file size by sampling a subset of points.
Used for creating lightweight versions of 3D Gaussian Splatting models.
"""
import numpy as np
from pathlib import Path
from typing import Optional
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


def parse_ply_header(file_path: Path) -> tuple[list[str], int, int]:
    """
    Parse PLY file header to extract metadata

    Args:
        file_path: Path to PLY file

    Returns:
        Tuple of (header_lines, vertex_count, header_byte_size)
    """
    header_lines = []
    vertex_count = 0

    with open(file_path, 'rb') as f:
        while True:
            line = f.readline().decode('utf-8', errors='ignore').strip()
            header_lines.append(line)

            if line.startswith('element vertex'):
                vertex_count = int(line.split()[-1])

            if line == 'end_header':
                header_byte_size = f.tell()
                break

    return header_lines, vertex_count, header_byte_size


def downsample_ply(
    input_path: Path,
    output_path: Path,
    sample_ratio: float = 0.1,
    seed: int = 42
) -> bool:
    """
    Downsample PLY file by randomly selecting a subset of points

    Args:
        input_path: Path to original PLY file
        output_path: Path to save downsampled PLY file
        sample_ratio: Ratio of points to keep (0.0 to 1.0)
        seed: Random seed for reproducibility

    Returns:
        True if successful, False otherwise

    Example:
        >>> downsample_ply(Path('model.ply'), Path('model_light.ply'), sample_ratio=0.1)
        # Keeps 10% of points, reduces file size by ~90%
    """
    try:
        logger.info(f"[PLY Downsampling] Starting: {input_path.name}")
        logger.info(f"[PLY Downsampling] Sample ratio: {sample_ratio * 100:.1f}%")

        # Set random seed for reproducibility
        np.random.seed(seed)

        # Parse header
        header_lines, vertex_count, header_byte_size = parse_ply_header(input_path)

        logger.info(f"[PLY Downsampling] Total points: {vertex_count:,}")

        # Calculate sample count
        sample_count = max(100, int(vertex_count * sample_ratio))

        # Generate random sample indices
        sample_indices = np.random.choice(vertex_count, sample_count, replace=False)
        sample_indices = np.sort(sample_indices)

        logger.info(f"[PLY Downsampling] Sampled points: {sample_count:,}")
        logger.info(f"[PLY Downsampling] Reduction: {(1 - sample_ratio) * 100:.1f}%")

        # Read entire file
        with open(input_path, 'rb') as f:
            # Skip header
            f.seek(header_byte_size)

            # Read all vertex data
            vertex_data = f.read()

        # Calculate bytes per vertex
        bytes_per_vertex = len(vertex_data) // vertex_count

        logger.info(f"[PLY Downsampling] Bytes per vertex: {bytes_per_vertex}")

        # Update header with new vertex count
        new_header_lines = []
        for line in header_lines:
            if line.startswith('element vertex'):
                new_header_lines.append(f'element vertex {sample_count}')
            else:
                new_header_lines.append(line)

        # Write downsampled PLY file
        with open(output_path, 'wb') as f:
            # Write header
            for line in new_header_lines:
                f.write((line + '\n').encode('utf-8'))

            # Write sampled vertices
            for idx in sample_indices:
                start = idx * bytes_per_vertex
                end = start + bytes_per_vertex
                f.write(vertex_data[start:end])

        # Calculate file size reduction
        original_size = input_path.stat().st_size / (1024 * 1024)  # MB
        new_size = output_path.stat().st_size / (1024 * 1024)      # MB
        reduction = (1 - new_size / original_size) * 100

        logger.info(f"[PLY Downsampling] Original: {original_size:.2f}MB → {new_size:.2f}MB")
        logger.info(f"[PLY Downsampling] File size reduction: {reduction:.1f}%")
        logger.info(f"[PLY Downsampling] ✅ Complete!")

        return True

    except Exception as e:
        logger.error(f"[PLY Downsampling] ❌ Failed: {str(e)}")
        return False


def create_lightweight_versions(
    original_ply_path: Path,
    create_light: bool = True,
    create_medium: bool = True,
    light_ratio: float = 0.05,
    medium_ratio: float = 0.20
) -> dict[str, Optional[Path]]:
    """
    Create multiple lightweight versions of a PLY file

    Args:
        original_ply_path: Path to original PLY file
        create_light: Whether to create light version (5% by default)
        create_medium: Whether to create medium version (20% by default)
        light_ratio: Sample ratio for light version
        medium_ratio: Sample ratio for medium version

    Returns:
        Dictionary mapping quality level to output path

    Example:
        >>> create_lightweight_versions(Path('point_cloud.ply'))
        {
            'light': Path('point_cloud_light.ply'),
            'medium': Path('point_cloud_medium.ply'),
            'full': Path('point_cloud.ply')
        }
    """
    results = {
        'full': original_ply_path,
        'light': None,
        'medium': None
    }

    original_path = Path(original_ply_path)

    if not original_path.exists():
        logger.error(f"[PLY Lightweight] Original file not found: {original_path}")
        return results

    # Create light version (5% - for thumbnails)
    if create_light:
        light_path = original_path.parent / f"{original_path.stem}_light.ply"
        logger.info(f"[PLY Lightweight] Creating light version ({light_ratio*100:.0f}%)")

        if downsample_ply(original_path, light_path, sample_ratio=light_ratio):
            results['light'] = light_path
            logger.info(f"[PLY Lightweight] ✅ Light version created: {light_path.name}")
        else:
            logger.warning(f"[PLY Lightweight] ⚠️ Failed to create light version")

    # Create medium version (20% - for list views)
    if create_medium:
        medium_path = original_path.parent / f"{original_path.stem}_medium.ply"
        logger.info(f"[PLY Lightweight] Creating medium version ({medium_ratio*100:.0f}%)")

        if downsample_ply(original_path, medium_path, sample_ratio=medium_ratio):
            results['medium'] = medium_path
            logger.info(f"[PLY Lightweight] ✅ Medium version created: {medium_path.name}")
        else:
            logger.warning(f"[PLY Lightweight] ⚠️ Failed to create medium version")

    logger.info(f"[PLY Lightweight] 🎉 All versions created successfully!")

    return results
