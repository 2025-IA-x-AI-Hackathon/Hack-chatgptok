"""
COLMAP reconstruction validation utilities
"""
from pathlib import Path
from typing import Tuple, Optional
import struct


class COLMAPValidationResult:
    """COLMAP validation result"""

    def __init__(self):
        self.is_valid = True
        self.errors = []
        self.warnings = []
        self.stats = {}

    def add_error(self, message: str):
        """Add error message"""
        self.errors.append(message)
        self.is_valid = False

    def add_warning(self, message: str):
        """Add warning message"""
        self.warnings.append(message)

    def get_summary(self) -> str:
        """Get validation summary"""
        lines = [">> [COLMAP_VALIDATION] Reconstruction Quality Check"]
        lines.append("=" * 60)

        # Stats
        if self.stats:
            lines.append("Statistics:")
            for key, value in self.stats.items():
                lines.append(f"  - {key}: {value}")
            lines.append("")

        # Warnings
        if self.warnings:
            lines.append("Warnings:")
            for warning in self.warnings:
                lines.append(f"  ⚠ {warning}")
            lines.append("")

        # Errors
        if self.errors:
            lines.append("Errors (reconstruction invalid):")
            for error in self.errors:
                lines.append(f"  ✗ {error}")
            lines.append("")

        # Result
        if self.is_valid:
            lines.append("✓ Reconstruction is valid for training")
        else:
            lines.append("✗ Reconstruction is NOT suitable for training")

        lines.append("=" * 60)
        return "\n".join(lines)


def read_cameras_text(cameras_file: Path) -> int:
    """Read cameras.txt and return camera count"""
    if not cameras_file.exists():
        return 0

    count = 0
    with open(cameras_file, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            count += 1
    return count


def read_images_text(images_file: Path) -> Tuple[int, int]:
    """
    Read images.txt and return (total_images, registered_images)

    Returns:
        Tuple of (total images in file, registered images with valid pose)
    """
    if not images_file.exists():
        return 0, 0

    total = 0
    registered = 0

    with open(images_file, 'r') as f:
        lines = f.readlines()

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith('#'):
            i += 1
            continue

        # Image line format: IMAGE_ID, QW, QX, QY, QZ, TX, TY, TZ, CAMERA_ID, NAME
        parts = line.split()
        if len(parts) >= 10:
            total += 1
            # Check if pose is valid (not all zeros)
            qw, qx, qy, qz = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
            tx, ty, tz = float(parts[5]), float(parts[6]), float(parts[7])

            if not (qw == 0 and qx == 0 and qy == 0 and qz == 0 and tx == 0 and ty == 0 and tz == 0):
                registered += 1

        # Skip the next line (points2D line)
        i += 2

    return total, registered


def read_points3D_text(points_file: Path) -> Tuple[int, float]:
    """
    Read points3D.txt and return (point_count, avg_track_length)

    Returns:
        Tuple of (number of 3D points, average track length)
    """
    if not points_file.exists():
        return 0, 0.0

    count = 0
    total_track_length = 0

    with open(points_file, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue

            # Point3D line format: POINT3D_ID, X, Y, Z, R, G, B, ERROR, TRACK[] as (IMAGE_ID, POINT2D_IDX)
            parts = line.split()
            if len(parts) >= 8:
                count += 1
                # Track length is (total parts - 8) / 2
                track_length = (len(parts) - 8) // 2
                total_track_length += track_length

    avg_track_length = total_track_length / count if count > 0 else 0.0
    return count, avg_track_length


def validate_colmap_reconstruction(sparse_dir: Path) -> COLMAPValidationResult:
    """
    Validate COLMAP sparse reconstruction quality (STRICT - for production)

    Args:
        sparse_dir: Path to sparse/0 directory

    Returns:
        COLMAPValidationResult with validation details
    """
    result = COLMAPValidationResult()

    # Check if sparse directory exists
    if not sparse_dir.exists():
        result.add_error(f"Sparse reconstruction directory not found: {sparse_dir}")
        return result

    # Required files
    cameras_file = sparse_dir / "cameras.txt"
    images_file = sparse_dir / "images.txt"
    points_file = sparse_dir / "points3D.txt"

    # Check if all required files exist
    if not cameras_file.exists():
        result.add_error("cameras.txt not found")
        return result

    if not images_file.exists():
        result.add_error("images.txt not found")
        return result

    if not points_file.exists():
        result.add_error("points3D.txt not found")
        return result

    # Read reconstruction data
    camera_count = read_cameras_text(cameras_file)
    total_images, registered_images = read_images_text(images_file)
    point_count, avg_track_length = read_points3D_text(points_file)

    # Store stats
    result.stats = {
        "Cameras": camera_count,
        "Total images": total_images,
        "Registered images": registered_images,
        "3D points": point_count,
        "Avg track length": f"{avg_track_length:.2f}"
    }

    # Validation rules
    # Based on analysis of existing successful jobs:
    # - Good quality (PSNR >= 20): min 10 reg imgs, 822+ points, track 4.04+
    # - Medium quality (PSNR 15-20): min 2 reg imgs, 168+ points, track 2.0+
    # Setting thresholds to avoid poor quality reconstructions

    # Rule 1: At least 1 camera must be calibrated
    if camera_count == 0:
        result.add_error("No cameras found in reconstruction")

    # Rule 2: Minimum registered images (at least 3 for stable reconstruction)
    if registered_images < 3:
        result.add_error(f"Too few registered images: {registered_images} (minimum: 3)")
    elif registered_images < 5:
        result.add_warning(f"Low registered image count: {registered_images} (recommended: 5+)")

    # Rule 3: Registration rate should be reasonable
    if total_images > 0:
        registration_rate = registered_images / total_images
        if registration_rate < 0.6:
            result.add_error(
                f"Low image registration rate: {registration_rate*100:.1f}% "
                f"({registered_images}/{total_images} images registered, minimum: 60%)"
            )
        elif registration_rate < 0.8:
            result.add_warning(
                f"Moderate image registration rate: {registration_rate*100:.1f}% "
                f"({registered_images}/{total_images} images registered, recommended: 80%+)"
            )

    # Rule 4: Minimum 3D points for meaningful reconstruction
    # Medium quality starts at ~168 points, but we want to be more strict
    if point_count < 300:
        result.add_error(f"Too few 3D points: {point_count} (minimum: 300)")
    elif point_count < 800:
        result.add_warning(f"Low 3D point count: {point_count} (recommended: 800+ for good quality)")

    # Rule 5: Average track length should be reasonable
    # Track length correlates with reconstruction quality
    # Note: Faces/portraits may have lower track length (2.0-2.5)
    if avg_track_length < 2.0:
        result.add_error(f"Low average track length: {avg_track_length:.2f} (minimum: 2.0)")
    elif avg_track_length < 3.0:
        result.add_warning(f"Low average track length: {avg_track_length:.2f} (recommended: 3.0+ for good quality)")

    # Rule 6: Points-to-images ratio
    if registered_images > 0:
        points_per_image = point_count / registered_images
        if points_per_image < 80:
            result.add_error(f"Too sparse reconstruction: {points_per_image:.1f} points/image (minimum: 80)")
        elif points_per_image < 100:
            result.add_warning(f"Sparse reconstruction: {points_per_image:.1f} points/image (recommended: 100+)")

    return result


def simple_validation(sparse_dir: Path) -> COLMAPValidationResult:
    """
    Simplified COLMAP validation for MVP (only 2 essential checks)

    This is more permissive than validate_colmap_reconstruction().
    Even low-quality reconstructions may produce acceptable 3D Gaussian Splatting results.
    Users can judge quality directly in the 3D viewer.

    Args:
        sparse_dir: Path to sparse/0 directory

    Returns:
        COLMAPValidationResult with validation details
    """
    result = COLMAPValidationResult()

    # Check if sparse directory exists
    if not sparse_dir.exists():
        result.add_error(f"Sparse reconstruction directory not found: {sparse_dir}")
        return result

    # Required files
    cameras_file = sparse_dir / "cameras.txt"
    images_file = sparse_dir / "images.txt"
    points_file = sparse_dir / "points3D.txt"

    # ERROR 1: Check if all required files exist
    if not cameras_file.exists():
        result.add_error("cameras.txt not found")
        return result

    if not images_file.exists():
        result.add_error("images.txt not found")
        return result

    if not points_file.exists():
        result.add_error("points3D.txt not found")
        return result

    # Read reconstruction data
    camera_count = read_cameras_text(cameras_file)
    total_images, registered_images = read_images_text(images_file)
    point_count, avg_track_length = read_points3D_text(points_file)

    # Store stats
    result.stats = {
        "Cameras": camera_count,
        "Total images": total_images,
        "Registered images": registered_images,
        "3D points": point_count,
        "Avg track length": f"{avg_track_length:.2f}"
    }

    # ERROR 2: Minimum registered images (at least 3 for stable reconstruction)
    if registered_images < 3:
        result.add_error(f"Too few registered images: {registered_images} (minimum: 3)")
        return result

    # Everything else is just a warning
    # Users can judge quality in 3D viewer

    # Warning: Low camera count
    if camera_count == 0:
        result.add_warning("No cameras found in reconstruction")

    # Warning: Low registered image count
    if registered_images < 5:
        result.add_warning(f"Low registered image count: {registered_images} (recommended: 5+)")

    # Warning: Registration rate
    if total_images > 0:
        registration_rate = registered_images / total_images
        if registration_rate < 0.6:
            result.add_warning(
                f"Low image registration rate: {registration_rate*100:.1f}% "
                f"({registered_images}/{total_images} images registered)"
            )

    # Warning: Low 3D point count
    if point_count < 300:
        result.add_warning(f"Low 3D point count: {point_count} (recommended: 300+)")
    elif point_count < 800:
        result.add_warning(f"Moderate 3D point count: {point_count} (recommended: 800+ for good quality)")

    # Warning: Low average track length
    if avg_track_length < 2.0:
        result.add_warning(f"Low average track length: {avg_track_length:.2f} (recommended: 2.0+)")
    elif avg_track_length < 3.0:
        result.add_warning(f"Moderate average track length: {avg_track_length:.2f} (recommended: 3.0+)")

    # Warning: Low points-to-images ratio
    if registered_images > 0:
        points_per_image = point_count / registered_images
        if points_per_image < 80:
            result.add_warning(f"Sparse reconstruction: {points_per_image:.1f} points/image (recommended: 80+)")

    return result
