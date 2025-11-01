"""
SQLAlchemy models for Gaussian Splatting API
"""
from sqlalchemy import Column, String, DateTime, Integer, Float, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import Dict, Any

Base = declarative_base()


class Job(Base):
    """Job model for tracking reconstruction tasks"""
    __tablename__ = "jobs"

    job_id = Column(String(8), primary_key=True, index=True)
    pub_key = Column(String(10), unique=True, index=True, nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED

    # Step tracking (IMPLEMENT.md 섹션 E)
    step = Column(String(30), nullable=True, default="QUEUED")  # QUEUED, PREFLIGHT, COLMAP_FEAT, etc.
    progress = Column(Integer, nullable=True, default=0)  # 0-100

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Configuration
    original_resolution = Column(Boolean, default=False)
    image_count = Column(Integer, default=0)
    iterations = Column(Integer, default=10000)

    # Results - metrics removed for MVP (not needed by users)
    # gaussian_count = Column(Integer, nullable=True)  # Removed
    # filtered_count = Column(Integer, nullable=True)  # Removed
    # removed_count = Column(Integer, nullable=True)   # Removed
    # file_size_mb = Column(Float, nullable=True)      # Removed

    # Evaluation metrics removed (users judge quality in 3D viewer)
    # psnr = Column(Float, nullable=True)   # Removed - saves 30-60s
    # ssim = Column(Float, nullable=True)   # Removed - saves 30-60s
    # lpips = Column(Float, nullable=True)  # Removed - saves 30-60s

    # Error tracking
    error_message = Column(Text, nullable=True)
    error_stage = Column(String(50), nullable=True)
    retry_count = Column(Integer, default=0)

    # Metadata
    colmap_registered_images = Column(Integer, nullable=True)
    colmap_points = Column(Integer, nullable=True)
    processing_time_seconds = Column(Float, nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            "job_id": self.job_id,
            "pub_key": self.pub_key,
            "status": self.status,
            "step": self.step,
            "progress": self.progress,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "original_resolution": self.original_resolution,
            "image_count": self.image_count,
            "iterations": self.iterations,
            # Result metrics removed for MVP
            "error_message": self.error_message,
            "error_stage": self.error_stage,
            "retry_count": self.retry_count,
            "colmap_registered_images": self.colmap_registered_images,
            "colmap_points": self.colmap_points,
            "processing_time_seconds": self.processing_time_seconds,
        }


class ErrorLog(Base):
    """Error log for tracking failures"""
    __tablename__ = "error_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(8), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    stage = Column(String(50), nullable=False)
    error_type = Column(String(100), nullable=False)
    error_message = Column(Text, nullable=False)
    traceback = Column(Text, nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "job_id": self.job_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "stage": self.stage,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "traceback": self.traceback,
        }
