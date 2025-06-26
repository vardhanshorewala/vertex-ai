"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Building2, Users, Zap, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Auth */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">Data Marketplace</h1>
            <p className="text-xl text-gray-300">Secure three-sided marketplace for consumer data</p>
          </div>
          
          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="text-gray-300">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white">
                  <User className="w-5 h-5" />
                  <span>Hello, {session.user?.name}</span>
                </div>
                <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Link href="/consumer/dashboard">
                    Dashboard
                  </Link>
                </Button>
                <Button 
                  onClick={() => signOut()}
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => signIn('google')}
                  className="bg-white hover:bg-gray-100 text-gray-900 font-semibold"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In with Google
                </Button>
                <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Link href="/auth/signin">
                    Learn More
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            Connecting Consumers, Brokers, and Businesses
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            A secure platform where consumers monetize their data, brokers access verified information, 
            and businesses gain insights through x402 payments on Base testnet with CDP custodial wallets.
          </p>
          
          {!session && (
            <div className="space-y-4">
              <Button 
                onClick={() => signIn('google')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold px-8 py-4 text-lg"
              >
                Get Started - Sign In Free
              </Button>
              <p className="text-gray-400 text-sm">
                Secure Google OAuth • One wallet per account • Your data, your control
              </p>
            </div>
          )}
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Consumer Platform */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Consumer Dashboard</CardTitle>
              <CardDescription className="text-gray-300">
                Connect your accounts, manage your data, and earn from sharing. Monitor your custodial wallet and withdraw earnings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Link Netflix, Spotify, Instagram & more
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Secure custodial wallet with earnings tracking
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Withdraw to wallet or bank account
                </div>
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Link href={session ? "/consumer/dashboard" : "/auth/signin"}>
                  {session ? "Access Dashboard" : "Sign In to Access"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Data Broker Platform */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Data Broker API</CardTitle>
              <CardDescription className="text-gray-300">
                Purchase consumer data with x402 payments. Access verified data sources with automatic fund distribution to consumers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  x402 protected API endpoints
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Dynamic pricing with bulk discounts
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Automatic consumer wallet crediting
                </div>
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                <Link href="/broker/dashboard">Access Broker Portal</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Demo Platform */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Interactive Demo</CardTitle>
              <CardDescription className="text-gray-300">
                Experience the complete marketplace workflow with RainbowKit wallet connections and AI-powered recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  RainbowKit wallet integration
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  AI-powered data recommendations
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Live payment demonstrations
                </div>
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                <Link href="/demo/search">Try Interactive Demo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Secure Authentication</h4>
              <p className="text-gray-300 text-sm">Google OAuth integration with NextAuth for secure user management</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-2">CDP Wallets</h4>
              <p className="text-gray-300 text-sm">Real Coinbase Developer Platform wallets on Base Sepolia testnet</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-2">x402 Payments</h4>
              <p className="text-gray-300 text-sm">Automated payment processing with fund distribution to consumers</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-2">AI Recommendations</h4>
              <p className="text-gray-300 text-sm">Vercel AI SDK integration for personalized data insights</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!session && (
          <div className="mt-16 text-center bg-white/5 rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-gray-300 mb-6">
              Join the marketplace and start monetizing your data or accessing verified consumer insights.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => signIn('google')}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Sign In with Google
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/auth/signin">Learn More</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
