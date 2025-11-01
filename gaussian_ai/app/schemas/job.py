"""
Pydantic schemas for Job-related API requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class JobCreateRequest(BaseModel):
    """Request schema for creating a job"""
    product_id: str = Field(..., description="Product UUID")
    s3_images: List[str] = Field(..., description="List of S3 image paths (s3://bucket/key)")
    iterations: Optional[int] = Field(None, description="Training iterations (default: 10000)")


class JobCreateResponse(BaseModel):
    """Response schema after creating a job"""
    product_id: str
    status: str
    message: str


class JobStatusResponse(BaseModel):
    """Response schema for job status"""
    product_id: str
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
