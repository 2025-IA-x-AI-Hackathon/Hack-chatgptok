"""
System utilities (GPU monitoring, etc.)
"""
import subprocess
from typing import Optional


def get_gpu_memory_usage() -> str:
    """Get GPU memory usage using nvidia-smi"""
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=memory.used,memory.total', '--format=csv,noheader,nounits'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            gpu_info = []
            for i, line in enumerate(lines):
                used, total = line.split(',')
                used_mb = int(used.strip())
                total_mb = int(total.strip())
                percent = (used_mb / total_mb * 100) if total_mb > 0 else 0
                gpu_info.append(f"GPU {i}: {used_mb}MB / {total_mb}MB ({percent:.1f}%)")
            return " | ".join(gpu_info)
    except Exception as e:
        return f"GPU memory check failed: {str(e)}"
    return "N/A"
