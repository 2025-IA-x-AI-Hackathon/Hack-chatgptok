"use client";

import { ChevronLeft, ImagePlus, X, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productFormSchema, type ProductFormData } from "@/lib/schemas/product";
import { useProduct, useUpdateProduct } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadApi } from "@/lib/api";
import { UploadProgressModal } from "@/components/upload-progress-modal";

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

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter();

    const { data: product, isLoading, error, refetch } = useProduct(id);
    const updateProductMutation = useUpdateProduct(id);
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
            const imageUrls = product.images.map(img => img.url);
            reset({
                name: product.name,
                price: product.price.toLocaleString('ko-KR'),
                description: product.description,
                imageUrls: imageUrls,
                imageKeys: imageUrls,
            });
            // 기존 이미지를 imageFiles 상태로 설정
            const existingImages: ImagePreview[] = product.images.map((img) => ({
                preview: img.url,
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
                            router.push(`/products/${id}`);
                        }, 1000);
                    } else {
                        toast.success("상품이 수정되었습니다!");
                        router.push(`/products/${id}`);
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
