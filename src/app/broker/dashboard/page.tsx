"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Database,
  CheckCircle,
  ShoppingCart,
  History,
  Wallet,
  Globe,
  Loader2,
  FileText,
  Download,
} from "lucide-react";
import { formatCurrency, calculateDataPrice } from "~/lib/utils";
import type { DataSource } from "~/types";
import { toast } from "~/components/ui/use-toast";
import { Web3Provider } from "~/components/providers/web3-provider";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { MockUserProfile } from "~/lib/mock-user-data";
import Link from "next/link";

interface PurchaseResult {
  transactionHash?: string;
  dataPoints: MockUserProfile[];
  totalCost: number;
  purchaseId: string;
  purchaseInfo?: any;
}

const availableDataSources: DataSource[] = [
  { platform: "netflix", price: 1.25 },
  { platform: "spotify", price: 1.0 },
  { platform: "instagram", price: 1.75 },
  { platform: "apple-music", price: 0.75 },
  { platform: "facebook", price: 2.0 },
];

const dataSourcePrices = Object.fromEntries(
  availableDataSources.map((ds) => [ds.platform, ds.price]),
);

function BrokerDashboardContent() {
  const { isConnected } = useAccount();

  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(
    null,
  );
  const [recentPurchases, setRecentPurchases] = useState<PurchaseResult[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { totalPrice, breakdown, discount } = calculateDataPrice(
    dataSourcePrices,
    selectedSources,
    quantity,
  );

  const handleSuccessfulPurchase = (
    dataPoints: MockUserProfile[],
    purchaseInfo: any,
  ) => {
    const result: PurchaseResult = {
      dataPoints,
      totalCost: totalPrice,
      purchaseId: purchaseInfo.purchaseId || `purchase-${Date.now()}`,
      purchaseInfo,
    };

    setPurchaseResult(result);
    setRecentPurchases((prev) => [result, ...prev.slice(0, 4)]); // Keep last 5 purchases

    toast({
      title: "Purchase Successful!",
      description: `Received ${dataPoints.length} data points via x402 payment.`,
      variant: "default",
    });

    // Reset form
    setSelectedSources([]);
    setQuantity(1);
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make payments.",
        variant: "destructive",
      });
      return;
    }

    if (selectedSources.length === 0) {
      toast({
        title: "No Data Sources Selected",
        description: "Please select at least one data source to purchase.",
        variant: "destructive",
      });
      return;
    }

    if (quantity < 1 || quantity > 1000) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a quantity between 1 and 1000.",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);

    try {
      toast({
        title: "Processing Payment",
        description: "Initiating x402 payment flow...",
        variant: "default",
      });

      // Make request to x402-protected endpoint
      const response = await fetch("/api/data-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: selectedSources, quantity }),
      });

      if (response.status === 402) {
        const paymentInfo = await response.json();

        toast({
          title: "Payment Required",
          description: `x402 payment needed: ${paymentInfo.amount || "$" + totalPrice.toFixed(2)} USDC`,
          variant: "destructive",
        });

        // Simulate successful payment after a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast({
          title: "x402 Payment Completed",
          description: "Payment processed, fetching data...",
          variant: "default",
        });

        // Simulate the successful retry with payment
        const retryResponse = await fetch("/api/data-purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-PAYMENT": "simulated-payment-header",
          },
          body: JSON.stringify({ sources: selectedSources, quantity }),
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          if (data.success) {
            handleSuccessfulPurchase(data.dataPoints, data.purchaseInfo);
            return;
          }
        }
      } else if (response.ok) {
        const data = await response.json();
        if (data.success) {
          handleSuccessfulPurchase(data.dataPoints, data.purchaseInfo);
          return;
        }
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error("x402 Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "x402 payment failed",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const downloadDataAsJSON = (result: PurchaseResult) => {
    const dataBlob = new Blob([JSON.stringify(result.dataPoints, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-purchase-${result.purchaseId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Navigation Header */}
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <Globe className="text-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-foreground text-xl font-bold">
                    DataMarket
                  </h1>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              x402 Data Broker Portal
            </h1>
            <p className="text-muted-foreground text-lg">
              Purchase bulk consumer data with automatic x402 payments on Base
              Sepolia.
            </p>
          </div>

          {/* Status Overview */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Wallet Status
                </CardTitle>
                <Wallet className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div
                  className={`flex items-center text-2xl font-bold ${isConnected ? "text-success" : "text-destructive"}`}
                >
                  {isConnected ? "Connected" : "Not Connected"}
                </div>
                <p className="text-muted-foreground text-xs">
                  {isConnected
                    ? "Ready to make payments"
                    : "Please connect wallet"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Current Order
                </CardTitle>
                <ShoppingCart className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-primary text-2xl font-bold">
                  {formatCurrency(totalPrice)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {quantity} data points selected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Recent Purchases
                </CardTitle>
                <History className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  {recentPurchases.length}
                </div>
                <p className="text-muted-foreground text-xs">This session</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  x402 Status
                </CardTitle>
                <Database className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div
                  className={`flex items-center text-2xl font-bold ${isPurchasing ? "text-info" : "text-foreground"}`}
                >
                  {isPurchasing ? "Processing..." : "Ready"}
                </div>
                <p className="text-muted-foreground text-xs">
                  {isPurchasing ? "Initiating payment..." : "Awaiting purchase"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Bulk Data Purchase */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="text-primary mr-3 h-5 w-5" />
                    x402 Bulk Data Purchase
                  </CardTitle>
                  <CardDescription>
                    Select data types and quantity - payments handled
                    automatically via x402.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-medium">
                      Data Sources to Purchase
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {availableDataSources.map((source) => (
                        <div
                          key={source.platform}
                          className={`cursor-pointer rounded-lg border p-3 transition-all ${
                            selectedSources.includes(source.platform)
                              ? "bg-primary/10 border-primary"
                              : "bg-secondary hover:border-border"
                          }`}
                          onClick={() => {
                            setSelectedSources((prev) =>
                              prev.includes(source.platform)
                                ? prev.filter((s) => s !== source.platform)
                                : [...prev, source.platform],
                            );
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">
                              {source.platform.replace("-", " ")}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              ${source.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="mb-2 block text-sm font-medium"
                    >
                      Number of Data Points
                      {discount > 0 && (
                        <span className="text-success ml-2 text-xs font-normal">
                          ({discount * 100}% bulk discount applied)
                        </span>
                      )}
                    </label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max="1000"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-32"
                      />
                      <div className="flex space-x-2">
                        {[10, 50, 100].map((val) => (
                          <Button
                            key={val}
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(val)}
                          >
                            {val}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedSources.length > 0 && (
                    <Card className="bg-secondary">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">
                          Cost Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="text-muted-foreground flex justify-between">
                          <span>Base cost per data point</span>
                          <span>
                            {formatCurrency(
                              Object.values(breakdown).reduce(
                                (s, v) => s + v,
                                0,
                              ) / quantity,
                              "USD",
                            )}
                          </span>
                        </div>
                        <div className="text-muted-foreground flex justify-between">
                          <span>Quantity</span>
                          <span>x {quantity}</span>
                        </div>
                        {discount > 0 && (
                          <div className="text-success flex justify-between">
                            <span>Bulk Discount ({discount * 100}%)</span>
                            <span>
                              -{" "}
                              {formatCurrency(
                                totalPrice / (1 - discount) - totalPrice,
                                "USD",
                              )}
                            </span>
                          </div>
                        )}
                        <div className="border-border mt-2 flex justify-between border-t pt-2 font-semibold">
                          <span>Total (USDC)</span>
                          <span>{formatCurrency(totalPrice, "USD")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={handlePurchase}
                    disabled={
                      isPurchasing ||
                      !isConnected ||
                      selectedSources.length === 0
                    }
                    className="w-full"
                    size="lg"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Processing x402 Payment...
                      </>
                    ) : (
                      `Purchase for ${formatCurrency(totalPrice, "USDC")} USDC`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Purchase Result */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="text-primary mr-3 h-5 w-5" />
                    Purchase Result
                  </CardTitle>
                  <CardDescription>
                    Your purchased data will appear here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {purchaseResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="text-success flex items-center font-medium">
                          <CheckCircle className="mr-1 h-4 w-4" /> Completed
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Data Points
                        </span>
                        <span className="font-medium">
                          {purchaseResult.dataPoints.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total Cost
                        </span>
                        <span className="font-medium">
                          {formatCurrency(purchaseResult.totalCost, "USDC")}
                        </span>
                      </div>
                      <Button
                        onClick={() => downloadDataAsJSON(purchaseResult)}
                        className="w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download JSON
                      </Button>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      {isPurchasing ? (
                        <div className="space-y-3">
                          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
                          <p className="text-muted-foreground">
                            Finalizing purchase...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <FileText className="text-muted-foreground mx-auto h-8 w-8" />
                          <p className="text-muted-foreground">
                            Awaiting data purchase
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BrokerDashboard() {
  return (
    <Web3Provider>
      <BrokerDashboardContent />
    </Web3Provider>
  );
}
