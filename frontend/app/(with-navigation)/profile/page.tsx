import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">프로필 설정</h1>
          <p className="text-muted-foreground mt-1">프로필 사진, 이름, 비밀번호를 수정할 수 있습니다</p>
        </div>
        <ProfileForm />
      </div>
    </div>
  )
}
