"use client";

import { ChevronLeft, ImagePlus, X, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productFormSchema, type ProductFormData } from "@/lib/schemas/product";
import { useCreateProduct } from "@/lib/hooks/use-products";
import { uploadApi } from "@/lib/api";
import { UploadProgressModal } from "@/components/upload-progress-modal";
import { useGenerateDescription } from "@/lib/hooks/use-ai";

interface ImagePreview {
    file: File;
    preview: string;
}

export default function NewProductPage() {
    const router = useRouter();
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
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            price: "",
            description: "",
            imageUrls: [],
            imageKeys: [],
        },
    });

    const createProductMutation = useCreateProduct();
    const generateDescriptionMutation = useGenerateDescription();
    const priceValue = watch("price");
    const productName = watch("name");
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

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
        if (imageFiles.length >= 50) {
            toast.error("최대 50개까지 이미지를 추가할 수 있습니다.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (imageFiles.length + files.length > 50) {
            toast.error("최대 50개까지 이미지를 추가할 수 있습니다.");
            return;
        }

        const newImageFiles: ImagePreview[] = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        const updatedFiles = [...imageFiles, ...newImageFiles];
        setImageFiles(updatedFiles);

        // 폼 검증을 위해 임시 URL 설정
        const imageUrls = updatedFiles.map((img) => img.preview);
        setValue("imageUrls", imageUrls, { shouldValidate: true });

        // input 초기화
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // 첫 번째 이미지가 추가되고 상품명이 있으면 AI 설명 자동 생성
        if (imageFiles.length === 0 && files.length > 0 && productName) {
            await handleGenerateDescription(files[0]);
        }
    };

    const handleImageRemove = (index: number) => {
        const newImageFiles = imageFiles.filter((_, i) => i !== index);

        // 메모리 해제
        URL.revokeObjectURL(imageFiles[index].preview);

        setImageFiles(newImageFiles);
        const imageUrls = newImageFiles.map((img) => img.preview);
        setValue("imageUrls", imageUrls, { shouldValidate: true });
    };

    // AI 설명 생성 핸들러
    const handleGenerateDescription = async (file?: File) => {
        if (!file || imageFiles.length === 0) {
            toast.error("이미지를 먼저 넣어주세요.");
            return;
        }
        if (!productName) {
            toast.error("상품명을 먼저 입력해주세요.");
            return;
        }

        if (isGeneratingDescription) {
            toast.error("이미 설명을 생성중입니다");
            return;
        }

        setIsGeneratingDescription(true);
        setValue("description", "", { shouldValidate: false }); // 설명 초기화

        try {
            // 1. 먼저 이미지를 S3에 업로드
            toast.info("이미지를 업로드하는 중...");
            const uploadResult = await uploadApi.uploadImages([file]);

            if (!uploadResult.success || !uploadResult.data || uploadResult.data.length === 0) {
                throw new Error("이미지 업로드에 실패했습니다.");
            }

            // 2. AI 설명 생성 요청
            toast.info("AI가 상품 설명을 생성하는 중...");
            generateDescriptionMutation.mutate(
                {
                    s3_path: `s3://ss-s3-project/${uploadResult.data[0]}`,
                    product_name: productName,
                },
                {
                    onSuccess: (data) => {
                        setValue("description", data.description, { shouldValidate: true });
                        toast.success("AI가 상품 설명을 생성했습니다!");
                        setIsGeneratingDescription(false);
                    },
                    onError: (error) => {
                        toast.error(error.message || "AI 설명 생성에 실패했습니다.");
                        setIsGeneratingDescription(false);
                    },
                }
            );
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "AI 설명 생성에 실패했습니다.");
            setIsGeneratingDescription(false);
        }
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            // 프로그레스 모달 열기
            setUploadProgress({
                isOpen: true,
                currentFile: 0,
                totalFiles: imageFiles.length,
                fileProgress: 0,
                status: "uploading",
            });

            // 1. 이미지 업로드
            const files = imageFiles.map((img) => img.file);
            const uploadResult = await uploadApi.uploadImages(
                files,
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

            // 2. 상품 등록
            setUploadProgress((prev) => ({
                ...prev,
                status: "processing",
            }));

            // 업로드된 이미지 URL들을 imageKeys에 설정
            const productData = {
                ...data,
                imageKeys: uploadResult.data, // 업로드된 모든 이미지 URL 배열
            };

            createProductMutation.mutate(productData, {
                onSuccess: () => {
                    setUploadProgress((prev) => ({
                        ...prev,
                        status: "success",
                    }));

                    setTimeout(() => {
                        toast.success("상품이 등록되었습니다!");
                        router.push("/");
                    }, 1000);
                },
                onError: (error) => {
                    setUploadProgress({ isOpen: false, currentFile: 0, totalFiles: 0, fileProgress: 0, status: "uploading" });
                    toast.error(error.message || "상품 등록에 실패했습니다.");
                },
            });
        } catch (error) {
            setUploadProgress({ isOpen: false, currentFile: 0, totalFiles: 0, fileProgress: 0, status: "uploading" });
            toast.error(error instanceof Error ? error.message : "상품 등록에 실패했습니다.");
        }
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
                        상품 이미지 ({imageFiles.length}/50)
                    </label>
                    {errors.imageUrls && (
                        <p className="text-xs text-red-600 mb-2">{errors.imageUrls.message}</p>
                    )}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {/* 이미지 추가 버튼 */}
                        {imageFiles.length < 50 && (
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
                        첫 번째 이미지가 대표 이미지로 사용됩니다. (최소 3장, 최대 50장)
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
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">설명</label>
                            <button
                                type="button"
                                onClick={() => handleGenerateDescription(imageFiles[0]?.file)}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Sparkles className="w-3 h-3" />
                                AI 설명 생성
                            </button>
                    </div>

                    {/* 로딩 상태 표시 */}
                    {isGeneratingDescription ? (
                        <div className="w-full px-3 py-2 border rounded-lg min-h-[200px] bg-muted/30 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-primary">AI 설명 생성 중...</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    AI가 이미지를 분석하고 있습니다
                                </p>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            {...register("description")}
                            placeholder="상품 설명을 입력하세요"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px] resize-none"
                            maxLength={2000}
                        />
                    )}

                    <div className="flex items-center justify-between mt-1">
                        {errors.description && (
                            <p className="text-xs text-red-600">{errors.description.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground ml-auto">
                            {watch("description")?.length || 0}/2000
                        </p>
                    </div>

                    {imageFiles.length === 0 && !isGeneratingDescription && (
                        <p className="text-sm text-muted-foreground">
                            💡 이미지와 상품명을 입력하면 AI가 자동으로 설명을 생성해드립니다
                        </p>
                    )}
                </div>

                {/* 등록 버튼 */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <button
                            type="submit"
                            disabled={createProductMutation.isPending}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createProductMutation.isPending ? "등록 중..." : "등록하기"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
