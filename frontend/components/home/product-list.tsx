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
        <div className="fixed inset-0 flex flex-col bg-background pb-16">
            {/* 고정 헤더 */}
            <div className="shrink-0 bg-background border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h2 className="text-2xl font-bold">인기 상품</h2>
                </div>
            </div>

            {/* 상품 목록 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col divide-y divide-border">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="group"
                        >
                            <div className="flex gap-4 p-4 hover:bg-accent transition-colors">
                                {/* 상품 썸네일 */}
                                <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                                    <Image
                                        src={product.thumbnail}
                                        alt={product.title}
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
                                            {product.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <p className="text-lg font-bold">
                                            {formatPrice(product.price)}
                                        </p>
                                        {/* 좋아요 */}
                                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                            <Heart className="w-4 h-4" />
                                            <span>{product.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    </div>
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