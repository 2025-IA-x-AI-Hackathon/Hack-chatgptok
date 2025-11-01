"use client";

import { ChevronLeft, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProductPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [images, setImages] = useState<string[]>([]);

    const handleImageAdd = () => {
        // 실제로는 파일 업로드를 처리해야 하지만, 데모용으로 placeholder 이미지 추가
        const colors = ["e2e8f0/64748b", "dbeafe/3b82f6", "f3e8ff/a855f7", "fef3c7/f59e0b"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newImage = `https://placehold.co/800x800/${randomColor}?text=Product+${images.length + 1}`;
        setImages([...images, newImage]);
    };

    const handleImageRemove = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !price || !description || !location) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (images.length === 0) {
            alert("최소 1개의 이미지를 추가해주세요.");
            return;
        }

        // 여기서 실제로는 서버에 데이터를 전송해야 합니다
        alert("상품이 등록되었습니다!");
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* 헤더 */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold">상품 등록</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="pt-14 max-w-7xl mx-auto">
                {/* 이미지 업로드 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-3">
                        상품 이미지 ({images.length}/10)
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {/* 이미지 추가 버튼 */}
                        {images.length < 10 && (
                            <button
                                type="button"
                                onClick={handleImageAdd}
                                className="w-24 h-24 shrink-0 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
                            >
                                <ImagePlus className="w-6 h-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    추가
                                </span>
                            </button>
                        )}

                        {/* 이미지 미리보기 */}
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted group"
                            >
                                <Image
                                    src={image}
                                    alt={`상품 이미지 ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                <button
                                    type="button"
                                    onClick={() => handleImageRemove(index)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {index === 0 && (
                                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                                        대표
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        첫 번째 이미지가 대표 이미지로 사용됩니다.
                    </p>
                </div>

                {/* 제목 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="상품 제목을 입력하세요"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                        {title.length}/100
                    </p>
                </div>

                {/* 가격 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">가격</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            min="0"
                        />
                        <span className="text-sm font-medium">원</span>
                    </div>
                </div>

                {/* 설명 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">설명</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="상품 설명을 입력하세요"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px] resize-none"
                        maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                        {description.length}/2000
                    </p>
                </div>

                {/* 거래 지역 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">거래 지역</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="예: 서울 강남구 역삼동"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* 등록 버튼 */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            등록하기
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
