"""
Pipeline orchestration and subprocess execution utilities
"""
import asyncio
from pathlib import Path
from typing import Optional
from app.config import settings
from app.utils.system import get_gpu_memory_usage
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


async def run_command(
    cmd: list,
    log_file,
    cwd: Optional[Path] = None,
    env: Optional[dict] = None,
    monitor_gpu: bool = False
) -> None:
    """
    Run subprocess command with logging and optional GPU monitoring

    Args:
        cmd: Command as list of strings
        log_file: File handle for logging
        cwd: Working directory
        env: Environment variables
        monitor_gpu: Whether to monitor GPU memory

    Raises:
        RuntimeError: If command fails
    """
    process = await asyncio.create_subprocess_exec(
        *cmd,
        cwd=(str(cwd) if cwd else None),
        env=env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )

    gpu_check_counter = 0

    while True:
        try:
            chunk = await asyncio.wait_for(process.stdout.read(4096), timeout=1.0)
            if not chunk:
                break
            text = chunk.decode(errors="ignore")
            log_file.write(text)
            log_file.flush()

            if monitor_gpu and settings.MONITOR_GPU:
                gpu_check_counter += 1
                if gpu_check_counter >= settings.GPU_CHECK_INTERVAL:
                    gpu_check_counter = 0
                    gpu_mem = get_gpu_memory_usage()
                    log_file.write(f"\n[GPU Memory] {gpu_mem}\n")
                    log_file.flush()

        except asyncio.TimeoutError:
            if process.returncode is not None:
                break
            if monitor_gpu and settings.MONITOR_GPU:
                gpu_check_counter += 1
                if gpu_check_counter >= settings.GPU_CHECK_INTERVAL:
                    gpu_check_counter = 0
                    gpu_mem = get_gpu_memory_usage()
                    log_file.write(f"\n[GPU Memory] {gpu_mem}\n")
                    log_file.flush()
            continue

    exit_code = await process.wait()
    if exit_code != 0:
        error_msg = f"[ERROR] Command {' '.join(cmd)} exited with code {exit_code}\n"
        log_file.write(error_msg)
        log_file.flush()
        raise RuntimeError(f"Command failed: {' '.join(cmd)} (exit code: {exit_code})")
