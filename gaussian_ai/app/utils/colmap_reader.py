"""
COLMAP data reader utilities
"""
import numpy as np
from pathlib import Path
from typing import Optional, Tuple
import math


def qvec2rotmat(qvec):
    """
    Convert quaternion to rotation matrix

    Args:
        qvec: Quaternion [qw, qx, qy, qz]

    Returns:
        3x3 rotation matrix
    """
    qw, qx, qy, qz = qvec

    return np.array([
        [1 - 2*qy**2 - 2*qz**2, 2*qx*qy - 2*qz*qw, 2*qx*qz + 2*qy*qw],
        [2*qx*qy + 2*qz*qw, 1 - 2*qx**2 - 2*qz**2, 2*qy*qz - 2*qx*qw],
        [2*qx*qz - 2*qy*qw, 2*qy*qz + 2*qx*qw, 1 - 2*qx**2 - 2*qy**2]
    ])


def read_first_camera_position(colmap_sparse_dir: Path) -> Optional[Tuple[float, float, float]]:
    """
    Read first camera position from COLMAP sparse reconstruction

    Args:
        colmap_sparse_dir: Path to COLMAP sparse directory (e.g., sparse/0)

    Returns:
        Camera world position (x, y, z) or None if not found
    """
    images_txt = colmap_sparse_dir / "images.txt"

    if not images_txt.exists():
        return None

    try:
        with open(images_txt, 'r') as f:
            for line in f:
                # Skip comments
                if line.startswith('#'):
                    continue

                # Skip empty lines
                line = line.strip()
                if not line:
                    continue

                # Parse image line
                # Format: IMAGE_ID, QW, QX, QY, QZ, TX, TY, TZ, CAMERA_ID, NAME
                parts = line.split()
                if len(parts) < 8:
                    continue

                try:
                    # Extract quaternion and translation
                    qw, qx, qy, qz = map(float, parts[1:5])
                    tx, ty, tz = map(float, parts[5:8])

                    # Convert to rotation matrix
                    R = qvec2rotmat([qw, qx, qy, qz])
                    T = np.array([tx, ty, tz])

                    # Camera world position: C = -R^T * T
                    C = -R.T @ T

                    return float(C[0]), float(C[1]), float(C[2])

                except (ValueError, IndexError):
                    continue

        return None

    except Exception as e:
        print(f"Error reading COLMAP images.txt: {e}")
        return None


def rotate_position_180(x: float, y: float, z: float) -> Tuple[float, float, float]:
    """
    Rotate camera position 180 degrees around Y axis (looking from opposite side)

    Args:
        x, y, z: Original camera position

    Returns:
        Rotated position (x', y, z')
    """
    # Calculate distance from origin in XZ plane
    radius = math.sqrt(x**2 + z**2)

    # Calculate current angle
    angle = math.atan2(z, x)

    # Add 180 degrees (π radians)
    new_angle = angle + math.pi

    # Calculate new position
    new_x = radius * math.cos(new_angle)
    new_z = radius * math.sin(new_angle)

    # Y remains the same (rotate around Y axis)
    return new_x, y, new_z


def get_camera_position_for_viewer(job_dir: Path, rotate_180: bool = False) -> Optional[Tuple[float, float, float]]:
    """
    Get camera position for viewer from COLMAP reconstruction

    Args:
        job_dir: Job output directory (e.g., data/jobs/abc123/output)
        rotate_180: If True, rotate camera position 180 degrees

    Returns:
        Camera position (x, y, z) or None if not found
    """
    # Check sparse/0 directory
    sparse_dir = job_dir / "sparse" / "0"

    if not sparse_dir.exists():
        return None

    # Get first camera position
    pos = read_first_camera_position(sparse_dir)

    if pos is None:
        return None

    # Rotate 180 degrees if requested
    if rotate_180:
        pos = rotate_position_180(*pos)

    return pos
