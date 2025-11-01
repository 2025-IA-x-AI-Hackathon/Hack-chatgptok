"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 2
  const progress = (step / totalSteps) * 100

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setStep(2)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.")
      return
    }

    setIsLoading(true)

    // TODO: 실제 회원가입 API 호출 로직 구현
    try {
      console.log("Signup attempt:", { email, password })

      // 성공 시 로그인 페이지로 이동
      // router.push("/login")
    } catch (error) {
      console.error("Signup failed:", error)
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-center mb-2">
            회원가입
          </h1>
          <p className="text-center text-gray-600 mb-8">
            이메일을 입력해주세요
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="이메일을 입력하세요"
              />
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
                className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                다음
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: 비밀번호 입력 */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-center mb-2">
            비밀번호 설정
          </h1>
          <p className="text-center text-gray-600 mb-8">
            사용하실 비밀번호를 입력해주세요
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-2">
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="비밀번호를 다시 입력하세요"
              />
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
                disabled={isLoading}
                className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "가입 중..." : "가입하기"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
