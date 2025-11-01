"use client";

import { Heart, Share2, MoreVertical, MapPin, Eye, Clock, ChevronLeft, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

interface Product {
    id: number;
    title: string;
    price: number;
    likes: number;
    thumbnail: string;
    description: string;
    location: string;
    views: number;
    createdAt: string;
    seller: {
        name: string;
        location: string;
        profileImage: string;
    };
    images: string[];
}

// 예시 상품 상세 데이터
const productsDetail: Record<number, Product> = {
    1: {
        id: 1,
        title: "아이폰 15 Pro Max 256GB 블루티타늄",
        price: 1350000,
        likes: 24,
        thumbnail: "https://placehold.co/400x400/e2e8f0/64748b?text=iPhone+15",
        description: `아이폰 15 Pro Max 256GB 블루티타늄 판매합니다.

작년 11월에 구매했고, 케이스 끼고 사용해서 외관 상태 매우 좋습니다.
액정 필름도 부착되어 있어요.

배터리 성능 97%로 양호합니다.
박스, 충전케이블 모두 있습니다.

직거래 선호하며, 택배 거래도 가능합니다.
편하게 연락주세요!`,
        location: "서울 강남구 역삼동",
        views: 342,
        createdAt: "1시간 전",
        seller: {
            name: "신뢰판매자",
            location: "역삼동",
            profileImage: "https://placehold.co/100x100/3b82f6/ffffff?text=S",
        },
        images: [
            "https://placehold.co/800x800/e2e8f0/64748b?text=iPhone+15+Front",
            "https://placehold.co/800x800/e2e8f0/64748b?text=iPhone+15+Back",
            "https://placehold.co/800x800/e2e8f0/64748b?text=iPhone+15+Side",
        ],
    },
    2: {
        id: 2,
        title: "삼성 갤럭시 버즈2 프로 화이트",
        price: 89000,
        likes: 18,
        thumbnail: "https://placehold.co/400x400/dbeafe/3b82f6?text=Galaxy+Buds",
        description: `갤럭시 버즈2 프로 화이트 미개봉 새제품입니다.

선물받았는데 이미 사용중인 제품이 있어서 판매합니다.
정품 인증 가능하며, AS 가능합니다.

네고 어렵습니다.
직거래 가능 지역: 강남역, 선릉역`,
        location: "서울 강남구 역삼동",
        views: 156,
        createdAt: "3시간 전",
        seller: {
            name: "정직거래",
            location: "역삼동",
            profileImage: "https://placehold.co/100x100/10b981/ffffff?text=J",
        },
        images: [
            "https://placehold.co/800x800/dbeafe/3b82f6?text=Galaxy+Buds+Box",
            "https://placehold.co/800x800/dbeafe/3b82f6?text=Galaxy+Buds",
        ],
    },
    3: {
        id: 3,
        title: "에어팟 프로 2세대 USB-C",
        price: 289000,
        likes: 42,
        thumbnail: "https://placehold.co/400x400/f3e8ff/a855f7?text=AirPods+Pro",
        description: `에어팟 프로 2세대 USB-C 버전 판매합니다.

2개월 사용했고, 거의 새것입니다.
애플케어+ 1년 8개월 남았습니다.

구성품: 본체, 충전케이블, 이어팁(미개봉)
깨끗하게 세척해서 드립니다.

직거래 우선, 안전거래 가능합니다.`,
        location: "서울 서초구 서초동",
        views: 521,
        createdAt: "5시간 전",
        seller: {
            name: "애플매니아",
            location: "서초동",
            profileImage: "https://placehold.co/100x100/a855f7/ffffff?text=A",
        },
        images: [
            "https://placehold.co/800x800/f3e8ff/a855f7?text=AirPods+Pro",
            "https://placehold.co/800x800/f3e8ff/a855f7?text=AirPods+Case",
        ],
    },
    4: {
        id: 4,
        title: "맥북 에어 M2 13인치 미드나잇",
        price: 1290000,
        likes: 56,
        thumbnail: "https://placehold.co/400x400/fef3c7/f59e0b?text=MacBook+Air",
        description: `맥북 에어 M2 13인치 미드나잇 색상입니다.

사양:
- M2 칩
- 8GB RAM
- 256GB SSD
- 13.6인치 Liquid Retina 디스플레이

작년 3월에 구매해서 회사 업무용으로 사용했습니다.
외관 스크래치 거의 없고, 배터리 사이클 38회로 매우 좋습니다.

정품 박스, 충전기 모두 포함됩니다.
직거래 선호, 택배 시 안전거래 필수입니다.`,
        location: "서울 송파구 잠실동",
        views: 892,
        createdAt: "1일 전",
        seller: {
            name: "맥유저",
            location: "잠실동",
            profileImage: "https://placehold.co/100x100/f59e0b/ffffff?text=M",
        },
        images: [
            "https://placehold.co/800x800/fef3c7/f59e0b?text=MacBook+Air",
            "https://placehold.co/800x800/fef3c7/f59e0b?text=MacBook+Open",
            "https://placehold.co/800x800/fef3c7/f59e0b?text=MacBook+Side",
        ],
    },
    5: {
        id: 5,
        title: "iPad Pro 11인치 128GB Wi-Fi",
        price: 899000,
        likes: 31,
        thumbnail: "https://placehold.co/400x400/dcfce7/10b981?text=iPad+Pro",
        description: `iPad Pro 11인치 128GB Wi-Fi 모델입니다.

M1 칩 탑재 모델이고, 케이스와 필름 부착되어 있습니다.
애플펜슬 2세대 포함 (39만원 상당)

회사 지급품이었는데 개인 소유로 전환되어 판매합니다.
상태 매우 깔끔하고, 박스는 없습니다.

직거래만 가능합니다.
네고 가능합니다.`,
        location: "서울 마포구 상암동",
        views: 234,
        createdAt: "12시간 전",
        seller: {
            name: "프로유저",
            location: "상암동",
            profileImage: "https://placehold.co/100x100/10b981/ffffff?text=P",
        },
        images: [
            "https://placehold.co/800x800/dcfce7/10b981?text=iPad+Pro",
            "https://placehold.co/800x800/dcfce7/10b981?text=iPad+with+Pencil",
        ],
    },
    6: {
        id: 6,
        title: "애플워치 시리즈 9 45mm GPS",
        price: 569000,
        likes: 28,
        thumbnail: "https://placehold.co/400x400/fee2e2/ef4444?text=Apple+Watch",
        description: `애플워치 시리즈 9 45mm GPS 모델입니다.

미드나잇 알루미늄 케이스
미드나잇 스포츠 밴드 포함

2개월 사용했고, 스크래치 없습니다.
정품 등록되어 있으며, AS 가능합니다.

박스, 충전케이블 모두 포함
추가 밴드 1개 더 드립니다.

직거래, 택배거래 모두 가능합니다.`,
        location: "서울 용산구 이촌동",
        views: 445,
        createdAt: "2일 전",
        seller: {
            name: "워치판매자",
            location: "이촌동",
            profileImage: "https://placehold.co/100x100/ef4444/ffffff?text=W",
        },
        images: [
            "https://placehold.co/800x800/fee2e2/ef4444?text=Apple+Watch",
            "https://placehold.co/800x800/fee2e2/ef4444?text=Watch+Band",
        ],
    },
    7: {
        id: 7,
        title: "소니 WH-1000XM5 노이즈캔슬링",
        price: 349000,
        likes: 19,
        thumbnail: "https://placehold.co/400x400/e0e7ff/6366f1?text=Sony+WH",
        description: `소니 WH-1000XM5 블랙 색상입니다.

노이즈캔슬링 최강 헤드폰!
1주일 사용했는데, 제 머리 사이즈에 안 맞아서 판매합니다.

거의 새것이고, 정품 박스, 케이블, 파우치 모두 있습니다.
정품 인증 가능합니다.

직거래 강남역 가능
네고 불가`,
        location: "서울 강남구 역삼동",
        views: 287,
        createdAt: "6시간 전",
        seller: {
            name: "오디오매니아",
            location: "역삼동",
            profileImage: "https://placehold.co/100x100/6366f1/ffffff?text=O",
        },
        images: [
            "https://placehold.co/800x800/e0e7ff/6366f1?text=Sony+WH-1000XM5",
            "https://placehold.co/800x800/e0e7ff/6366f1?text=Sony+Case",
        ],
    },
    8: {
        id: 8,
        title: "다이슨 에어랩 멀티스타일러",
        price: 629000,
        likes: 67,
        thumbnail: "https://placehold.co/400x400/fce7f3/ec4899?text=Dyson",
        description: `다이슨 에어랩 멀티스타일러 컴플리트 세트입니다.

정품이고, 6개월 정도 사용했습니다.
구성품 모두 있고, 청소해서 보내드립니다.

헤어 스타일링 잘 안해서 판매합니다.
박스 포함, 설명서 있습니다.

직거래 선호 (홍대입구역, 신촌역)
택배 시 안전거래 필수`,
        location: "서울 마포구 서교동",
        views: 1203,
        createdAt: "3일 전",
        seller: {
            name: "뷰티셀러",
            location: "서교동",
            profileImage: "https://placehold.co/100x100/ec4899/ffffff?text=D",
        },
        images: [
            "https://placehold.co/800x800/fce7f3/ec4899?text=Dyson+Airwrap",
            "https://placehold.co/800x800/fce7f3/ec4899?text=Dyson+Attachments",
            "https://placehold.co/800x800/fce7f3/ec4899?text=Dyson+Case",
        ],
    },
};

// 가격 포맷 함수
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = Number(params.id);
    const product = productsDetail[productId];

    const [isLiked, setIsLiked] = useState(false);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!carouselApi) {
            return;
        }

        carouselApi.on("select", () => {
            setCurrentImageIndex(carouselApi.selectedScrollSnap());
        });
    }, [carouselApi]);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-lg text-muted-foreground">상품을 찾을 수 없습니다.</p>
                <Link
                    href="/"
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        );
    }

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
                                            router.push(`/products/${productId}/edit`);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-left hover:bg-accent rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-5 h-5" />
                                        <span className="text-base">수정</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            if (confirm("정말 삭제하시겠습니까?")) {
                                                toast.info("삭제 기능은 백엔드 연동 후 구현됩니다.");
                                                router.push("/");
                                            }
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 text-left text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span className="text-base">삭제</span>
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
                    <Carousel setApi={setCarouselApi} className="w-full">
                        <CarouselContent>
                            {product.images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-square bg-muted">
                                        <Image
                                            src={image}
                                            alt={`${product.title} - 이미지 ${index + 1}`}
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
                    {product.images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {currentImageIndex + 1} / {product.images.length}
                        </div>
                    )}
                </div>

                {/* 판매자 정보 */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                            <Image
                                src={product.seller.profileImage}
                                alt={product.seller.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div>
                            <p className="font-medium">{product.seller.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {product.seller.location}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 상품 정보 */}
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold mb-2">{product.title}</h1>
                    <p className="text-2xl font-bold mb-4">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{product.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{product.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{product.likes}</span>
                        </div>
                    </div>
                </div>

                {/* 상품 설명 */}
                <div className="p-4 border-b">
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* 거래 지역 */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{product.location}</span>
                    </div>
                </div>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
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
                    <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        채팅하기
                    </button>
                </div>
            </div>
        </div>
    );
}
