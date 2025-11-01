"use client"

import { UserPlus } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 p-8 animate-scale-in">
        <form className="space-y-6">
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
              <FieldLabel htmlFor="name" className="text-base font-semibold">이름</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                required
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
                className="h-12 text-base rounded-xl border-border/50 focus:border-primary/50 transition-colors"
              />
            </Field>
            <Field className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gradient-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                가입하기
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
