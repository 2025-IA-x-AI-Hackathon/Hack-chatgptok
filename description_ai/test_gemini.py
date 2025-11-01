"""
Gemini API 호출 테스트 스크립트
이미지 다운로드 → Gemini API 호출 → 응답 파싱의 각 단계를 확인합니다.
"""
import os
import sys
import requests
import io
from PIL import Image

# .env 로드
from dotenv import load_dotenv
load_dotenv()

# Gemini 설정
import google.genai as genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY not found in .env file")
    sys.exit(1)

print(f"✅ API Key loaded: {GEMINI_API_KEY[:20]}...")

# 테스트 이미지 URL
image_url = "https://ss-s3-project.s3.ap-northeast-2.amazonaws.com/images/%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%92%E1%85%A7%E1%86%AB-%E1%84%86%E1%85%A7%E1%86%BC%E1%84%92%E1%85%A1%E1%86%B7%20200%2A160.jpg?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGoaDmFwLW5vcnRoZWFzdC0yIkcwRQIgUThee%2FxscsOgs6pvUiTSJaATn3cb%2FYbdV3Ck%2B7zpskICIQDBnox%2FJmb1nUchAHN8%2BrEsLf9%2Bum0fEergzpKNgqzFUSq5AwgzEAAaDDcyNTc1OTMwOTY0MiIMqQwuT4TIvLRtFqvnKpYD0BKOHCwhfLMjeh%2BVHONJBYp2uWvMBgo9rWgpwwvzPdrF0NANIx71EZPzYt5N3GAngAsbnrNTmhMsvfobNb5dXu1cbUo6aKv1Ml16REkFejX76iMkZVi1TY9ZLtOupXUKWGcDGWBpSmR79EQ%2FPDDb1Qe0DVbI08PHvhi6ZjRD8%2F6JKb9zgG2DGW2%2B6GDW%2B%2FIPZGY1SmjSgRPu22mbEHS2P8noeOkSY2TJA92p9WS%2FkibcpDvnFnre1q%2FvZc3PdFamKAGym%2FBI8FUQCKaiWp%2FKRc0dpjaJWNVRLqtCQXdu0U8USzPNbt1Q0cn%2Bq4JI6ApcLW56uD4W%2FntaCVo%2BB3%2FVwk4nxQ31%2FKbxgeN%2BL8PRHdl%2BDQLWJBDrVu1VrGzrU74Jprm2ArPDMl1GLg%2BsYQz52MKfz2HPgnmAntJNAukTY7g4jlh8AoMoMWI5UDBjyAOYA81psqFoImTpLmNm%2Bq34IiFiX8HPVPp7HFz9OZoOgGVIuCHBkIGhKYlhzJPXweV8ROoCgm9%2BODdNRA9wKhmBe2slfuXwRjDtz5jIBjreAm4G1rDHAI3iv7SZjh43YevPJ0wF43PCYQJ%2BSjhfUPnhpNF2kZNJ714B8tnPYZRqxyq%2BX1ZX7Uj43GWnIaD60gh2ls%2Bg%2BE0vzc6lf25zUtDUSAx2d3Xrw3rWLQFRzoDmr9afesmZarR%2BDHewBsMEGQY1enPMF0zB%2Fh5HpkVEFSPeUklFKiIHq9XIiT0W4A5iEdmlfz1TB5u9ruwYzrP5fvOc3X9HFJr9%2BnG%2FKWh2UkxFvHsP23zExqMB94Gn9YcHOfK0diORnu%2FZXFZ%2BfBaDFxGhAqQPNR3TtiQZVp413C9Daf3zsWKjLX5Cir3OTf5fx23eri2yynS8VCpw9xYLifHD%2FP01S98Edv1imV9xoBbeR5zvB2%2FRfEIcrV%2BtRyDWvuveIbx3pfk7tWrti2PoAN7Kl1RNgaQqe4nBplLmk2xo7SO8c8sohNAQgvN3WgyF4ePGO5TkbSaRTAUcRg8S&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA2R6VAG5FBJXSDTZR%2F20251101%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Date=20251101T174650Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=a62c8f0959dbb65ed06a3dfcc322d1387c61ed2bd6f6b0db0ce7dbb254b63cee"
product_name = "정영현-명함 200*160"

print("\n" + "="*60)
print("단계 1: 이미지 다운로드")
print("="*60)

try:
    response = requests.get(image_url, timeout=10)
    response.raise_for_status()
    image_bytes = response.content
    print(f"✅ 이미지 다운로드 성공: {len(image_bytes)} bytes")
except Exception as e:
    print(f"❌ 이미지 다운로드 실패: {e}")
    sys.exit(1)

print("\n" + "="*60)
print("단계 2: 이미지 리사이즈 (800px, quality 70)")
print("="*60)

try:
    img = Image.open(io.BytesIO(image_bytes))
    print(f"원본 이미지: {img.size}, mode={img.mode}")

    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
        print(f"RGB 변환 완료: mode={img.mode}")

    max_size = 800
    if max(img.size) > max_size:
        ratio = max_size / max(img.size)
        new_size = tuple(int(dim * ratio) for dim in img.size)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        print(f"리사이즈 완료: {img.size}")

    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=70, optimize=True)
    optimized_bytes = buffer.getvalue()
    print(f"✅ 최적화 완료: {len(optimized_bytes)} bytes (압축률: {len(optimized_bytes)/len(image_bytes)*100:.1f}%)")
except Exception as e:
    print(f"❌ 이미지 처리 실패: {e}")
    sys.exit(1)

print("\n" + "="*60)
print("단계 3: Gemini API 호출")
print("="*60)

try:
    client = genai.Client(api_key=GEMINI_API_KEY)

    # 이미지 Part 생성
    image_part = types.Part.from_bytes(
        data=optimized_bytes,
        mime_type="image/jpeg"
    )
    print("✅ 이미지 Part 생성 완료")

    # 프롬프트
    user_prompt = f"""{product_name} 제품을 보고 중고 거래 플랫폼 판매자 관점에서 객관적이고 사실적인 설명을 한 문단(3-5문장)으로 작성해주세요. 색상, 재질, 상태, 사용감 등을 담백하게 기술하세요."""

    print(f"\n프롬프트:")
    print(f"  {user_prompt}")

    # API 호출
    print("\n🔄 Gemini API 호출 중...")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[image_part, user_prompt],
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=500,
            top_p=0.9,
            safety_settings=[
                types.SafetySetting(
                    category="HARM_CATEGORY_HATE_SPEECH",
                    threshold="BLOCK_NONE"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_HARASSMENT",
                    threshold="BLOCK_NONE"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="BLOCK_NONE"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="BLOCK_NONE"
                )
            ]
        )
    )

    print("✅ API 응답 수신")

except Exception as e:
    print(f"❌ Gemini API 호출 실패: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*60)
print("단계 4: 응답 파싱")
print("="*60)

print(f"\nresponse 객체 타입: {type(response)}")
print(f"response 속성: {dir(response)}")

# text 속성 확인
if hasattr(response, 'text'):
    print(f"\nresponse.text exists: {response.text is not None}")
    if response.text:
        print(f"response.text 내용:\n{response.text}")

# candidates 확인
if hasattr(response, 'candidates'):
    print(f"\nresponse.candidates exists: {len(response.candidates)} candidates")

    if response.candidates and len(response.candidates) > 0:
        candidate = response.candidates[0]
        print(f"\ncandidate 0:")
        print(f"  타입: {type(candidate)}")
        print(f"  속성: {dir(candidate)}")

        if hasattr(candidate, 'finish_reason'):
            print(f"  finish_reason: {candidate.finish_reason}")
            print(f"  finish_reason (str): {str(candidate.finish_reason)}")

        if hasattr(candidate, 'content'):
            print(f"  content exists: {candidate.content is not None}")

            if candidate.content:
                print(f"  content 타입: {type(candidate.content)}")
                print(f"  content 속성: {dir(candidate.content)}")

                if hasattr(candidate.content, 'parts'):
                    print(f"  parts 개수: {len(candidate.content.parts) if candidate.content.parts else 0}")

                    if candidate.content.parts:
                        for i, part in enumerate(candidate.content.parts):
                            print(f"\n  part {i}:")
                            print(f"    타입: {type(part)}")
                            print(f"    속성: {dir(part)}")

                            if hasattr(part, 'text'):
                                print(f"    text: {part.text}")

print("\n" + "="*60)
print("✅ 테스트 완료")
print("="*60)
