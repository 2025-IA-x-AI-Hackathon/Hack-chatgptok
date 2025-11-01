import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { productApi } from "@/lib/api"
import type { ProductFormData } from "@/lib/schemas/product"
import type { CreateProductRequest, UpdateProductRequest } from "@/lib/types"

// ============ Query Keys ============
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: { page?: number; limit?: number; sort?: string }) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

// ============ 상품 목록 조회 ============
export function useProducts(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: async () => {
      const response = await productApi.getProducts(params)

      if (!response.success) {
        throw new Error(response.error?.message || "상품 목록을 불러오는데 실패했습니다")
      }

      console.log(response.data)
      return response.data
    },
  })
}

// ============ 상품 목록 무한 스크롤 조회 ============
export function useInfiniteProducts(params?: {
  limit?: number
  status?: string
  search?: string
}) {
  return useInfiniteQuery({
    queryKey: [...productKeys.lists(), "infinite", params || {}],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await productApi.getProducts({
        ...params,
        page: pageParam,
      })

      if (!response.success) {
        throw new Error(response.error?.message || "상품 목록을 불러오는데 실패했습니다")
      }

      return response.data
    },
    getNextPageParam: (lastPage) => {
      // 다음 페이지가 있으면 페이지 번호 반환, 없으면 undefined
      if (!lastPage) return undefined
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })
}

// ============ 상품 상세 조회 ============
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await productApi.getProduct(id)
      if (!response.success) {
        throw new Error(response.error?.message || "상품을 불러오는데 실패했습니다")
      }
      return response.data
    },
  })
}

// ============ 상품 등록 ============
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      // 가격에서 콤마 제거하고 숫자로 변환
      const priceNumber = Number(String(data.price).replace(/[^0-9]/g, ""))

      const requestData: CreateProductRequest = {
        name: data.name,
        price: priceNumber,
        description: data.description,
        images: data.imageKeys,
      }

      const response = await productApi.createProduct(requestData)

      if (!response.success) {
        throw new Error(response.error?.message || "상품 등록에 실패했습니다")
      }

      return response.data
    },
    onSuccess: () => {
      // 상품 목록 캐시 무효화 (새로고침)
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// ============ 상품 수정 ============
export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      // 가격에서 콤마 제거하고 숫자로 변환
      const priceNumber = Number(data.price.replace(/[^0-9]/g, ""))

      const requestData: UpdateProductRequest = {
        name: data.name,
        price: priceNumber,
        description: data.description,

        // TODO: 추후에 바꿔야 함
        ply_url: "",
        thumbnail: ""
      }

      const response = await productApi.updateProduct(id, requestData)

      if (!response.success) {
        throw new Error(response.error?.message || "상품 수정에 실패했습니다")
      }

      return response.data
    },
    onSuccess: () => {
      // 상품 상세 및 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// ============ 상품 삭제 ============
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productApi.deleteProduct(id)

      if (!response.success) {
        throw new Error(response.error?.message || "상품 삭제에 실패했습니다")
      }

      return response.data
    },
    onSuccess: (_, id) => {
      // 삭제된 상품의 상세 캐시 제거
      queryClient.removeQueries({ queryKey: productKeys.detail(id) })
      // 상품 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
