"use server";

import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default async function LoginPage() {
  async function handleSignIn() {
    "use server";
    await signIn("okta");
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-lg">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Okta Manager</h1>
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Okta Manager Portal
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your team&apos;s access
          </p>
        </div>

        {/* Sign In Button */}
        <form action={handleSignIn} className="w-full">
          <Button type="submit" className="w-full" size="lg">
            Sign in with Okta
          </Button>
        </form>
      </div>
    </Card>
  );
}
