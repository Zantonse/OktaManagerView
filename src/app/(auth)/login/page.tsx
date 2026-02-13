"use server";

import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default async function LoginPage() {
  async function handleSignIn() {
    "use server";
    await signIn("okta");
  }

  return (
    <div className="w-full max-w-[400px] mx-4">
      <div className="flex flex-col items-center gap-7">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1d1d21]">
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#1d1d21]">
            Okta Manager
          </span>
        </div>

        {/* Card */}
        <div className="w-full rounded-xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-[17px] font-semibold text-[#1d1d21]">
                Sign In
              </h2>
              <p className="text-sm text-[#6e6e78]">
                Sign in with your account to access Manager Dashboard
              </p>
            </div>

            <form action={handleSignIn} className="w-full">
              <Button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#1662dd] hover:bg-[#1456c0] text-white font-semibold text-sm transition-colors"
                size="lg"
              >
                Sign in with Okta
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
