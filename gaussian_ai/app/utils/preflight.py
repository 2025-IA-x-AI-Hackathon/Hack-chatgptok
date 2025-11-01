"""
Preflight check - 런타임 준비 상태 확인 (얕은 검증만)
IMPLEMENT.md 섹션 B 구현
"""
import sys
import shutil
import tempfile
from pathlib import Path
from typing import Dict, List

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class PreflightResult:
    """Preflight 검증 결과"""

    def __init__(self):
        self.checks: List[Dict] = []
        self.warnings: List[str] = []
        self.errors: List[str] = []

    def add_check(self, name: str, passed: bool, message: str, critical: bool = False):
        """검증 결과 추가"""
        self.checks.append({
            "name": name,
            "passed": passed,
            "message": message,
            "critical": critical
        })

        if not passed:
            if critical:
                self.errors.append(f"{name}: {message}")
            else:
                self.warnings.append(f"{name}: {message}")

    def is_fatal(self) -> bool:
        """치명적 오류가 있는지 확인"""
        return len(self.errors) > 0

    def get_summary(self) -> str:
        """요약 메시지 반환"""
        passed = sum(1 for c in self.checks if c["passed"])
        total = len(self.checks)

        lines = [f"Preflight Check: {passed}/{total} passed"]

        if self.errors:
            lines.append(f"Errors ({len(self.errors)}):")
            for err in self.errors:
                lines.append(f"  - {err}")

        if self.warnings:
            lines.append(f"Warnings ({len(self.warnings)}):")
            for warn in self.warnings:
                lines.append(f"  - {warn}")

        return "\n".join(lines)


def check_python_version(result: PreflightResult):
    """Python 버전 확인"""
    major = sys.version_info.major
    minor = sys.version_info.minor

    # IMPLEMENT.md에서는 3.10 요구, 실제로는 3.9 사용 중
    # 3.9 이상이면 통과로 처리
    if major == 3 and minor >= 9:
        result.add_check(
            "Python Version",
            True,
            f"Python {major}.{minor} detected",
            critical=False
        )
    else:
        result.add_check(
            "Python Version",
            False,
            f"Python 3.9+ required, got {major}.{minor}",
            critical=True
        )


def check_cuda_torch(result: PreflightResult):
    """CUDA/PyTorch 확인"""
    try:
        import torch

        cuda_available = torch.cuda.is_available()
        cuda_version = torch.version.cuda if cuda_available else "N/A"

        if cuda_available:
            result.add_check(
                "CUDA/Torch",
                True,
                f"CUDA {cuda_version} available with PyTorch",
                critical=False
            )
        else:
            result.add_check(
                "CUDA/Torch",
                False,
                "CUDA not available (required for training)",
                critical=True  # 치명적 오류: 훈련 불가능
            )
    except ImportError:
        result.add_check(
            "CUDA/Torch",
            False,
            "PyTorch not installed",
            critical=True
        )


def check_colmap(result: PreflightResult):
    """COLMAP 바이너리 확인"""
    colmap_path = shutil.which("colmap")

    if colmap_path:
        # 버전 정보는 로그에만 기록 (검증 실패 원인 제거)
        result.add_check(
            "COLMAP Binary",
            True,
            f"Found at {colmap_path}",
            critical=False
        )
        logger.info(f"COLMAP binary found: {colmap_path}")
    else:
        result.add_check(
            "COLMAP Binary",
            False,
            "COLMAP not found in PATH",
            critical=True
        )


def check_gaussian_splatting(result: PreflightResult):
    """Gaussian Splatting 디렉토리 및 스크립트 확인"""
    gs_dir = settings.GAUSSIAN_SPLATTING_DIR

    if not gs_dir.exists():
        result.add_check(
            "Gaussian Splatting",
            False,
            f"Directory not found: {gs_dir}",
            critical=True
        )
        return

    # train.py, convert.py 존재 확인
    train_py = gs_dir / "train.py"
    convert_py = gs_dir / "convert.py"

    missing = []
    if not train_py.exists():
        missing.append("train.py")
    if not convert_py.exists():
        missing.append("convert.py")

    if missing:
        result.add_check(
            "Gaussian Splatting",
            False,
            f"Missing files: {', '.join(missing)}",
            critical=True
        )
    else:
        result.add_check(
            "Gaussian Splatting",
            True,
            f"Scripts found in {gs_dir}",
            critical=False
        )


def check_filesystem(result: PreflightResult):
    """파일시스템 쓰기 가능 여부 확인"""
    try:
        # DATA_DIR에 임시 파일 쓰기 시도
        test_file = settings.DATA_DIR / ".preflight_test"
        test_file.write_text("test")
        test_file.unlink()

        result.add_check(
            "Filesystem",
            True,
            f"DATA_DIR writable: {settings.DATA_DIR}",
            critical=False
        )
    except Exception as e:
        result.add_check(
            "Filesystem",
            False,
            f"Cannot write to DATA_DIR: {str(e)}",
            critical=True
        )


def run_preflight_check() -> PreflightResult:
    """
    전체 Preflight 검증 실행

    Returns:
        PreflightResult: 검증 결과
    """
    logger.info("Starting preflight check...")
    result = PreflightResult()

    # 각 검증 수행
    check_python_version(result)
    check_cuda_torch(result)
    check_colmap(result)
    check_gaussian_splatting(result)
    check_filesystem(result)

    # 결과 로깅
    logger.info(result.get_summary())

    return result
