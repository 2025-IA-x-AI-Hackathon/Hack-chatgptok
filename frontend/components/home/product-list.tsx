"use client";

import { Heart, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
    id: number;
    title: string;
    price: number;
    likes: number;
    thumbnail: string;
}

// 예시 상품 데이터
const products: Product[] = [
    {
        id: 1,
        title: "아이폰 15 Pro Max 256GB 블루티타늄",
        price: 1350000,
        likes: 24,
        thumbnail: "https://placehold.co/400x400/e2e8f0/64748b?text=iPhone+15",
    },
    {
        id: 2,
        title: "삼성 갤럭시 버즈2 프로 화이트",
        price: 89000,
        likes: 18,
        thumbnail: "https://placehold.co/400x400/dbeafe/3b82f6?text=Galaxy+Buds",
    },
    {
        id: 3,
        title: "에어팟 프로 2세대 USB-C",
        price: 289000,
        likes: 42,
        thumbnail: "https://placehold.co/400x400/f3e8ff/a855f7?text=AirPods+Pro",
    },
    {
        id: 4,
        title: "맥북 에어 M2 13인치 미드나잇",
        price: 1290000,
        likes: 56,
        thumbnail: "https://placehold.co/400x400/fef3c7/f59e0b?text=MacBook+Air",
    },
    {
        id: 5,
        title: "iPad Pro 11인치 128GB Wi-Fi",
        price: 899000,
        likes: 31,
        thumbnail: "https://placehold.co/400x400/dcfce7/10b981?text=iPad+Pro",
    },
    {
        id: 6,
        title: "애플워치 시리즈 9 45mm GPS",
        price: 569000,
        likes: 28,
        thumbnail: "https://placehold.co/400x400/fee2e2/ef4444?text=Apple+Watch",
    },
    {
        id: 7,
        title: "소니 WH-1000XM5 노이즈캔슬링",
        price: 349000,
        likes: 19,
        thumbnail: "https://placehold.co/400x400/e0e7ff/6366f1?text=Sony+WH",
    },
    {
        id: 8,
        title: "다이슨 에어랩 멀티스타일러",
        price: 629000,
        likes: 67,
        thumbnail: "https://placehold.co/400x400/fce7f3/ec4899?text=Dyson",
    },
];

// 가격 포맷 함수
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
};

export default function ProductList() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background pb-24">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* 헤더 섹션 */}
                <div className="mb-10 animate-fade-in">
                    <h2 className="text-4xl font-bold mb-3 gradient-text">
                        인기 상품
                    </h2>
                    <p className="text-muted-foreground text-lg font-medium">
                        믿을 수 있는 중고 거래, 지금 시작하세요
                    </p>
                </div>

                {/* 그리드 레이아웃 */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-slide-up">
                    {products.map((product, index) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="group animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-md hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-3 hover:border-primary/30">
                                {/* 상품 썸네일 */}
                                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                                    <Image
                                        src={product.thumbnail}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-all duration-700 group-hover:scale-115 group-hover:rotate-1"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        unoptimized
                                    />
                                    {/* 좋아요 뱃지 */}
                                    <div className="absolute top-3 right-3 bg-gradient-to-br from-rose-500 to-rose-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
                                        <Heart className="w-3.5 h-3.5 fill-white" />
                                        <span>{product.likes}</span>
                                    </div>
                                    {/* 호버 오버레이 */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                {/* 상품 정보 */}
                                <div className="p-4 space-y-2">
                                    <h3 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug min-h-[2.5rem]">
                                        {product.title}
                                    </h3>
                                    <p className="text-xl font-bold gradient-text">
                                        {formatPrice(product.price)}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 상품 등록 플로팅 버튼 */}
            <Link
                href="/products/new"
                className="gradient-primary text-white rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-primary/60 hover:scale-110 transition-all duration-300 overflow-hidden"
                style={{
                    position: 'fixed',
                    right: '1rem',
                    bottom: '6rem',
                    width: '4rem',
                    height: '4rem',
                    zIndex: 9999
                }}
            >
                <Plus className="w-8 h-8" strokeWidth={2.5} />
                <div
                    className="absolute top-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    style={{
                        left: '-100%',
                        transition: 'left 0.5s'
                    }}
                />
            </Link>
        </div>
    );
}