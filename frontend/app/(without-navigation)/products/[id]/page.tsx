"use client";

import { Heart, Share2, MoreVertical, MapPin, Eye, Clock, ChevronLeft, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { toast } from "sonner";
import { productApi, likeApi, chatApi } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";

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

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // 진행 중인 요청을 추적하여 중복 호출 방지
    const requestRef = useRef<{ productId: string; promise: Promise<any> } | null>(null);

    useEffect(() => {
        if (!carouselApi) {
            return;
        }

        carouselApi.on("select", () => {
            setCurrentImageIndex(carouselApi.selectedScrollSnap());
        });
    }, [carouselApi]);

    useEffect(() => {
        // 같은 productId의 요청이 진행 중이면 새로운 API 호출 하지 않음
        // React Strict Mode 중복 호출 완벽 방지
        if (requestRef.current?.productId === productId) {
            // 두 번째 실행: 첫 번째 요청의 결과를 기다림
            requestRef.current.promise
                .then(response => {
                    if (response.success && response.data) {
                        setProduct(response.data);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
            return;
        }

        let isMounted = true;

        const loadProductData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Promise 생성 및 요청 추적
                const promise = productApi.getProduct(productId);
                requestRef.current = { productId, promise };

                const response = await promise;

                if (isMounted) {
                    if (response.success && response.data) {
                        setProduct(response.data);
                    } else {
                        setError(response.error?.message || "상품을 불러올 수 없습니다.");
                        toast.error(response.error?.message || "상품을 불러올 수 없습니다.");
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError("상품을 불러오는 중 오류가 발생했습니다.");
                    toast.error("상품을 불러오는 중 오류가 발생했습니다.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProductData();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await productApi.getProduct(productId);

            if (response.success && response.data) {
                setProduct(response.data);
            } else {
                setError(response.error?.message || "상품을 불러올 수 없습니다.");
                toast.error(response.error?.message || "상품을 불러올 수 없습니다.");
            }
        } catch (err) {
            setError("상품을 불러오는 중 오류가 발생했습니다.");
            toast.error("상품을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleLikeToggle = async () => {
        try {
            if (isLiked) {
                const response = await likeApi.removeLike(productId);
                if (response.success) {
                    setIsLiked(false);
                    if (product) {
                        setProduct({
                            ...product,
                            likes_cnt: product.likes_cnt - 1,
                        });
                    }
                    toast.success("좋아요를 취소했습니다.");
                }
            } else {
                const response = await likeApi.addLike(productId);
                if (response.success) {
                    setIsLiked(true);
                    if (product) {
                        setProduct({
                            ...product,
                            likes_cnt: product.likes_cnt + 1,
                        });
                    }
                    toast.success("좋아요를 추가했습니다.");
                }
            }
        } catch (err) {
            toast.error("좋아요 처리 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        try {
            const response = await productApi.deleteProduct(productId);
            if (response.success) {
                toast.success("상품이 삭제되었습니다.");
                router.push("/");
            } else {
                toast.error(response.error?.message || "삭제에 실패했습니다.");
            }
        } catch (err) {
            toast.error("삭제 중 오류가 발생했습니다.");
        }
    };

    const handleStartChat = async () => {
        try {
            setIsChatLoading(true);

            // 로그인 확인
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error("로그인이 필요합니다.");
                router.push("/login");
                return;
            }

            // 채팅방 생성 또는 조회
            const response = await chatApi.createOrGetChatRoom({ productId });

            if (response.success && response.data?.data) {
                const chatRoom = response.data.data;
                // 채팅방으로 이동
                router.push(`/chat/${chatRoom.room_id}`);
            } else {
                toast.error(response.error?.message || "채팅방 생성에 실패했습니다.");
            }
        } catch (err) {
            console.error("채팅 시작 오류:", err);
            toast.error("채팅을 시작할 수 없습니다.");
        } finally {
            setIsChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => router.push("/")}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="pt-14 flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-lg text-muted-foreground mb-4">
                    {error || "상품을 찾을 수 없습니다."}
                </p>
                <Link
                    href="/"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        );
    }

    // 이미지 목록 (없으면 기본 이미지 사용)
    const images = product.images && product.images.length > 0
        ? product.images.map(img => img.s3_url)
        : ["http://52.78.124.23:4000/public/uploads/posts/default.jpg"];

    return (
        <div className="min-h-screen pb-20">
            {/* 헤더 */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/")}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-14 max-w-7xl mx-auto">
                {/* 상품 이미지 갤러리 */}
                <div className="relative">
                    <Carousel setApi={setCarouselApi} className="w-full">
                        <CarouselContent>
                            {images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-square bg-muted">
                                        <Image
                                            src={image}
                                            alt={`${product.name} - 이미지 ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="100vw"
                                            priority={index === 0}
                                            unoptimized
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    {/* 이미지 카운터 뱃지 (우측 하단) */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* 3DGS 작업 상태 표시 */}
                    {product.job_3dgs && product.job_3dgs.status !== 'DONE' && (
                        <div className="absolute top-4 left-4 bg-blue-500/90 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {product.job_3dgs.status === 'QUEUED' && '3D 처리 대기 중'}
                            {product.job_3dgs.status === 'RUNNING' && '3D 처리 중...'}
                            {product.job_3dgs.status === 'FAILED' && '3D 처리 실패'}
                        </div>
                    )}
                </div>

                {/* 판매자 정보 */}
                {product.seller && (
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                                    <Image
                                        src={product.seller.img || "http://52.78.124.23:4000/public/uploads/profiles/default.jpg"}
                                        alt={product.seller.nickname}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">{product.seller.nickname}</p>
                                    <p className="text-sm text-muted-foreground">
                                        판매자
                                    </p>
                                </div>
                            </div>
                            {/* 수정/삭제 버튼 - TODO: 본인 상품일 때만 표시 */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push(`/products/${productId}/edit`)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                    수정
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-3 py-2 text-sm border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 상품 정보 */}
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold mb-2">{product.name}</h1>
                    <p className="text-2xl font-bold mb-4">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(product.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{product.view_cnt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{product.likes_cnt}</span>
                        </div>
                    </div>

                    {/* 상품 상태 */}
                    <div className="mt-3">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                            product.sell_status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            product.sell_status === 'SOLD' ? 'bg-gray-100 text-gray-700' :
                            product.sell_status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {product.sell_status === 'ACTIVE' && '판매중'}
                            {product.sell_status === 'SOLD' && '판매완료'}
                            {product.sell_status === 'DRAFT' && '작성중'}
                            {product.sell_status === 'DELETED' && '삭제됨'}
                        </span>
                    </div>
                </div>

                {/* 상품 설명 */}
                <div className="p-4 border-b">
                    <h2 className="font-bold mb-2">상품 설명</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                        {product.description || "설명이 없습니다."}
                    </p>
                </div>

                {/* AI 결함 분석 결과 */}
                {product.fault_description && product.fault_description.status === 'DONE' && product.fault_description.markdown && (
                    <div className="p-4 border-b">
                        <h2 className="font-bold mb-2">AI 결함 분석</h2>
                        <div className="prose prose-sm max-w-none">
                            {/* TODO: 마크다운 렌더링 라이브러리 사용 */}
                            <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded">
                                {product.fault_description.markdown}
                            </pre>
                        </div>
                    </div>
                )}

                {/* 3D 모델 보기 */}
                {product.ply_url && (
                    <div className="p-4 border-b">
                        <h2 className="font-bold mb-2">3D 모델</h2>
                        <a
                            href={product.ply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                        >
                            3D 모델 파일 다운로드
                        </a>
                    </div>
                )}
            </div>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={handleLikeToggle}
                        className={`p-3 rounded-lg border transition-colors ${
                            isLiked
                                ? "bg-rose-50 border-rose-200 text-rose-500"
                                : "hover:bg-accent"
                        }`}
                    >
                        <Heart
                            className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                        />
                    </button>
                    <button
                        onClick={handleStartChat}
                        disabled={isChatLoading}
                        className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isChatLoading ? "채팅방 생성 중..." : "채팅하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
