"use client"

import { useState, useRef } from "react"
import { Camera, User, Lock, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

export function ProfileForm() {
  const [profileImage, setProfileImage] = useState<string>("/placeholder-avatar.jpg")
  const [name, setName] = useState<string>("사용자 이름")
  const [currentPassword, setCurrentPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // API 호출 예시
      // await fetch('/api/profile/name', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name })
      // })

      console.log("이름 변경:", name)
      alert("이름이 성공적으로 변경되었습니다!")
    } catch (error) {
      console.error("이름 변경 실패:", error)
      alert("이름 변경에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.")
      return
    }

    if (newPassword.length < 8) {
      alert("비밀번호는 최소 8자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)

    try {
      // API 호출 예시
      // await fetch('/api/profile/password', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ currentPassword, newPassword })
      // })

      console.log("비밀번호 변경 요청")
      alert("비밀번호가 성공적으로 변경되었습니다!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("비밀번호 변경 실패:", error)
      alert("비밀번호 변경에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async () => {
    setIsLoading(true)

    try {
      // API 호출 예시
      // const formData = new FormData()
      // formData.append('image', fileInputRef.current?.files?.[0] as Blob)
      // await fetch('/api/profile/image', {
      //   method: 'PUT',
      //   body: formData
      // })

      console.log("프로필 이미지 업로드")
      alert("프로필 사진이 성공적으로 변경되었습니다!")
    } catch (error) {
      console.error("이미지 업로드 실패:", error)
      alert("프로필 사진 변경에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 프로필 이미지 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="size-5" />
            프로필 사진
          </CardTitle>
          <CardDescription>
            프로필 사진을 업로드하거나 변경할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage src={profileImage} alt="프로필 이미지" />
                <AvatarFallback>
                  <User className="size-12" />
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={handleImageClick}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-transform hover:scale-110"
                aria-label="프로필 사진 변경"
              >
                <Upload className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                JPG, PNG 또는 GIF 형식의 이미지를 업로드할 수 있습니다
              </p>
              <p className="text-sm text-muted-foreground">
                권장 크기: 400x400px 이상
              </p>
              <Button
                onClick={handleImageUpload}
                disabled={isLoading}
                className="w-fit"
              >
                사진 저장
              </Button>
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
          <CardDescription>
            표시될 이름을 변경할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">이름</FieldLabel>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
              />
            </Field>
            <Button type="submit" disabled={isLoading}>
              이름 저장
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
          <CardDescription>
            계정 보안을 위해 비밀번호를 변경할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="current-password">현재 비밀번호</FieldLabel>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                required
              />
            </Field>
            <Separator />
            <Field>
              <FieldLabel htmlFor="new-password">새 비밀번호</FieldLabel>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                required
                minLength={8}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">새 비밀번호 확인</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                required
                minLength={8}
              />
            </Field>
            <Button type="submit" disabled={isLoading}>
              비밀번호 변경
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
