"use client";

import { Heart, Plus, RefreshCw, Loader2, Eye, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteProducts } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { Product } from "@/lib/types";

// 가격 포맷 함수
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
};

// 날짜 포맷 함수
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR");
};

// 상품 아이템 Skeleton 컴포넌트
function ProductItemSkeleton() {
    return (
        <div className="flex gap-6 p-6">
            <Skeleton className="w-40 h-40 shrink-0 rounded-lg" />
            <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-end justify-between">
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
        </div>
    );
}

// 개별 상품 아이템 컴포넌트 (Intersection Observer 적용)
function ProductItem({ product }: { product: Product }) {
    const [isVisible, setIsVisible] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            {
                rootMargin: "100px", // 화면에 들어오기 100px 전부터 로드
            }
        );

        const currentItem = itemRef.current;
        if (currentItem) {
            observer.observe(currentItem);
        }

        return () => {
            if (currentItem) {
                observer.unobserve(currentItem);
            }
        };
    }, []);

    return (
        <Link
            href={`/products/${product.product_id}`}
            className="group"
        >
            <div ref={itemRef} className="flex gap-6 p-6 hover:bg-accent transition-colors">
                {/* 상품 썸네일 */}
                <div className="relative w-40 h-40 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {isVisible ? (
                        <iframe
                            src={`http://kaprpc.iptime.org:5051/v/rotate/${product.product_id}`}
                            className="w-full h-full border-0"
                            title={product.name}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* 상품 정보 */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                        <h3 className="text-lg font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(product.created_at)}
                        </p>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-xl font-bold">
                            {formatPrice(product.price)}
                        </p>
                        {/* 조회수 & 좋아요 */}
                        <div className="flex items-center gap-3 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{product.view_cnt}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{product.likes_cnt}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function ProductList() {
    const {
        data,
        isLoading,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteProducts({ limit: 20, status: "ACTIVE" });

    // Intersection Observer를 위한 ref
    const observerTarget = useRef<HTMLDivElement>(null);

    // 무한 스크롤 구현
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 모든 페이지의 상품을 하나의 배열로 병합
    const allProducts = data?.pages.flatMap((page) => page?.products ?? []) ?? [];

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
                                오류가 발생했습니다: {error instanceof Error ? error.message : "알 수 없는 오류"}
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

                    {!isLoading && !error && allProducts.length === 0 && (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
                        </div>
                    )}


                    {!isLoading && !error && allProducts.length > 0 && (
                        <div className="flex flex-col divide-y divide-border">
                            {allProducts.map((product) => (
                                <ProductItem key={product.product_id} product={product} />
                            ))}

                            {/* Intersection Observer 타겟 */}
                            <div ref={observerTarget} className="py-4">
                                {isFetchingNextPage && (
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>더 많은 상품을 불러오는 중...</span>
                                    </div>
                                )}
                                {!hasNextPage && (
                                    <div className="text-center text-muted-foreground text-sm">
                                        모든 상품을 불러왔습니다
                                    </div>
                                )}
                            </div>
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
