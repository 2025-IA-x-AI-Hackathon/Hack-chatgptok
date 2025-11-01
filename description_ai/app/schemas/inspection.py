"""
Inspection data schemas
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Defect(BaseModel):
    """결함 정보"""
    type: str = Field(..., description="결함 종류 (스크래치, 변색, 찢어짐, 오염 등)")
    severity: str = Field(..., description="심각도 (상/중/하)")
    location: str = Field(..., description="결함 위치")
    description: str = Field(..., description="상세 설명")


class InspectionResult(BaseModel):
    """검수 결과"""
    defects: List[Defect] = Field(default_factory=list, description="발견된 결함 목록")
    overall_condition: str = Field(..., description="전체 상태 등급 (S/A/B/C/D)")
    recommended_price_adjustment: int = Field(..., description="가격 조정 제안 (%)")
    analysis_confidence: float = Field(..., description="분석 신뢰도 (0-1)")
    raw_response: Optional[str] = Field(None, description="OpenAI 원본 응답")


class InspectRequest(BaseModel):
    """결함 분석 요청"""
    s3_path: str = Field(..., description="S3 이미지 경로 (s3://bucket/key)")
    item_category: str = Field(default="물품", description="물품 카테고리 (신발, 가방, 의류 등)")

    class Config:
        json_schema_extra = {
            "example": {
                "s3_path": "s3://ss-s3-project/images/shoe.jpg",
                "item_category": "신발"
            }
        }


class DescriptionRequest(BaseModel):
    """제품 설명 생성 요청 (Frontend 연동)"""
    s3_path: str = Field(..., description="제품 이미지 S3 경로 (s3://bucket/key)")
    product_name: str = Field(..., description="제품명")

    class Config:
        json_schema_extra = {
            "example": {
                "s3_path": "s3://ss-s3-project/products/img1.jpg",
                "product_name": "나이키 에어포스 1 화이트"
            }
        }


class DescriptionResult(BaseModel):
    """제품 설명 생성 결과"""
    description: str = Field(..., description="AI 생성 제품 설명 (판매자 스타일, 한 문단)")

    class Config:
        json_schema_extra = {
            "example": {
                "description": "깨끗한 상태의 나이키 에어포스 1 화이트입니다. 전반적으로 사용감이 적으며 밑창과 어퍼 상태가 양호합니다. 화이트 컬러가 선명하게 유지되어 있으며 착용감이 우수한 클래식 모델입니다."
            }
        }


class ProductAnalysisRequest(BaseModel):
    """제품 결함 분석 요청 (RDS 연동)"""
    product_id: str = Field(..., description="제품 ID (UUID)")
    s3_images: List[str] = Field(..., description="S3 이미지 경로 리스트")
    product_name: Optional[str] = Field(None, description="제품명")

    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "550e8400-e29b-41d4-a716-446655440000",
                "s3_images": [
                    "s3://ss-s3-project/products/550e8400/img1.jpg",
                    "s3://ss-s3-project/products/550e8400/img2.jpg"
                ],
                "product_name": "나이키 에어포스 1 화이트"
            }
        }


class ImageInspectionResult(BaseModel):
    """이미지별 검수 결과"""
    image_path: str = Field(..., description="이미지 S3 경로")
    defects: List[Defect] = Field(default_factory=list, description="발견된 결함 목록")
    overall_condition: str = Field(..., description="전체 상태 등급 (S/A/B/C/D)")
    recommended_price_adjustment: int = Field(..., description="가격 조정 제안 (%)")
    analysis_confidence: float = Field(..., description="분석 신뢰도 (0-1)")


class ProductAnalysisResult(BaseModel):
    """제품 결함 분석 결과 (RDS 반환용)"""
    product_id: str = Field(..., description="제품 ID")
    inspection_results: List[ImageInspectionResult] = Field(..., description="이미지별 분석 결과")
    aggregated_condition: str = Field(..., description="종합 상태 등급 (최악 등급)")
    aggregated_price_adjustment: int = Field(..., description="종합 가격 조정 (최대 할인)")
    total_defects_count: int = Field(..., description="총 결함 개수")
    markdown_summary: str = Field(..., description="마크다운 결함 요약")
    completed_at: str = Field(..., description="완료 시간 (ISO 8601)")

    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "550e8400-e29b-41d4-a716-446655440000",
                "inspection_results": [
                    {
                        "image_path": "s3://ss-s3-project/products/550e8400/img1.jpg",
                        "defects": [
                            {
                                "type": "스크래치",
                                "severity": "중",
                                "location": "왼쪽 앞코",
                                "description": "3cm 길이의 깊은 스크래치"
                            }
                        ],
                        "overall_condition": "B",
                        "recommended_price_adjustment": -15,
                        "analysis_confidence": 0.92
                    }
                ],
                "aggregated_condition": "B",
                "aggregated_price_adjustment": -15,
                "total_defects_count": 1,
                "markdown_summary": "## 결함 분석 결과\n\n- **상태 등급**: B (양호)\n- **가격 조정**: -15%\n\n### 발견된 결함\n1. 스크래치 (중) - 왼쪽 앞코",
                "completed_at": "2025-11-01T12:34:56Z"
            }
        }
