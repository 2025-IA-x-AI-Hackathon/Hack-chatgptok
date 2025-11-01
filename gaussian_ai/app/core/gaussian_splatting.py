"""
Gaussian Splatting training pipeline
"""
import os
import json
import subprocess
from pathlib import Path
from typing import Optional, Dict
from app.config import settings
from app.core.pipeline import run_command
from app.utils.system import get_gpu_memory_usage
from app.utils.logger import setup_logger
from app.utils.outlier_filter import filter_outliers

logger = setup_logger(__name__)


class GaussianSplattingTrainer:
    """Gaussian Splatting training pipeline"""

    def __init__(self, work_dir: Path, output_dir: Path):
        self.work_dir = work_dir
        self.output_dir = output_dir

    async def train(self, log_file, iterations: int = None) -> Path:
        """
        Train Gaussian Splatting model

        Args:
            log_file: File handle for logging
            iterations: Number of training iterations

        Returns:
            Path to iteration directory with results
        """
        iterations = iterations or settings.TRAINING_ITERATIONS

        logger.info(f"Training Gaussian Splatting for {iterations} iterations")

        self.output_dir.mkdir(parents=True, exist_ok=True)

        # GPU memory before training
        gpu_mem_before = get_gpu_memory_usage()
        log_file.write(f">> [GPU Memory - Before Training] {gpu_mem_before}\n")
        log_file.flush()

        gs_script = settings.GAUSSIAN_SPLATTING_DIR / "train.py"

        # Setup environment
        env = os.environ.copy()
        torch_lib = settings.CONDA_PYTHON.parent.parent / "lib" / "python3.9" / "site-packages" / "torch" / "lib"
        env["LD_LIBRARY_PATH"] = f"{torch_lib}:{env.get('LD_LIBRARY_PATH', '')}"
        env["PYTHONPATH"] = str(settings.GAUSSIAN_SPLATTING_DIR)

        cmd = [
            str(settings.CONDA_PYTHON),
            str(gs_script),
            "-s", str(self.work_dir),
            "-m", str(self.output_dir),
            "--iterations", str(iterations),
            "--save_iterations", str(iterations),
            "--densify_until_iter", str(settings.DENSIFY_UNTIL_ITER),
            "--densification_interval", str(settings.DENSIFICATION_INTERVAL),
            "--opacity_reset_interval", str(settings.OPACITY_RESET_INTERVAL),
            "--resolution", "1",
            "--eval"  # Enable evaluation metrics
        ]

        await run_command(cmd, log_file, env=env, monitor_gpu=True)

        # GPU memory after training
        gpu_mem_after = get_gpu_memory_usage()
        log_file.write(f">> [GPU Memory - After Training] {gpu_mem_after}\n")
        log_file.flush()

        iteration_dir = self.output_dir / "point_cloud" / f"iteration_{iterations}"
        return iteration_dir

    async def evaluate(self, log_file, iterations: int = None) -> Optional[Dict]:
        """
        Run full evaluation pipeline: render test set and compute metrics

        Args:
            log_file: File handle for logging
            iterations: Number of iterations (defaults to settings.TRAINING_ITERATIONS)

        Returns:
            Dictionary with metrics (psnr, ssim, lpips) if successful, None otherwise
        """
        iterations = iterations or settings.TRAINING_ITERATIONS

        log_file.write(">> [EVALUATION] Starting final model evaluation...\n")
        log_file.flush()

        # Setup environment
        env = os.environ.copy()
        torch_lib = settings.CONDA_PYTHON.parent.parent / "lib" / "python3.9" / "site-packages" / "torch" / "lib"
        env["LD_LIBRARY_PATH"] = f"{torch_lib}:{env.get('LD_LIBRARY_PATH', '')}"
        env["PYTHONPATH"] = str(settings.GAUSSIAN_SPLATTING_DIR)

        # Step 1: Render test set
        log_file.write(">> [EVALUATION] Rendering test set with trained model...\n")
        log_file.flush()

        render_script = settings.GAUSSIAN_SPLATTING_DIR / "render.py"
        render_cmd = [
            str(settings.CONDA_PYTHON),
            str(render_script),
            "-m", str(self.output_dir),
            "--iteration", str(iterations),
            "--skip_train"  # Only render test set
        ]

        try:
            await run_command(render_cmd, log_file, env=env, monitor_gpu=False)
            log_file.write(">> [EVALUATION] Test set rendering complete!\n")
        except Exception as e:
            logger.error(f"Rendering failed: {e}")
            log_file.write(f">> [EVALUATION] Error: Rendering failed: {e}\n")
            log_file.flush()
            return None

        # Step 2: Compute metrics
        log_file.write(">> [EVALUATION] Computing PSNR, SSIM, LPIPS metrics...\n")
        log_file.flush()

        metrics_script = settings.GAUSSIAN_SPLATTING_DIR / "metrics.py"
        metrics_cmd = [
            str(settings.CONDA_PYTHON),
            str(metrics_script),
            "-m", str(self.output_dir)
        ]

        try:
            await run_command(metrics_cmd, log_file, env=env, monitor_gpu=False)
            log_file.write(">> [EVALUATION] Metrics computation complete!\n")
        except Exception as e:
            logger.error(f"Metrics computation failed: {e}")
            log_file.write(f">> [EVALUATION] Error: Metrics computation failed: {e}\n")
            log_file.flush()
            return None

        # Step 3: Parse results.json
        results_json = self.output_dir / "results.json"
        metrics = None

        if results_json.exists():
            log_file.write(">> [EVALUATION] Parsing results.json...\n")
            log_file.flush()

            try:
                with open(results_json, 'r') as f:
                    results = json.load(f)

                # Extract overall metrics for the specific iteration
                iteration_key = f"ours_{iterations}"
                if iteration_key in results:
                    ours = results[iteration_key]
                    metrics = {
                        "psnr": ours.get("PSNR"),
                        "ssim": ours.get("SSIM"),
                        "lpips": ours.get("LPIPS")
                    }
                    log_file.write(f">> [EVALUATION] PSNR: {metrics['psnr']:.2f} dB\n")
                    log_file.write(f">> [EVALUATION] SSIM: {metrics['ssim']:.4f}\n")
                    log_file.write(f">> [EVALUATION] LPIPS: {metrics['lpips']:.4f}\n")
                    logger.info(f"Evaluation metrics: PSNR={metrics['psnr']}, SSIM={metrics['ssim']}, LPIPS={metrics['lpips']}")
                else:
                    log_file.write(f">> [EVALUATION] Warning: No '{iteration_key}' key found in results.json\n")
            except Exception as e:
                logger.error(f"Failed to parse results.json: {e}")
                log_file.write(f">> [EVALUATION] Error: Failed to parse results.json: {e}\n")
        else:
            log_file.write(">> [EVALUATION] Error: results.json not found\n")

        log_file.flush()
        return metrics

    def post_process(self, iteration_dir: Path, log_file) -> Optional[Dict]:
        """
        Post-process results: outlier filtering + GZIP compression

        Args:
            iteration_dir: Directory containing iteration results
            log_file: File handle for logging

        Returns:
            None
        """
        import gzip

        ply_file = iteration_dir / "point_cloud.ply"
        filtered_ply = iteration_dir / "point_cloud_filtered.ply"

        if not ply_file.exists():
            log_file.write(">> Warning: point_cloud.ply not found\n")
            log_file.flush()
            return None

        # Outlier filtering
        if not filtered_ply.exists():
            log_file.write(">> Applying outlier filtering...\n")
            log_file.flush()

            try:
                filter_outliers(
                    ply_file,
                    filtered_ply,
                    k_neighbors=settings.OUTLIER_K_NEIGHBORS,
                    std_threshold=settings.OUTLIER_STD_THRESHOLD,
                    remove_small_clusters=settings.OUTLIER_REMOVE_SMALL_CLUSTERS,
                    min_cluster_ratio=settings.OUTLIER_MIN_CLUSTER_RATIO
                )
                log_file.write(">> Outlier filtering complete!\n")
            except Exception as e:
                logger.error(f"Outlier filtering failed: {e}")
                log_file.write(f">> Warning: Outlier filtering failed: {e}\n")
            log_file.flush()

        # GZIP compression for both files
        for source_file in [ply_file, filtered_ply]:
            if not source_file.exists():
                continue

            log_file.write(f">> Compressing {source_file.name}...\n")
            log_file.flush()

            try:
                gz_path = source_file.with_suffix('.ply.gz')
                if not gz_path.exists():
                    with open(source_file, 'rb') as f_in:
                        with gzip.open(gz_path, 'wb', compresslevel=6) as f_out:
                            f_out.write(f_in.read())

                    original_size = source_file.stat().st_size / 1024 / 1024
                    compressed_size = gz_path.stat().st_size / 1024 / 1024
                    ratio = (1 - compressed_size / original_size) * 100

                    log_file.write(
                        f">> Compressed {source_file.name}: "
                        f"{original_size:.1f}MB → {compressed_size:.1f}MB ({ratio:.1f}% reduction)\n"
                    )
            except Exception as e:
                logger.error(f"Compression failed for {source_file.name}: {e}")
                log_file.write(f">> Warning: Compression failed for {source_file.name}: {e}\n")

        log_file.flush()
        return None
