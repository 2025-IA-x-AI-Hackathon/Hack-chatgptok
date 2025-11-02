"use client";

import { Heart, Share2, MoreVertical, Eye, Clock, ChevronLeft, Pencil, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import ReactMarkdown from "react-markdown";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useProduct, useDeleteProduct } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddLike, useRemoveLike } from "@/lib/hooks/use-likes";
import { useCreateOrGetChatRoom } from "@/lib/hooks/use-chat";

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

// 상품 상세 Skeleton 컴포넌트
function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen pb-20">
            {/* 헤더 */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <Skeleton className="w-10 h-10 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="pt-14 max-w-7xl mx-auto">
                {/* 이미지 Skeleton */}
                <Skeleton className="aspect-square w-full" />

                {/* 판매자 정보 Skeleton */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </div>

                {/* 상품 정보 Skeleton */}
                <div className="p-4 border-b space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-32" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>

                {/* 설명 Skeleton */}
                <div className="p-4 border-b space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* 거래 지역 Skeleton */}
                <div className="p-4 border-b">
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            {/* 하단 고정 버튼 Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <Skeleton className="flex-1 h-12 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailPage({ params } : {
      params: Promise<{ id: string }>
} ){
    const router = useRouter();
    const { id } = use(params)


    const { data: productData, isLoading, error, refetch } = useProduct(id);

    const deleteProductMutation = useDeleteProduct();
    const addLikeMutation = useAddLike();
    const removeLikeMutation = useRemoveLike();
    const createChatRoomMutation = useCreateOrGetChatRoom();

    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

    const product = productData?.product;
    const isLikedFromServer = productData?.isLiked ?? false;

    // 서버에서 받은 좋아요 상태를 로컬 상태에 동기화
    useEffect(() => {
        if (productData) {
            setIsLiked(isLikedFromServer);
        }
    }, [productData, isLikedFromServer]);

    useEffect(() => {
        if (!carouselApi) {
            return;
        }

        carouselApi.on("select", () => {
            setCurrentImageIndex(carouselApi.selectedScrollSnap());
        });
    }, [carouselApi]);

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <p className="text-red-600 text-center mb-4">
                    오류가 발생했습니다: {error.message}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        재시도
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm("정말 삭제하시겠습니까?")) {
            deleteProductMutation.mutate(id, {
                onSuccess: () => {
                    toast.success("상품이 삭제되었습니다.");
                    router.push("/");
                },
                onError: (error) => {
                    toast.error(error.message || "상품 삭제에 실패했습니다.");
                },
            });
        }
    };

    const handleLikeToggle = () => {
        // 낙관적 업데이트 (즉시 UI 변경)
        const previousLiked = isLiked;
        setIsLiked(!isLiked);

        if (isLiked) {
            removeLikeMutation.mutate(id, {
                onSuccess: () => {
                    toast.success("좋아요를 취소했습니다.");
                },
                onError: (error) => {
                    // 실패 시 이전 상태로 복원
                    setIsLiked(previousLiked);
                    toast.error(error.message || "좋아요 취소에 실패했습니다.");
                },
            });
        } else {
            addLikeMutation.mutate(id, {
                onSuccess: () => {
                    toast.success("좋아요를 눌렀습니다.");
                },
                onError: (error) => {
                    // 실패 시 이전 상태로 복원
                    setIsLiked(previousLiked);
                    toast.error(error.message || "좋아요에 실패했습니다.");
                },
            });
        }
    };

    const handleStartChat = () => {
        createChatRoomMutation.mutate(
            { productId: id },
            {
                onSuccess: (chatRoom) => {
                    router.push(`/chat/${chatRoom.room_id}`);
                },
                onError: (error) => {
                    toast.error(error.message || "채팅방 생성에 실패했습니다.");
                },
            }
        );
    };

    const handleShare = async () => {
        if (!product) return;

        const shareData = {
            title: product.name,
            text: `${product.name} - ${formatPrice(product.price)}`,
            url: window.location.href,
        };

        try {
            // Web Share API 지원 여부 확인
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success("공유되었습니다.");
            } else {
                // 폴백: 클립보드에 URL 복사
                await navigator.clipboard.writeText(window.location.href);
                toast.success("링크가 클립보드에 복사되었습니다.");
            }
        } catch (error) {
            // 사용자가 공유를 취소한 경우 등
            if (error instanceof Error && error.name !== "AbortError") {
                toast.error("공유에 실패했습니다.");
            }
        }
    };

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <p className="text-lg text-muted-foreground mb-4">상품을 찾을 수 없습니다.</p>
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
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="rounded-t-2xl gap-0">
                                <SheetHeader>
                                    <SheetTitle>상품 관리</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            router.push(`/products/${id}/edit`);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-left hover:bg-accent rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-5 h-5" />
                                        <span className="text-base">수정</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleDelete();
                                        }}
                                        disabled={deleteProductMutation.isPending}
                                        className="flex items-center gap-3 px-4 py-3 text-left text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span className="text-base">
                                            {deleteProductMutation.isPending ? "삭제 중..." : "삭제"}
                                        </span>
                                    </button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <div className="pt-14 max-w-7xl mx-auto">
                {/* 상품 이미지 갤러리 */}
                <div className="relative">
                    {viewMode === '3D' ? (
                        // 3D 뷰어
                        <div className="relative aspect-square bg-muted">
                            <iframe
                                src={`http://kaprpc.iptime.org:5051/v/${product.product_id}`}
                                className="w-full h-full border-0"
                                title={`${product.name} - 3D 뷰어`}
                            />
                        </div>
                    ) : (
                        // 2D 이미지 캐러셀
                        <>
                            <Carousel setApi={setCarouselApi} className="w-full">
                                <CarouselContent>
                                    {product?.images?.map((image, index) => (
                                        <CarouselItem key={image.image_id}>
                                            <div className="relative aspect-square bg-muted">
                                                <Image
                                                    src={image.url}
                                                    alt={`${product.name} - 이미지 ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="100vw"
                                                    priority={index === 0}
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>

                            {/* 이미지 카운터 뱃지 (우측 하단) */}
                            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                {currentImageIndex + 1} / {product.images?.length || 0}
                            </div>
                        </>
                    )}

                    {/* 3DGS 작업 상태 표시 */}
                    {/* {product.job_3dgs && product.job_3dgs.status !== 'DONE' && (
                        <div className="absolute top-4 left-4 bg-blue-500/90 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {product.job_3dgs.status === 'QUEUED' && '3D 처리 대기 중'}
                            {product.job_3dgs.status === 'RUNNING' && '3D 처리 중...'}
                            {product.job_3dgs.status === 'FAILED' && '3D 처리 실패'}
                        </div>
                    )} */}
                </div>

                {/* 3D/2D 토글 버튼 */}
                <div className="pt-3 bg-background">
                    <div className="inline-flex w-full bg-muted rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('3D')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                                viewMode === '3D'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            3D 이미지
                        </button>
                        <button
                            onClick={() => setViewMode('2D')}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                                viewMode === '2D'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            2D 이미지
                        </button>
                    </div>
                </div>

                {/* 판매자 정보 */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                            <Image
                                src={product.seller_img_url}
                                alt={product.seller_nickname}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-medium">{product.seller_nickname}</p>
                        </div>
                    </div>
                </div>

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
                    {/* <div className="mt-3">
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
                    </div> */}
                </div>

                {/* 상품 설명 */}
                <div className="p-4 border-b">
                    <h2 className="font-bold mb-2">상품 설명</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                        {product.description || "설명이 없습니다."}
                    </p>
                </div>

                {/* AI 하자 설명 */}
                {productData?.faultDescription?.markdown && (
                    <div className="p-4 border-b">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <h2 className="font-bold text-amber-900">AI 하자 분석</h2>
                        </div>
                        <div className="text-sm text-amber-800 markdown-content">
                            <ReactMarkdown
                                components={{
                                    h1: ({ children }) => <h1 className="text-xl font-bold text-amber-900 mt-4 mb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-bold text-amber-900 mt-3 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-bold text-amber-900 mt-2 mb-1">{children}</h3>,
                                    p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="ml-2">{children}</li>,
                                    strong: ({ children }) => <strong className="font-bold text-amber-900">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-amber-400 pl-3 italic my-2">{children}</blockquote>,
                                }}
                            >
                                {productData.faultDescription.markdown}
                            </ReactMarkdown>
                        </div>
                        <p className="text-xs text-amber-600 mt-3 italic">
                            * AI가 자동으로 분석한 내용이며, 실제와 다를 수 있습니다.
                        </p>
                    </div>
                )}
            </div>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={handleLikeToggle}
                        disabled={addLikeMutation.isPending || removeLikeMutation.isPending}
                        className={`p-3 rounded-lg border transition-colors ${
                            isLiked
                                ? "bg-rose-50 border-rose-200"
                                : "hover:bg-accent"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Heart
                            className={`w-6 h-6 transition-all ${
                                isLiked
                                    ? "fill-rose-500 text-rose-500"
                                    : "fill-none text-gray-600"
                            }`}
                        />
                    </button>
                    <button
                        onClick={handleStartChat}
                        disabled={createChatRoomMutation.isPending}
                        className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createChatRoomMutation.isPending ? "채팅방 생성 중..." : "채팅하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
