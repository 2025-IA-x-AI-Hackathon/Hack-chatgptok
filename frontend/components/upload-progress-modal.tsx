"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

interface UploadProgressModalProps {
    isOpen: boolean;
    currentFile: number;
    totalFiles: number;
    fileProgress: number;
    status: "uploading" | "processing" | "success";
}

export function UploadProgressModal({
    isOpen,
    currentFile,
    totalFiles,
    fileProgress,
    status,
}: UploadProgressModalProps) {
    if (!isOpen) return null;

    const overallProgress = totalFiles > 0
        ? ((currentFile - 1) / totalFiles * 100) + (fileProgress / totalFiles)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                {/* 상태 아이콘 */}
                <div className="flex flex-col items-center mb-6">
                    {status === "success" ? (
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    )}

                    <h3 className="text-lg font-semibold">
                        {status === "success"
                            ? "업로드 완료!"
                            : status === "processing"
                            ? "상품 등록 중..."
                            : "이미지 업로드 중..."}
                    </h3>
                </div>

                {/* 진행 상황 */}
                {status !== "success" && (
                    <div className="space-y-4">
                        {/* 파일 카운트 */}
                        {status === "uploading" && (
                            <div className="text-center text-sm text-muted-foreground">
                                {currentFile} / {totalFiles} 이미지 업로드 중
                            </div>
                        )}

                        {/* 전체 진행률 바 */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>진행률</span>
                                <span>{Math.round(status === "uploading" ? overallProgress : 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                    style={{
                                        width: `${status === "uploading" ? overallProgress : 100}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* 현재 파일 진행률 */}
                        {status === "uploading" && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>현재 파일</span>
                                    <span>{Math.round(fileProgress)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary/60 transition-all duration-150"
                                        style={{ width: `${fileProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 성공 메시지 */}
                {status === "success" && (
                    <p className="text-center text-sm text-muted-foreground">
                        상품이 성공적으로 등록되었습니다!
                    </p>
                )}
            </div>
        </div>
    );
}
