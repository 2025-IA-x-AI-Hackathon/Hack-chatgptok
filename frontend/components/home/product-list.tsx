"use client";

import { Heart, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";

// 가격 포맷 함수
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
};

// 상품 아이템 Skeleton 컴포넌트
function ProductItemSkeleton() {
    return (
        <div className="flex gap-4 p-4">
            <Skeleton className="w-24 h-24 shrink-0 rounded-lg" />
            <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-end justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
        </div>
    );
}

export default function ProductList() {
    const { data, isLoading, error, refetch } = useProducts({ page: 1, limit: 20, status: "ACTIVE" });

    console.log(data)

    return (
        <div className="fixed inset-0 flex flex-col bg-background pb-16">
            {/* 고정 헤더 */}
            <div className="shrink-0 bg-background">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h2 className="text-2xl font-bold">인기 상품</h2>
                </div>
            </div>


            {/* 상품 목록 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {isLoading && (
                        <div className="flex flex-col divide-y divide-border">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <ProductItemSkeleton key={index} />
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <p className="text-red-600 text-center mb-4">
                                오류가 발생했습니다: {error.message}
                            </p>
                            <button
                                onClick={() => refetch()}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                재시도
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && data && data.products.length === 0 && (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
                        </div>
                    )}
                    

                    {!isLoading && !error && data && data.products.length > 0 && (
                        <div className="flex flex-col divide-y divide-border">
                            {data.products.map((product) => (
                                <Link
                                    key={product.product_id}
                                    href={`/products/${product.product_id}`}
                                    className="group"
                                >
                                    <div className="flex gap-4 p-4 hover:bg-accent transition-colors">
                                        {/* 상품 썸네일 */}
                                        <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                                            <Image
                                                src="https://placehold.co/800x800"
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                                sizes="96px"
                                                unoptimized
                                            />
                                        </div>

                                        {/* 상품 정보 */}
                                        <div className="flex flex-col justify-between flex-1 min-w-0">
                                            <div>
                                                <h3 className="text-base font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <p className="text-lg font-bold">
                                                    {formatPrice(product.price)}
                                                </p>
                                                {/* 좋아요 */}
                                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{product.likes_cnt}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 상품 등록 플로팅 버튼 */}
            <Link
                href="/products/new"
                className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-40"
            >
                <Plus className="w-6 h-6" />
            </Link>
        </div>
    );
}
