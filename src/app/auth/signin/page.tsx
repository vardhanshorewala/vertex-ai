"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft, CheckCircle, Loader2, Globe } from "lucide-react";
import Link from "next/link";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/consumer/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Globe className="text-primary-foreground h-5 w-5" />
              </div>
              <h1 className="text-foreground text-xl font-bold">DataMarket</h1>
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="section-padding flex items-center justify-center">
        <div className="container max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in with your Google account to access your dashboard and
                manage your data earnings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary space-y-3 rounded-lg p-4">
                <div className="flex items-center text-sm">
                  <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                  <span>Secure OAuth 2.0 authentication</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                  <span>You own and control your data</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                  <span>One secure custodial wallet per account</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 48 48">
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      ></path>
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      ></path>
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,35.531,44,29.891,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-muted-foreground text-xs">
                  By signing in, you agree to our privacy practices and data
                  handling policies.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
