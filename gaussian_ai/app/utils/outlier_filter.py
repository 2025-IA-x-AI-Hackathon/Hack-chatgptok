"""
Outlier filtering utilities for Gaussian Splatting point clouds
"""
import numpy as np
from pathlib import Path
from plyfile import PlyData, PlyElement
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import DBSCAN
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


def filter_outliers(ply_path: Path, output_path: Path, k_neighbors: int = 20,
                   std_threshold: float = 2.0, remove_small_clusters: bool = True,
                   min_cluster_ratio: float = 0.01, cluster_eps: float = None) -> tuple:
    """
    Filter outlier Gaussians based on distance to k nearest neighbors and cluster size.

    Args:
        ply_path: Input PLY file path
        output_path: Output filtered PLY file path
        k_neighbors: Number of neighbors to consider (default: 20)
        std_threshold: Standard deviation threshold for outlier detection (default: 2.0)
        remove_small_clusters: Whether to remove small isolated clusters (default: True)
        min_cluster_ratio: Minimum cluster size as ratio of total points (default: 0.01 = 1%)
        cluster_eps: DBSCAN eps parameter (if None, auto-calculated from mean distance)

    Returns:
        Tuple of (final_count, total_removed)
    """
    logger.info(f"Loading PLY from {ply_path}...")
    plydata = PlyData.read(ply_path)

    vertex = plydata['vertex']
    total_gaussians = len(vertex)
    logger.info(f"Total Gaussians: {total_gaussians}")

    # Extract positions
    positions = np.vstack([vertex['x'], vertex['y'], vertex['z']]).T

    # Compute k-nearest neighbors
    logger.info(f"Computing {k_neighbors} nearest neighbors...")
    nbrs = NearestNeighbors(n_neighbors=k_neighbors+1, algorithm='auto').fit(positions)
    distances, indices = nbrs.kneighbors(positions)

    # Use mean distance to k-nearest neighbors (excluding self)
    mean_distances = distances[:, 1:].mean(axis=1)

    # Filter based on statistical threshold
    mean_dist = mean_distances.mean()
    std_dist = mean_distances.std()
    threshold = mean_dist + std_threshold * std_dist

    logger.info(f"Mean distance: {mean_dist:.4f}, Std: {std_dist:.4f}, Threshold: {threshold:.4f}")

    # Create mask for inliers (step 1: statistical outliers)
    inlier_mask = mean_distances < threshold
    num_inliers = inlier_mask.sum()
    num_outliers = total_gaussians - num_inliers

    logger.info(f"Statistical outliers removed: {num_outliers} ({100*num_outliers/total_gaussians:.1f}%)")

    # Step 2: Remove small isolated clusters
    if remove_small_clusters and num_inliers > 0:
        logger.info("Clustering to identify isolated groups...")

        # Get positions of remaining points
        remaining_positions = positions[inlier_mask]

        # Auto-calculate eps if not provided (use 3x mean distance)
        if cluster_eps is None:
            cluster_eps = mean_dist * 3

        logger.info(f"DBSCAN parameters: eps={cluster_eps:.4f}, min_samples=10")

        # Perform DBSCAN clustering
        clustering = DBSCAN(eps=cluster_eps, min_samples=10, n_jobs=-1).fit(remaining_positions)
        labels = clustering.labels_

        # Count cluster sizes
        unique_labels, counts = np.unique(labels[labels >= 0], return_counts=True)
        num_clusters = len(unique_labels)

        if num_clusters > 0:
            logger.info(f"Found {num_clusters} clusters (excluding noise)")

            # Find largest cluster
            largest_cluster_size = counts[np.argmax(counts)]
            logger.info(f"Largest cluster: {largest_cluster_size} points ({100*largest_cluster_size/num_inliers:.1f}%)")

            # Calculate minimum cluster size threshold
            min_cluster_size = int(num_inliers * min_cluster_ratio)
            logger.info(f"Minimum cluster size threshold: {min_cluster_size} ({min_cluster_ratio*100:.1f}%)")

            # Create mask for points in sufficiently large clusters
            cluster_mask = np.zeros(len(labels), dtype=bool)
            clusters_kept = 0
            total_kept = 0

            for label, count in zip(unique_labels, counts):
                if count >= min_cluster_size:
                    cluster_mask[labels == label] = True
                    clusters_kept += 1
                    total_kept += count

            logger.info(f"Keeping {clusters_kept}/{num_clusters} clusters with {total_kept} points")

            # Update the inlier mask to only include points in large clusters
            full_cluster_mask = np.zeros(total_gaussians, dtype=bool)
            full_cluster_mask[inlier_mask] = cluster_mask

            # Combine both filters
            final_mask = full_cluster_mask

            small_cluster_removed = num_inliers - total_kept
            logger.info(f"Small clusters removed: {small_cluster_removed} points ({100*small_cluster_removed/total_gaussians:.1f}%)")
        else:
            logger.info("No clusters found, keeping all statistical inliers")
            final_mask = inlier_mask
    else:
        final_mask = inlier_mask

    # Final statistics
    final_count = final_mask.sum()
    total_removed = total_gaussians - final_count
    logger.info(f"Total removed: {total_removed} ({100*total_removed/total_gaussians:.1f}%)")
    logger.info(f"Total remaining: {final_count} ({100*final_count/total_gaussians:.1f}%)")

    # Filter vertex data
    filtered_vertex = vertex[final_mask]

    # Create new PLY element
    filtered_element = PlyElement.describe(filtered_vertex, 'vertex')

    # Write filtered PLY
    logger.info(f"Writing filtered PLY to {output_path}...")
    PlyData([filtered_element]).write(output_path)
    logger.info("Outlier filtering complete!")

    return final_count, total_removed
