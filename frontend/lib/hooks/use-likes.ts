import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { likeApi } from "@/lib/api"
import { productKeys } from "./use-products"

// ============ Query Keys ============
export const likeKeys = {
  all: ["likes"] as const,
  product: (productId: string) => [...likeKeys.all, "product", productId] as const,
}

// ============ 좋아요 추가 ============
export function useAddLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await likeApi.addLike(productId)

      if (!response.success) {
        throw new Error(response.error?.message || "좋아요 추가에 실패했습니다")
      }

      return response.data
    },
    onSuccess: (_, productId) => {
      // 상품 상세 정보 다시 불러오기
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) })
    },
  })
}

// ============ 좋아요 취소 ============
export function useRemoveLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await likeApi.removeLike(productId)

      if (!response.success) {
        throw new Error(response.error?.message || "좋아요 취소에 실패했습니다")
      }

      return response.data
    },
    onSuccess: (_, productId) => {
      // 상품 상세 정보 다시 불러오기
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) })
    },
  })
}
