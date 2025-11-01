"use client"

import { UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/api"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!formData.nickname || !formData.email || !formData.password || !formData.passwordConfirm) {
      toast.error("모든 필드를 입력해주세요.")
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.")
      return
    }

    if (formData.password.length < 8) {
      toast.error("비밀번호는 최소 8자 이상이어야 합니다.")
      return
    }

    setLoading(true)

    try {
      const response = await authApi.register({
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
      })

      if (response.success && response.data) {
        toast.success("회원가입이 완료되었습니다!")
        // 회원가입 성공 시 홈으로 이동
        router.push("/")
      } else {
        toast.error(response.error?.message || "회원가입에 실패했습니다.")
      }
    } catch (error) {
      toast.error("회원가입 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 p-8 animate-scale-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <div className="flex flex-col items-center gap-3 text-center mb-8">
              <div className="flex size-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                <UserPlus className="size-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">회원가입</h1>
              <FieldDescription className="text-base">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  로그인
                </Link>
              </FieldDescription>
            </div>
            <Field>
              <FieldLabel htmlFor="nickname" className="text-base font-semibold">닉네임</FieldLabel>
              <Input
                id="nickname"
                type="text"
                placeholder="홍길동"
                required
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="h-12 text-base rounded-xl border-border/50 focus:border-primary/50 transition-colors"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email" className="text-base font-semibold">이메일</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 text-base rounded-xl border-border/50 focus:border-primary/50 transition-colors"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password" className="text-base font-semibold">비밀번호</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 text-base rounded-xl border-border/50 focus:border-primary/50 transition-colors"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password-confirm" className="text-base font-semibold">비밀번호 확인</FieldLabel>
              <Input
                id="password-confirm"
                type="password"
                placeholder="••••••••"
                required
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                className="h-12 text-base rounded-xl border-border/50 focus:border-primary/50 transition-colors"
              />
            </Field>
            <Field className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold gradient-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? "가입 중..." : "가입하기"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
