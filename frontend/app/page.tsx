import { SignIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex w-full h-screen flex-col items-center justify-center">
      <SignIn signInUrl="/dashboard" />
    </div>
  );
}
