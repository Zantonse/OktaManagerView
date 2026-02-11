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
    <div className="w-full max-w-sm mx-4">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Okta Manager</span>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-lg font-semibold text-white">
                Welcome back
              </h2>
              <p className="text-sm text-white/50">
                Sign in to manage your team&apos;s access and governance
              </p>
            </div>

            <form action={handleSignIn} className="w-full">
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                size="lg"
              >
                Sign in with Okta
              </Button>
            </form>
          </div>
        </div>

        <p className="text-xs text-white/30">
          Identity governance portal
        </p>
      </div>
    </div>
  );
}
