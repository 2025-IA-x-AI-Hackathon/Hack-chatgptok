import { z } from "zod"

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "상품명을 입력해주세요")
    .max(100, "상품명은 최대 100자까지 입력 가능합니다"),
  price: z
    .string()
    .min(1, "가격을 입력해주세요")
    .refine(
      (val) => {
        const num = Number(val.replace(/[^0-9]/g, ''))
        return num > 0
      },
      { message: "가격은 0보다 커야 합니다" }
    ),
  description: z
    .string()
    .min(1, "설명을 입력해주세요")
    .max(2000, "설명은 최대 2000자까지 입력 가능합니다"),
  imageUrls: z
    .array(z.string())
    .min(1, "최소 1개의 이미지를 추가해주세요")
    .max(10, "최대 10개까지 이미지를 추가할 수 있습니다"),
  imageKeys: z.array(z.string()), // S3 업로드된 이미지 URL들
})

export type ProductFormData = z.infer<typeof productFormSchema>
