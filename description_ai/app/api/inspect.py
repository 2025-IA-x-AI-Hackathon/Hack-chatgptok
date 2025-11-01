"""
결함 분석 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException
import logging
import asyncio
from datetime import datetime, timezone
from typing import List

from app.schemas.inspection import (
    ProductAnalysisRequest,
    ProductAnalysisResult,
    ImageInspectionResult,
    DescriptionRequest,
    DescriptionResult
)
from app.services.gemini_inspector import analyze_defects, generate_product_description

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/inspect", tags=["inspection"])


@router.post("/fault_desc", response_model=ProductAnalysisResult)
async def fault_desc(request: ProductAnalysisRequest):
    """
    제품 전체 이미지 일괄 분석 (RDS 연동용)

    RDS에서 제품 정보를 받아 모든 이미지를 분석하고, 종합 결과를 마크다운으로 반환합니다.

    **워크플로우:**
    1. 모든 이미지 배치 분석 (5개씩, Rate Limit 회피)
    2. 결과 종합 (상위 70% 가중 평균)
    3. 마크다운 요약 생성
    4. RDS가 fault_description 테이블에 저장

    **비용:**
    - 무료 티어: 월 1,500개 이미지 분석
    - 유료: 이미지당 ~$0.00044

    **타임아웃:** 90초

    Args:
        request: 제품 분석 요청 (product_id, s3_images, product_name, product_description)

    Returns:
        ProductAnalysisResult: 종합 분석 결과 + 마크다운 요약
    """
    async def _process_product():
        import time
        start_time = time.time()
        timeout_limit = 85.0  # 90초 중 85초까지만 사용 (안전 마진)

        logger.info(
            f"Starting product analysis: product_id={request.product_id}, "
            f"images={len(request.s3_images)}"
        )

        # 2. 모든 이미지 배치 분석 (Rate Limit 회피)
        # Gemini 무료 티어: 15 RPM → 5개씩 배치 처리
        batch_size = 5
        all_results = []
        processed_images = []
        timed_out = False

        for i in range(0, len(request.s3_images), batch_size):
            # 타임아웃 체크 (배치 시작 전)
            elapsed = time.time() - start_time
            if elapsed >= timeout_limit:
                logger.warning(f"Timeout approaching ({elapsed:.1f}s), stopping early")
                timed_out = True
                break

            batch_images = request.s3_images[i:i+batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}/{(len(request.s3_images)-1)//batch_size + 1}")

            # 배치 내에서는 병렬 처리
            tasks = [
                analyze_defects(s3_path=img_path, item_category="물품")
                for img_path in batch_images
            ]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            all_results.extend(batch_results)
            processed_images.extend(batch_images)

            # 마지막 배치가 아니면 4초 대기 (RPM 제한 회피)
            if i + batch_size < len(request.s3_images):
                await asyncio.sleep(4)

        results = all_results
        images_to_process = processed_images

        # 3. 결과 취합 (성공한 이미지만)
        inspection_results: List[ImageInspectionResult] = []
        failed_count = 0
        total_defects = 0
        skipped_count = len(request.s3_images) - len(images_to_process)

        for img_path, result in zip(images_to_process, results):
            if isinstance(result, Exception):
                logger.error(f"Image analysis failed: {img_path}, error: {result}")
                failed_count += 1
                # 실패한 이미지는 종합 평가에서 제외
            else:
                inspection_results.append(ImageInspectionResult(
                    image_path=img_path,
                    defects=result.defects,
                    overall_condition=result.overall_condition,
                    recommended_price_adjustment=result.recommended_price_adjustment,
                    analysis_confidence=result.analysis_confidence
                ))
                total_defects += len(result.defects)

        # 분석 성공한 이미지가 없으면 에러 마크다운 생성
        if not inspection_results:
            markdown = _generate_error_markdown(
                total_images=len(request.s3_images),
                processed_images=len(images_to_process),
                failed_count=failed_count,
                skipped_count=skipped_count,
                timed_out=timed_out
            )
            return ProductAnalysisResult(
                product_id=request.product_id,
                inspection_results=[],
                aggregated_condition="D",
                aggregated_price_adjustment=-100,
                total_defects_count=0,
                markdown_summary=markdown,
                completed_at=datetime.now(timezone.utc).isoformat()
            )

        logger.info(f"Analysis complete: {len(inspection_results)} succeeded, {failed_count} failed")

        # 4. 종합 평가 (상위 70% 가중 평균 - 이상치 제거)
        condition_order = {"S": 0, "A": 1, "B": 2, "C": 3, "D": 4}
        condition_scores = [condition_order[r.overall_condition] for r in inspection_results]

        # 정렬 후 상위 70% 선택
        sorted_scores = sorted(condition_scores)
        top_70_count = max(1, int(len(sorted_scores) * 0.7))
        top_70_scores = sorted_scores[:top_70_count]

        # 평균 계산 후 가장 가까운 등급 선택
        avg_score = sum(top_70_scores) / len(top_70_scores)
        aggregated_condition = min(condition_order.keys(), key=lambda x: abs(condition_order[x] - avg_score))

        # 종합 가격 조정 (상위 70% 평균)
        adjustments = [r.recommended_price_adjustment for r in inspection_results]
        sorted_adjustments = sorted(adjustments, reverse=True)  # 할인율이 작은 순
        top_70_adj = sorted_adjustments[:top_70_count]
        aggregated_adjustment = int(sum(top_70_adj) / len(top_70_adj))

        # 5. 마크다운 요약 생성
        markdown = _generate_markdown_summary(
            product_name=request.product_name or "제품",
            overall_condition=aggregated_condition,
            price_adjustment=aggregated_adjustment,
            inspection_results=inspection_results,
            images_analyzed=len(inspection_results),
            images_failed=failed_count,
            images_skipped=skipped_count,
            timed_out=timed_out
        )

        # 6. 완료 시간
        completed_at = datetime.now(timezone.utc).isoformat()

        logger.info(
            f"Product analysis complete: product_id={request.product_id}, "
            f"condition={aggregated_condition}, defects={total_defects}"
        )

        return ProductAnalysisResult(
            product_id=request.product_id,
            inspection_results=inspection_results,
            aggregated_condition=aggregated_condition,
            aggregated_price_adjustment=aggregated_adjustment,
            total_defects_count=total_defects,
            markdown_summary=markdown,
            completed_at=completed_at
        )

    # 타임아웃 처리 (백업용, 내부에서 85초에 조기 종료)
    try:
        return await asyncio.wait_for(_process_product(), timeout=95.0)
    except asyncio.TimeoutError:
        # 내부 조기 종료가 실패한 경우 (예외적 상황)
        logger.error(f"Hard timeout reached: product_id={request.product_id}")
        # 에러 마크다운과 함께 응답 반환
        markdown = _generate_error_markdown(
            total_images=len(request.s3_images),
            processed_images=0,
            failed_count=0,
            skipped_count=len(request.s3_images),
            timed_out=True
        )
        return ProductAnalysisResult(
            product_id=request.product_id,
            inspection_results=[],
            aggregated_condition="D",
            aggregated_price_adjustment=-100,
            total_defects_count=0,
            markdown_summary=markdown,
            completed_at=datetime.now(timezone.utc).isoformat()
        )
    except Exception as e:
        logger.error(f"Product analysis failed: {str(e)}")
        # 일반 에러도 마크다운으로 반환
        markdown = f"# 결함 분석 결과\n\n❌ **시스템 오류**: {str(e)}\n\n문의: 시스템 관리자에게 연락하세요.\n"
        return ProductAnalysisResult(
            product_id=request.product_id,
            inspection_results=[],
            aggregated_condition="D",
            aggregated_price_adjustment=-100,
            total_defects_count=0,
            markdown_summary=markdown,
            completed_at=datetime.now(timezone.utc).isoformat()
        )


def _generate_markdown_summary(
    product_name: str,
    overall_condition: str,
    price_adjustment: int,
    inspection_results: List[ImageInspectionResult],
    images_analyzed: int,
    images_failed: int,
    images_skipped: int = 0,
    timed_out: bool = False
) -> str:
    """마크다운 결함 요약 생성 (통합 형식)"""
    condition_labels = {
        "S": "최상 (거의 새것)",
        "A": "우수 (미세한 사용감)",
        "B": "양호 (약간의 결함)",
        "C": "보통 (눈에 띄는 결함)",
        "D": "불량 (심각한 결함)"
    }

    md = f"# 결함 분석 결과\n\n"

    # 타임아웃 경고
    if timed_out or images_skipped > 0:
        md += "⚠️ **주의**: 처리 시간 제한으로 인해 일부 이미지만 분석되었습니다.\n\n"
        md += f"- 전체 이미지: {images_analyzed + images_failed + images_skipped}장\n"
        md += f"- 분석 완료: {images_analyzed}장\n"
        if images_failed > 0:
            md += f"- 분석 실패: {images_failed}장\n"
        if images_skipped > 0:
            md += f"- 시간 초과로 미분석: {images_skipped}장\n"
        md += "\n"

    md += f"**전체 상태 등급**: {overall_condition} - {condition_labels.get(overall_condition, '알 수 없음')}\n\n"

    # 결함 수집 및 위치별 그룹화
    all_defects = []
    for result in inspection_results:
        all_defects.extend(result.defects)

    md += f"**발견된 결함**: {len(all_defects)}건\n\n"

    if len(all_defects) == 0:
        md += "## ✅ 결함 없음\n\n"
        md += "분석한 이미지에서 특별한 결함이 발견되지 않았습니다.\n"
    else:
        md += "## 🔍 발견된 결함\n\n"

        # 결함을 하나씩 나열 (위치 중심)
        for idx, defect in enumerate(all_defects, 1):
            md += f"{idx}. **{defect.type}** ({defect.severity}) - {defect.location}\n"
            md += f"   - {defect.description}\n\n"

    # 추가 정보
    md += "---\n\n"
    md += f"*분석 모델: Google Gemini 2.5 Flash*\n\n"
    md += f"*분석 일시: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}*\n"

    return md


def _generate_error_markdown(
    total_images: int,
    processed_images: int,
    failed_count: int,
    skipped_count: int,
    timed_out: bool
) -> str:
    """에러 상황에 대한 마크다운 생성"""
    md = f"# 결함 분석 결과\n\n"
    md += "❌ **분석 실패**: 모든 이미지 분석에 실패했습니다.\n\n"

    if timed_out:
        md += "⚠️ **원인**: 처리 시간 제한 (90초) 초과\n\n"

    md += f"**상태 정보**:\n"
    md += f"- 전체 이미지: {total_images}장\n"
    md += f"- 처리 시도: {processed_images}장\n"
    md += f"- 분석 실패: {failed_count}장\n"

    if skipped_count > 0:
        md += f"- 시간 초과로 미분석: {skipped_count}장\n"

    md += "\n**권장 조치**:\n"
    md += "1. 이미지 수를 줄여서 다시 시도해보세요 (권장: 10-20장)\n"
    md += "2. 이미지 파일 크기를 확인해보세요 (권장: 5MB 이하)\n"
    md += "3. S3 경로가 올바른지 확인해보세요\n\n"

    md += "---\n\n"
    md += f"*분석 일시: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}*\n"

    return md


@router.post("/analyze_desc", response_model=DescriptionResult)
async def analyze_desc(request: DescriptionRequest):
    """
    제품 이미지로부터 판매자 스타일의 제품 설명 생성 (Frontend 연동)

    첫 번째 제품 이미지를 보고 AI가 자동으로 제품 설명을 생성합니다.
    유저는 생성된 설명을 확인하고 수정할 수 있습니다.

    **특징:**
    - Google Gemini 2.5 Flash 사용
    - 판매자 작성 스타일 (객관적, 사실 기반)
    - 한 문단 길이 (3-5문장)
    - 타임아웃 없음 (단일 이미지, 빠른 응답)

    **응답 예시:**
    ```json
    {
      "description": "깨끗한 상태의 나이키 에어포스 1 화이트입니다. 전반적으로 사용감이 적으며 밑창과 어퍼 상태가 양호합니다."
    }
    ```

    Args:
        request: 제품 설명 생성 요청 (s3_image, product_name)

    Returns:
        DescriptionResult: AI 생성 제품 설명

    Raises:
        HTTPException: 생성 실패 시
    """
    try:
        logger.info(
            f"Starting description generation: s3_path={request.s3_path}, "
            f"product_name={request.product_name}"
        )

        # Gemini로 제품 설명 생성 (비동기)
        description = await generate_product_description(
            s3_path=request.s3_path,
            product_name=request.product_name
        )

        logger.info(
            f"Description generated successfully: length={len(description)}"
        )

        return DescriptionResult(description=description)

    except Exception as e:
        logger.error(f"Description generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"제품 설명 생성 실패: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    서비스 상태 확인

    Returns:
        서비스 상태 정보
    """
    from app.config import settings

    try:
        # Gemini API 키 확인
        if not settings.GEMINI_API_KEY:
            return {
                "status": "unhealthy",
                "error": "Gemini API key not configured",
                "hint": "Set GEMINI_API_KEY in .env file"
            }

        # AWS 자격 증명 확인 (선택)
        import boto3
        try:
            sts = boto3.client('sts')
            identity = sts.get_caller_identity()
            aws_info = {
                "aws_account": identity.get('Account'),
                "aws_user": identity.get('Arn')
            }
        except Exception:
            aws_info = {
                "aws_account": "Using default credentials or not configured"
            }

        return {
            "status": "healthy",
            "service": "fault-detection",
            "model": settings.GEMINI_MODEL,
            "free_tier": "1,500 requests/month",
            **aws_info
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
