"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Camera, User, Lock, Upload, Mail, Calendar, Info, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { userApi, uploadApi, authApi } from "@/lib/api"
import {
  updateProfileSchema,
  updatePasswordSchema,
  type UpdateProfileFormData,
  type UpdatePasswordFormData,
} from "@/lib/schemas/auth"

export function ProfileForm() {
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  // 프로필 조회 Query
  const { data: user, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userApi.getProfile()
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "프로필 정보를 불러오는데 실패했습니다")
      }
      return response.data.user
    },
  })

  // 프로필 업데이트 Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
    watch: watchProfile,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      nickname: user?.nickname || "",
      img: user?.img_url   || "",
    },
  })

  console.log(user)

  // 비밀번호 변경 Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  })

  // 이미지 업로드 Mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadApi.uploadImages([file], (current, total, fileProgress) => {
        setUploadProgress(fileProgress)
      })
      return response
    },
    onSuccess: (response) => {
      if (response.success && response.data && response.data.length > 0) {
        const imageUrl = response.data[0]
        setProfileValue("img", imageUrl)
        toast.success("이미지가 업로드되었습니다")
        // 이미지 업로드 후 자동으로 프로필 업데이트
        updateProfileMutation.mutate({ img: imageUrl })
      } else {
        toast.error("이미지 업로드에 실패했습니다")
      }
      setUploadProgress(0)
    },
    onError: (error) => {
      console.error("Image upload error:", error)
      toast.error("이미지 업로드 중 오류가 발생했습니다")
      setUploadProgress(0)
    },
  })

  // 프로필 업데이트 Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => userApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("프로필이 성공적으로 변경되었습니다!")
        queryClient.invalidateQueries({ queryKey: ["profile"] })
      } else {
        toast.error(response.error?.message || "프로필 변경에 실패했습니다")
      }
    },
    onError: (error) => {
      console.error("Profile update error:", error)
      toast.error("프로필 변경 중 오류가 발생했습니다")
    },
  })

  // 비밀번호 변경 Mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (data: UpdatePasswordFormData) =>
      userApi.updateProfile({ password: data.newPassword }),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("비밀번호가 성공적으로 변경되었습니다!")
        resetPassword()
      } else {
        toast.error(response.error?.message || "비밀번호 변경에 실패했습니다")
      }
    },
    onError: (error) => {
      console.error("Password update error:", error)
      toast.error("비밀번호 변경 중 오류가 발생했습니다")
    },
  })

  // 로그아웃 Mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("로그아웃되었습니다")
        router.push("/login")
      } else {
        toast.error(response.error?.message || "로그아웃에 실패했습니다")
      }
    },
    onError: (error) => {
      console.error("Logout error:", error)
      toast.error("로그아웃 중 오류가 발생했습니다")
    },
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다")
      return
    }

    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다")
      return
    }

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 이미지 업로드
    uploadImageMutation.mutate(file)
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const onProfileSubmit = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = (data: UpdatePasswordFormData) => {
    updatePasswordMutation.mutate(data)
  }

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const currentProfileImage = imagePreview || user?.img_url || "/placeholder-avatar.jpg"

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* 프로필 정보 요약 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="size-5" />
            내 정보
          </CardTitle>
          <CardDescription>현재 프로필 정보를 확인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* 프로필 이미지 */}
            <Avatar className="size-32 border-4 border-primary/10">
              <AvatarImage src={currentProfileImage} alt="프로필 이미지" />
              <AvatarFallback>
                <User className="size-16" />
              </AvatarFallback>
            </Avatar>

            {/* 사용자 정보 */}
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">닉네임</p>
                    <p className="font-semibold">{user?.nickname || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">이메일</p>
                    <p className="font-semibold">{user?.email || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">가입일</p>
                    <p className="font-semibold">{formatDate(user?.created_at)}</p>
                  </div>
                </div>

                {user?.updated_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">최근 수정일</p>
                      <p className="font-semibold">{formatDate(user.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 프로필 이미지 변경 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="size-5" />
            프로필 사진
          </CardTitle>
          <CardDescription>프로필 사진을 업로드하거나 변경할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage src={currentProfileImage} alt="프로필 이미지" />
                <AvatarFallback>
                  <User className="size-12" />
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={handleImageClick}
                disabled={uploadImageMutation.isPending}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                aria-label="프로필 사진 변경"
              >
                <Upload className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                JPG, PNG 또는 GIF 형식의 이미지를 업로드할 수 있습니다
              </p>
              <p className="text-sm text-muted-foreground">권장 크기: 400x400px 이상</p>
              {uploadImageMutation.isPending && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">업로드 중... {Math.round(uploadProgress)}%</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 이름 변경 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            이름 변경
          </CardTitle>
          <CardDescription>표시될 이름을 변경할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="nickname">이름</FieldLabel>
              <Input
                id="nickname"
                type="text"
                {...registerProfile("nickname")}
                placeholder="이름을 입력하세요"
                disabled={isLoadingProfile}
              />
              {profileErrors.nickname && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.nickname.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">이메일 (읽기 전용)</FieldLabel>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
            </Field>
            <Button type="submit" disabled={updateProfileMutation.isPending || isLoadingProfile}>
              {updateProfileMutation.isPending ? "저장 중..." : "이름 저장"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            비밀번호 변경
          </CardTitle>
          <CardDescription>계정 보안을 위해 비밀번호를 변경할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="current-password">현재 비밀번호</FieldLabel>
              <Input
                id="current-password"
                type="password"
                {...registerPassword("currentPassword")}
                placeholder="현재 비밀번호를 입력하세요"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </Field>
            <Separator />
            <Field>
              <FieldLabel htmlFor="new-password">새 비밀번호</FieldLabel>
              <Input
                id="new-password"
                type="password"
                {...registerPassword("newPassword")}
                placeholder="새 비밀번호를 입력하세요"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">새 비밀번호 확인</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                {...registerPassword("confirmPassword")}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </Field>
            <Button type="submit" disabled={updatePasswordMutation.isPending}>
              {updatePasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 로그아웃 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="size-5" />
            로그아웃
          </CardTitle>
          <CardDescription>계정에서 로그아웃합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
