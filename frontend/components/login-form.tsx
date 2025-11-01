"use client"

import { LogIn } from "lucide-react"
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error("이메일과 비밀번호를 입력해주세요.")
      return
    }

    setLoading(true)

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      })

      if (response.success && response.data) {
        toast.success("로그인되었습니다.")
        // 로그인 성공 시 홈으로 이동
        router.push("/")
      } else {
        toast.error(response.error?.message || "로그인에 실패했습니다.")
      }
    } catch (error) {
      toast.error("로그인 중 오류가 발생했습니다.")
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
                <LogIn className="size-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">로그인</h1>
              <FieldDescription className="text-base">
                계정이 없으신가요?{" "}
                <Link href="/signup" className="text-primary font-semibold hover:underline">
                  회원가입
                </Link>
              </FieldDescription>
            </div>
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
            <Field className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold gradient-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
