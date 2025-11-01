import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-start gap-6 p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">프로필 설정</h1>
          <p className="text-muted-foreground mt-1">프로필 사진, 이름, 비밀번호를 수정할 수 있습니다</p>
        </div>
        <ProfileForm />
      </div>
    </div>
  )
}
