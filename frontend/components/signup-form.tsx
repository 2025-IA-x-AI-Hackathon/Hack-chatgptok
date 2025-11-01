"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { signupSchema, type SignupFormData } from "@/lib/schemas/auth"
import { authApi, uploadApi } from "@/lib/api"
import Image from "next/image"

export function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  })

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  // 이미지 업로드 mutation
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
        setValue("img", imageUrl)
        toast.success("이미지가 업로드되었습니다")
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

  // 회원가입 mutation
  const signupMutation = useMutation({
    mutationFn: (data: SignupFormData) =>
      authApi.signup({
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        img: data.img,
      }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // 쿠키에 accessToken 저장 (7일 유효)
        document.cookie = `accessToken=${response.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`

        // localStorage에도 저장
        localStorage.setItem("accessToken", response.data.accessToken)
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken)
          document.cookie = `refreshToken=${response.data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`
        }

        toast.success("회원가입 성공!")
        router.push("/")
      } else {
        toast.error(response.error?.message || "회원가입에 실패했습니다")
      }
    },
    onError: (error) => {
      console.error("Signup error:", error)
      toast.error("회원가입 중 오류가 발생했습니다")
    },
  })

  const handleEmailNext = async () => {
    const isValid = await trigger("email")
    if (isValid) {
      setStep(2)
    }
  }

  const handlePasswordNext = async () => {
    const isValid = await trigger(["password", "passwordConfirm"])
    if (isValid) {
      setStep(3)
    }
  }

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

  const handleRemoveImage = () => {
    setImagePreview("")
    setValue("img", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data)
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            {step} / {totalSteps}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1: 이메일 입력 */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-center mb-2">회원가입</h1>
          <p className="text-center text-gray-600 mb-8">이메일을 입력해주세요</p>

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="이메일을 입력하세요"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-transparent text-gray-700 font-semibold py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleEmailNext}
                className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: 비밀번호 입력 */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-center mb-2">비밀번호 설정</h1>
          <p className="text-center text-gray-600 mb-8">
            사용하실 비밀번호를 입력해주세요
          </p>

          <div className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="비밀번호를 입력하세요"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-2">
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                type="password"
                {...register("passwordConfirm")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-transparent text-gray-700 font-semibold py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handlePasswordNext}
                className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 닉네임 및 프로필 이미지 입력 */}
      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-center mb-2">프로필 설정</h1>
          <p className="text-center text-gray-600 mb-8">
            닉네임과 프로필 이미지를 설정해주세요
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium mb-2">
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                {...register("nickname")}
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="닉네임을 입력하세요"
              />
              {errors.nickname && (
                <p className="mt-1 text-sm text-red-600">{errors.nickname.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                프로필 이미지 <span className="text-red-500">*</span>
              </label>

              {imagePreview ? (
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={imagePreview}
                    alt="프로필 미리보기"
                    fill
                    className="rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">이미지 없음</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadImageMutation.isPending}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadImageMutation.isPending
                  ? `업로드 중... ${Math.round(uploadProgress)}%`
                  : "이미지 선택"}
              </button>

              {uploadImageMutation.isPending && (
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {errors.img && (
                <p className="mt-1 text-sm text-red-600">{errors.img.message}</p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-transparent text-gray-700 font-semibold py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={signupMutation.isPending || uploadImageMutation.isPending}
                className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signupMutation.isPending ? "가입 중..." : "가입하기"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
