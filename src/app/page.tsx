"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Building2,
  Users,
  Zap,
  LogIn,
  LogOut,
  User,
  Shield,
  DollarSign,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="bg-background min-h-screen">
      {/* Navigation Header */}
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Globe className="text-primary-foreground h-5 w-5" />
              </div>
              <h1 className="text-foreground text-xl font-bold">DataMarket</h1>
              <p className="text-muted-foreground text-xs">
                Consumer Data Platform
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-secondary flex h-8 w-8 items-center justify-center rounded-full">
                      <User className="text-muted-foreground h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">
                      Hello, {session.user?.name}
                    </span>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/consumer/dashboard">Dashboard</Link>
                  </Button>
                  <Button onClick={() => signOut()} variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button onClick={() => signIn("google")} size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/signin">Learn More</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium">
              <Zap className="mr-2 h-4 w-4" />
              Secure Data Marketplace
            </div>

            <h1 className="text-foreground mb-6">
              Connect Consumers,
              <br />
              Brokers, and Businesses
            </h1>

            <p className="lead mx-auto mb-8 max-w-2xl">
              A secure platform where consumers monetize their data, brokers
              access verified information, and businesses gain insights through
              x402 payments on Base testnet.
            </p>

            {!session && (
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  onClick={() => signIn("google")}
                  size="lg"
                  className="w-full cursor-pointer sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="/demo/search">Try Demo</Link>
                </Button>
              </div>
            )}

            {session && (
              <Button asChild size="lg">
                <Link href="/consumer/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4">Choose Your Platform</h2>
            <p className="lead mx-auto max-w-2xl">
              Three specialized dashboards designed for different user roles in
              the data marketplace ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Consumer Platform */}
            <Card className="shadow-soft hover:shadow-medium interactive hover:border-primary/20 border-2 transition-all duration-300">
              <CardHeader className="card-padding pb-4">
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Users className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">
                  Consumer Dashboard
                </CardTitle>
                <CardDescription>
                  Connect your accounts, manage your data, and earn from sharing
                  with complete control.
                </CardDescription>
              </CardHeader>
              <CardContent className="card-padding pt-0">
                <div className="mb-6 space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>Link Netflix, Spotify, Instagram & more</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>Secure custodial wallet with earnings tracking</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>Withdraw to wallet or bank account</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={session ? "/consumer/dashboard" : "/auth/signin"}>
                    {session ? "Access Dashboard" : "Get Started"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Data Broker Platform */}
            <Card className="shadow-soft hover:shadow-medium interactive hover:border-success/20 border-2 transition-all duration-300">
              <CardHeader className="card-padding pb-4">
                <div className="bg-success/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Building2 className="text-success h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">
                  Data Broker API
                </CardTitle>
                <CardDescription>
                  Purchase consumer data with x402 payments and access verified
                  data sources.
                </CardDescription>
              </CardHeader>
              <CardContent className="card-padding pt-0">
                <div className="mb-6 space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>x402 protected API endpoints</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>Dynamic pricing with bulk discounts</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>Automatic consumer wallet crediting</span>
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/broker/dashboard">Access Broker Portal</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Demo Platform */}
            <Card className="shadow-soft hover:shadow-medium interactive hover:border-info/20 border-2 transition-all duration-300">
              <CardHeader className="card-padding pb-4">
                <div className="bg-info/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Zap className="text-info h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">
                  Interactive Demo
                </CardTitle>
                <CardDescription>
                  Experience the complete marketplace workflow with AI-powered
                  recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="card-padding pt-0">
                <div className="mb-6 space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>RainbowKit wallet integration</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>AI-powered data recommendations</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    <span>Live payment demonstrations</span>
                  </div>
                </div>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/demo/search">Try Demo</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4">Platform Features</h2>
            <p className="lead mx-auto max-w-2xl">
              Built with modern technology stack for security, scalability, and
              user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <h4 className="text-foreground mb-2 font-semibold">
                Secure Authentication
              </h4>
              <p className="text-muted-foreground text-sm">
                Google OAuth integration with NextAuth for secure user
                management
              </p>
            </div>

            <div className="text-center">
              <div className="bg-success/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <DollarSign className="text-success h-6 w-6" />
              </div>
              <h4 className="text-foreground mb-2 font-semibold">
                CDP Wallets
              </h4>
              <p className="text-muted-foreground text-sm">
                Real Coinbase Developer Platform wallets on Base Sepolia testnet
              </p>
            </div>

            <div className="text-center">
              <div className="bg-info/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Zap className="text-info h-6 w-6" />
              </div>
              <h4 className="text-foreground mb-2 font-semibold">
                x402 Payments
              </h4>
              <p className="text-muted-foreground text-sm">
                Automated payment processing with fund distribution to consumers
              </p>
            </div>

            <div className="text-center">
              <div className="bg-warning/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Smartphone className="text-warning h-6 w-6" />
              </div>
              <h4 className="text-foreground mb-2 font-semibold">
                AI Recommendations
              </h4>
              <p className="text-muted-foreground text-sm">
                Vercel AI SDK integration for personalized data insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!session && (
        <section className="section-padding">
          <div className="container">
            <div className="bg-card border-border card-padding shadow-soft mx-auto max-w-3xl rounded-2xl border text-center">
              <h3 className="text-foreground mb-4">Ready to Get Started?</h3>
              <p className="lead mb-8">
                Join the marketplace and start monetizing your data or accessing
                verified consumer insights.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  onClick={() => signIn("google")}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sign In with Google
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="/auth/signin">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-border bg-surface border-t">
        <div className="container">
          <div className="py-8 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-md">
                <Globe className="text-primary-foreground h-4 w-4" />
              </div>
              <span className="text-foreground font-semibold">DataMarket</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Secure three-sided marketplace for consumer data sharing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
