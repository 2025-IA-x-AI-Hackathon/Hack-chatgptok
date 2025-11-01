"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: 실제 로그인 API 호출 로직 구현
    try {
      // 로그인 처리
      console.log("Login attempt:", { email, password })

      // 성공 시 리다이렉트
      // router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
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


        <form onSubmit={handleLogin} className="space-y-5">
          {/* 이메일 입력 */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="이메일을 입력하세요"
            />
          </div>

          {/* 비밀번호 입력 */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {isLoading ? "로그인 중..." : "로그인"}
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