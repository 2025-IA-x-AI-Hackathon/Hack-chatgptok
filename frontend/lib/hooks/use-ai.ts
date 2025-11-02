/**
 * AI 기능 관련 React Query 훅
 */

import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/lib/api";
import type { GenerateDescriptionRequest } from "@/lib/types";

/**
 * AI 상품 설명 생성
 */
export function useGenerateDescription() {
    return useMutation({
        mutationFn: async (data: GenerateDescriptionRequest) => {
            const response = await aiApi.generateDescription(data);

            if (!response.success || !response.data) {
                throw new Error(response.error?.message || "AI 설명 생성에 실패했습니다.");
            }

            return response.data;
        },
    });
}
