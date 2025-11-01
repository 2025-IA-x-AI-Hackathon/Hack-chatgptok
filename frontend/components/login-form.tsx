"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth"
import { authApi } from "@/lib/api"

export function LoginForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
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

        toast.success("로그인 성공!")
        // redirect 파라미터 확인
        const searchParams = new URLSearchParams(window.location.search)
        const redirect = searchParams.get("redirect")
        // 이전 페이지로 이동하거나 메인 페이지로 이동
        router.push(redirect || "/")
      } else {
        toast.error(response.error?.message || "로그인에 실패했습니다")
      }
    },
    onError: (error) => {
      console.error("Login error:", error)
      toast.error("로그인 중 오류가 발생했습니다")
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  const handleSignup = () => {
    router.push("/signup")
  }

  return (
    <div className="w-full max-w-md mx-auto px-6">
      {/* 로고 */}
      <div className="flex justify-center mb-8">
        <Image
          src="/logo.png"
          alt="Logo"
          width={100}
          height={100}
          priority
          className="w-20 h-20 md:w-24 md:h-24"
        />
      </div>

      {/* 로그인 폼 */}
      <div>


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 이메일 입력 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="이메일을 입력하세요"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 회원가입 버튼 */}
        <button
          type="button"
          onClick={handleSignup}
          className="w-full mt-4 bg-transparent text-primary font-semibold py-3 rounded-lg border-2 border-primary hover:bg-primary/5 transition-colors"
        >
          회원가입하기
        </button>
      </div>
    </div>
  )
}