import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  )
}
