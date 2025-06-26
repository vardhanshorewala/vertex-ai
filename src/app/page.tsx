import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Users, Building2, Sparkles, Wallet, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Data Marketplace
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Platform</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A secure, three-sided marketplace connecting consumers, data brokers, and businesses. 
            Share your data safely with custodial wallet earnings and instant payments via x402 on Base.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Custodial Wallets</h3>
            <p className="text-gray-400">Secure wallet management with automatic earnings from data sales</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">x402 Payments</h3>
            <p className="text-gray-400">Instant cryptocurrency payments on Base testnet</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">CDP Off-Ramp</h3>
            <p className="text-gray-400">Convert crypto earnings to fiat with Coinbase integration</p>
          </div>
        </div>

        {/* Platform Access Cards */}
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
                <Link href="/consumer/dashboard">Access Consumer Portal</Link>
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
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Interactive Demo</CardTitle>
              <CardDescription className="text-gray-300">
                Experience the marketplace with AI-powered recommendations. Connect your wallet and see the payment flow in action.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  RainbowKit wallet connection
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  AI-powered recommendations
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Live payment demonstrations
                </div>
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700">
                <Link href="/demo/search">Try Interactive Demo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-8">Powered by Modern Web3 Technology</h2>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="bg-white/10 px-4 py-2 rounded-full">x402 Payments</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">Base Testnet</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">Coinbase CDP</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">RainbowKit</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">Vercel AI SDK</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">Next.js</span>
          </div>
        </div>
      </div>
    </main>
  );
}
