import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    // .min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  email: z
    .email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요"),
    // .min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  passwordConfirm: z
    .string()
    .min(1, "비밀번호 확인을 입력해주세요"),
  nickname: z
    .string()
    .min(1, "닉네임을 입력해주세요")
    .min(2, "닉네임은 최소 2자 이상이어야 합니다"),
  img: z
    .string()
    .optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["passwordConfirm"],
})

export type SignupFormData = z.infer<typeof signupSchema>
