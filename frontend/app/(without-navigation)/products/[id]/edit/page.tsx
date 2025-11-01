"use client";

import { ChevronLeft, ImagePlus, X, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productFormSchema, type ProductFormData } from "@/lib/schemas/product";
import { useProduct, useUpdateProduct } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadApi } from "@/lib/api";
import { UploadProgressModal } from "@/components/upload-progress-modal";

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

// 예시 상품 상세 데이터 (상세 페이지와 동일)
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

// 상품 수정 Skeleton 컴포넌트
function EditProductSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* 헤더 */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="h-5 w-20" />
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="pt-14 max-w-7xl mx-auto">
                {/* 이미지 Skeleton */}
                <div className="p-4 border-b space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-3">
                        <Skeleton className="w-24 h-24 rounded-lg" />
                        <Skeleton className="w-24 h-24 rounded-lg" />
                        <Skeleton className="w-24 h-24 rounded-lg" />
                    </div>
                </div>

                {/* 제목 Skeleton */}
                <div className="p-4 border-b space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>

                {/* 가격 Skeleton */}
                <div className="p-4 border-b space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>

                {/* 설명 Skeleton */}
                <div className="p-4 border-b space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>

                {/* 거래 지역 Skeleton */}
                <div className="p-4 border-b space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>
            </div>

            {/* 버튼 Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <Skeleton className="w-full h-12 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

interface ImagePreview {
    file?: File;
    preview: string;
    isExisting: boolean;
}

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = Number(params.id);

    const { data: product, isLoading, error, refetch } = useProduct(productId);
    const updateProductMutation = useUpdateProduct(productId);
    const [imageFiles, setImageFiles] = useState<ImagePreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 업로드 프로그레스 상태
    const [uploadProgress, setUploadProgress] = useState({
        isOpen: false,
        currentFile: 0,
        totalFiles: 0,
        fileProgress: 0,
        status: "uploading" as "uploading" | "processing" | "success",
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            price: "",
            description: "",
            imageUrls: [],
        },
    });

    const priceValue = watch("price");

    useEffect(() => {
        if (product) {
            reset({
                name: product.title,
                price: product.price.toLocaleString('ko-KR'),
                description: product.description,
                imageUrls: product.images,
            });
            // 기존 이미지를 imageFiles 상태로 설정
            const existingImages: ImagePreview[] = product.images.map((url) => ({
                preview: url,
                isExisting: true,
            }));
            setImageFiles(existingImages);
        }
    }, [product, reset]);

    // 가격 입력 핸들러 - 숫자만 입력받고 천 단위 콤마 추가
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 숫자만 추출
        const numbers = value.replace(/[^0-9]/g, '');
        // 천 단위 콤마 추가
        if (numbers) {
            const formatted = Number(numbers).toLocaleString('ko-KR');
            setValue("price", formatted, { shouldValidate: true });
        } else {
            setValue("price", "", { shouldValidate: true });
        }
    };

    const handleImageAdd = () => {
        if (imageFiles.length >= 10) {
            toast.error("최대 10개까지 이미지를 추가할 수 있습니다.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (imageFiles.length + files.length > 10) {
            toast.error("최대 10개까지 이미지를 추가할 수 있습니다.");
            return;
        }

        const newImageFiles: ImagePreview[] = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            isExisting: false,
        }));

        const updatedFiles = [...imageFiles, ...newImageFiles];
        setImageFiles(updatedFiles);

        // 폼 검증을 위해 URL 설정
        const imageUrls = updatedFiles.map((img) => img.preview);
        setValue("imageUrls", imageUrls, { shouldValidate: true });

        // input 초기화
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImageRemove = (index: number) => {
        const imageToRemove = imageFiles[index];
        const newImageFiles = imageFiles.filter((_, i) => i !== index);

        // 새로 추가된 이미지만 메모리 해제
        if (!imageToRemove.isExisting) {
            URL.revokeObjectURL(imageToRemove.preview);
        }

        setImageFiles(newImageFiles);
        const imageUrls = newImageFiles.map((img) => img.preview);
        setValue("imageUrls", imageUrls, { shouldValidate: true });
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            // 새로 추가된 이미지만 필터링
            const newFiles = imageFiles
                .filter((img) => !img.isExisting && img.file)
                .map((img) => img.file!);

            let uploadedUrls: string[] = [];

            // 새로 추가된 이미지가 있으면 업로드
            if (newFiles.length > 0) {
                setUploadProgress({
                    isOpen: true,
                    currentFile: 0,
                    totalFiles: newFiles.length,
                    fileProgress: 0,
                    status: "uploading",
                });

                const uploadResult = await uploadApi.uploadImages(
                    newFiles,
                    (current, total, fileProgress) => {
                        setUploadProgress((prev) => ({
                            ...prev,
                            currentFile: current,
                            totalFiles: total,
                            fileProgress: fileProgress,
                        }));
                    }
                );

                if (!uploadResult.success || !uploadResult.data) {
                    throw new Error(uploadResult.error?.message || "이미지 업로드에 실패했습니다.");
                }

                uploadedUrls = uploadResult.data;

                setUploadProgress((prev) => ({
                    ...prev,
                    status: "processing",
                }));
            }

            // 기존 이미지 URL + 새로 업로드된 이미지 URL
            const existingUrls = imageFiles
                .filter((img) => img.isExisting)
                .map((img) => img.preview);

            const allImageUrls = [...existingUrls, ...uploadedUrls];

            const productData = {
                name: data.name,
                price: Number(data.price.replace(/[^0-9]/g, "")),
                description: data.description,
                ply_url: allImageUrls[0], // 첫 번째 이미지를 ply_url로 사용 (임시)
                thumbnail: allImageUrls[0], // 첫 번째 이미지를 썸네일로 사용
            };

            updateProductMutation.mutate(productData, {
                onSuccess: () => {
                    if (newFiles.length > 0) {
                        setUploadProgress((prev) => ({
                            ...prev,
                            status: "success",
                        }));

                        setTimeout(() => {
                            toast.success("상품이 수정되었습니다!");
                            router.push(`/products/${productId}`);
                        }, 1000);
                    } else {
                        toast.success("상품이 수정되었습니다!");
                        router.push(`/products/${productId}`);
                    }
                },
                onError: (error) => {
                    setUploadProgress({ isOpen: false, currentFile: 0, totalFiles: 0, fileProgress: 0, status: "uploading" });
                    toast.error(error.message || "상품 수정에 실패했습니다.");
                },
            });
        } catch (error) {
            setUploadProgress({ isOpen: false, currentFile: 0, totalFiles: 0, fileProgress: 0, status: "uploading" });
            toast.error(error instanceof Error ? error.message : "상품 수정에 실패했습니다.");
        }
    };

    if (isLoading) {
        return <EditProductSkeleton />;
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

    if (!product) {
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
                    <h1 className="text-lg font-semibold">상품 수정</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* 업로드 프로그레스 모달 */}
            <UploadProgressModal
                isOpen={uploadProgress.isOpen}
                currentFile={uploadProgress.currentFile}
                totalFiles={uploadProgress.totalFiles}
                fileProgress={uploadProgress.fileProgress}
                status={uploadProgress.status}
            />

            {/* 숨겨진 파일 입력 */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />

            <form onSubmit={handleSubmit(onSubmit)} className="pt-14 max-w-7xl mx-auto">
                {/* 이미지 업로드 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-3">
                        상품 이미지 ({imageFiles.length}/10)
                    </label>
                    {errors.imageUrls && (
                        <p className="text-xs text-red-600 mb-2">{errors.imageUrls.message}</p>
                    )}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {/* 이미지 추가 버튼 */}
                        {imageFiles.length < 10 && (
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
                        {imageFiles.map((imageFile, index) => (
                            <div
                                key={index}
                                className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted group"
                            >
                                <Image
                                    src={imageFile.preview}
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

                {/* 상품명 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">상품명</label>
                    <input
                        type="text"
                        {...register("name")}
                        placeholder="상품명을 입력하세요"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={100}
                    />
                    <div className="flex items-center justify-between mt-1">
                        {errors.name && (
                            <p className="text-xs text-red-600">{errors.name.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground ml-auto">
                            {watch("name")?.length || 0}/100
                        </p>
                    </div>
                </div>

                {/* 가격 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">가격</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={priceValue}
                            onChange={handlePriceChange}
                            placeholder="0"
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm font-medium">원</span>
                    </div>
                    {errors.price && (
                        <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>
                    )}
                </div>

                {/* 설명 */}
                <div className="p-4 border-b">
                    <label className="block text-sm font-medium mb-2">설명</label>
                    <textarea
                        {...register("description")}
                        placeholder="상품 설명을 입력하세요"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px] resize-none"
                        maxLength={2000}
                    />
                    <div className="flex items-center justify-between mt-1">
                        {errors.description && (
                            <p className="text-xs text-red-600">{errors.description.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground ml-auto">
                            {watch("description")?.length || 0}/2000
                        </p>
                    </div>
                </div>

                {/* 수정 버튼 */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <button
                            type="submit"
                            disabled={updateProductMutation.isPending}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateProductMutation.isPending ? "수정 중..." : "수정하기"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
