"use client";

import { Heart, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

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

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await productApi.getProducts({
                page: 1,
                limit: 20,
                status: 'ACTIVE', // 판매 중인 상품만 조회
                sort: 'latest',
            });

            if (response.success && response.data) {
                setProducts(response.data.products);
            } else {
                setError(response.error?.message || "상품 목록을 불러올 수 없습니다.");
                toast.error(response.error?.message || "상품 목록을 불러올 수 없습니다.");
            }
        } catch (err) {
            setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
            toast.error("상품 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-20">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h2 className="text-2xl font-bold mb-6">인기 상품</h2>
                    <div className="flex flex-col divide-y divide-border">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 animate-pulse">
                                <div className="w-24 h-24 bg-muted rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-muted rounded w-3/4" />
                                    <div className="h-4 bg-muted rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background pb-20">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h2 className="text-2xl font-bold mb-6">인기 상품</h2>
                    <div className="text-center py-20">
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <button
                            onClick={loadProducts}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-background pb-20">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h2 className="text-2xl font-bold mb-6">인기 상품</h2>
                    <div className="text-center py-20">
                        <p className="text-muted-foreground mb-4">
                            등록된 상품이 없습니다.
                        </p>
                        <Link
                            href="/products/new"
                            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            첫 상품 등록하기
                        </Link>
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

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h2 className="text-2xl font-bold mb-6">인기 상품</h2>
                <div className="flex flex-col divide-y divide-border">
                    {products.map((product) => {
                        // 썸네일 이미지 가져오기 (첫 번째 이미지 또는 기본 이미지)
                        const thumbnail = product.images && product.images.length > 0
                            ? product.images[0].s3_url
                            : "http://52.78.124.23:4000/public/uploads/posts/default.jpg";

                        return (
                            <Link
                                key={product.product_id}
                                href={`/products/${product.product_id}`}
                                className="group"
                            >
                                <div className="flex gap-4 p-4 hover:bg-accent transition-colors">
                                    {/* 상품 썸네일 */}
                                    <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        <Image
                                            src={thumbnail}
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
                                            {product.seller && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {product.seller.nickname}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-lg font-bold">
                                                    {formatPrice(product.price)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(product.created_at)}
                                                </p>
                                            </div>
                                            {/* 좋아요 & 조회수 */}
                                            <div className="flex items-center gap-3 text-muted-foreground text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{product.likes_cnt}</span>
                                                </div>
                                                <span className="text-xs">
                                                    조회 {product.view_cnt}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
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
