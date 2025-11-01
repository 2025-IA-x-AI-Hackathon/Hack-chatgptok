"""
Pydantic schemas for Job-related API requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class JobCreateResponse(BaseModel):
    """Response schema after creating a job"""
    job_id: str
    pub_key: str
    original_resolution: bool


class JobStatusResponse(BaseModel):
    """Response schema for job status"""
    job_id: str
    status: str
    step: Optional[str] = None  # IMPLEMENT.md 섹션 E
    progress: Optional[int] = None  # IMPLEMENT.md 섹션 E (0-100)
    log_tail: List[str] = []
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    processing_time_seconds: Optional[float] = None
    image_count: Optional[int] = None
    iterations: Optional[int] = None
    # Removed for MVP: gaussian_count, filtered_count, removed_count, file_size_mb
    colmap_registered_images: Optional[int] = None
    colmap_points: Optional[int] = None
    # Removed for MVP: psnr, ssim, lpips (evaluation metrics)
    viewer_url: Optional[str] = None
    error: Optional[str] = None
    error_stage: Optional[str] = None
    queue_position: Optional[int] = None


class JobListResponse(BaseModel):
    """Response schema for job list"""
    jobs: List[JobStatusResponse]
    total: int
    skip: int
    limit: int
