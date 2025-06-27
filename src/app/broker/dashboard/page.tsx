"use client";

import { useState, useEffect } from "react";
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
  Filter,
  MapPin,
  Users,
  Heart,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { formatCurrency, calculateDataPrice } from "~/lib/utils";
import type { DataSource } from "~/types";
import { toast } from "~/components/ui/use-toast";
import { Web3Provider } from "~/components/providers/web3-provider";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { MockUserProfile } from "~/lib/mock-user-data";
import Link from "next/link";
import { useUSDCPayment } from "~/lib/useUSDCPayment";

interface Country {
  name: { common: string };
  cca2: string;
}

interface State {
  adminName1: string;
  countryCode: string;
}

interface City {
  name: string;
  adminName1?: string;
  countryCode: string;
}

interface FilterOptions {
  countries: Country[];
  states: State[];
  cities: City[];
  ageGroups: string[];
  incomeRanges: string[];
  interests: string[];
  educationLevels: string[];
  employmentStatus: string[];
}

interface SelectedFilters {
  country: string;
  state: string;
  city: string;
  ageGroup: string;
  incomeRange: string;
  interests: string[];
  educationLevel: string;
  employmentStatus: string;
  gender: string;
}

interface PurchaseResult {
  transactionHash?: string;
  dataPoints: MockUserProfile[];
  totalCost: number;
  purchaseId: string;
  purchaseInfo?: any;
  filters?: SelectedFilters;
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

const defaultFilterOptions: FilterOptions = {
  countries: [],
  states: [],
  cities: [],
  ageGroups: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
  incomeRanges: [
    "Under $25k",
    "$25k-$50k",
    "$50k-$75k",
    "$75k-$100k",
    "$100k-$150k",
    "$150k+",
  ],
  interests: [
    "Technology",
    "Fashion",
    "Travel",
    "Fitness",
    "Food & Dining",
    "Entertainment",
    "Sports",
    "Gaming",
    "Music",
    "Books",
    "Home & Garden",
    "Beauty",
    "Health",
    "Automotive",
    "Finance",
    "Education",
    "Art & Culture",
    "Environmental",
    "Politics",
    "Business",
  ],
  educationLevels: [
    "High School",
    "Some College",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Professional Degree",
  ],
  employmentStatus: [
    "Employed Full-time",
    "Employed Part-time",
    "Self-employed",
    "Student",
    "Retired",
    "Unemployed",
  ],
};

function BrokerDashboardContent() {
  const { isConnected } = useAccount();
  const {
    payWithUSDC,
    isProcessing: isPaymentProcessing,
    balance,
    hasInsufficientBalance,
  } = useUSDCPayment();

  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(
    null,
  );
  const [recentPurchases, setRecentPurchases] = useState<PurchaseResult[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(defaultFilterOptions);
  const [loadingGeoData, setLoadingGeoData] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    country: "",
    state: "",
    city: "",
    ageGroup: "",
    incomeRange: "",
    interests: [],
    educationLevel: "",
    employmentStatus: "",
    gender: "",
  });

  const { totalPrice, breakdown, discount } = calculateDataPrice(
    dataSourcePrices,
    selectedSources,
    quantity,
  );

  // Calculate price adjustment based on filters
  const getFilterPriceMultiplier = () => {
    let multiplier = 1.0;
    const activeFilters = Object.entries(selectedFilters).filter(
      ([_key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== "";
      },
    ).length;

    // More specific targeting costs more
    if (activeFilters >= 5) multiplier = 1.5;
    else if (activeFilters >= 3) multiplier = 1.3;
    else if (activeFilters >= 1) multiplier = 1.1;

    return multiplier;
  };

  const finalPrice = totalPrice * getFilterPriceMultiplier();

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingGeoData(true);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2",
        );
        const countries: Country[] = await response.json();
        const sortedCountries = countries.sort((a, b) =>
          a.name.common.localeCompare(b.name.common),
        );
        setFilterOptions((prev) => ({ ...prev, countries: sortedCountries }));
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toast({
          title: "Warning",
          description: "Failed to load country data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingGeoData(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch states when country is selected
  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedFilters.country) {
        setFilterOptions((prev) => ({ ...prev, states: [], cities: [] }));
        return;
      }

      try {
        setLoadingGeoData(true);
        const response = await fetch(
          `https://secure.geonames.org/searchJSON?country=${selectedFilters.country}&featureCode=ADM1&maxRows=100&username=demo`,
        );
        const data = await response.json();

        if (data.geonames) {
          const states: State[] = data.geonames.map((item: any) => ({
            adminName1: item.adminName1,
            countryCode: item.countryCode,
          }));
          const uniqueStates = states.filter(
            (state, index, self) =>
              index ===
              self.findIndex((s) => s.adminName1 === state.adminName1),
          );
          setFilterOptions((prev) => ({
            ...prev,
            states: uniqueStates,
            cities: [],
          }));
        }
      } catch (error) {
        console.error("Failed to fetch states:", error);
      } finally {
        setLoadingGeoData(false);
      }
    };

    fetchStates();
  }, [selectedFilters.country]);

  // Fetch cities when state is selected
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedFilters.state || !selectedFilters.country) {
        setFilterOptions((prev) => ({ ...prev, cities: [] }));
        return;
      }

      try {
        setLoadingGeoData(true);
        const response = await fetch(
          `https://secure.geonames.org/searchJSON?country=${selectedFilters.country}&adminCode1=${selectedFilters.state}&featureClass=P&maxRows=50&username=demo`,
        );
        const data = await response.json();

        if (data.geonames) {
          const cities: City[] = data.geonames.map((item: any) => ({
            name: item.name,
            adminName1: item.adminName1,
            countryCode: item.countryCode,
          }));
          setFilterOptions((prev) => ({ ...prev, cities }));
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      } finally {
        setLoadingGeoData(false);
      }
    };

    fetchCities();
  }, [selectedFilters.state, selectedFilters.country]);

  const handleFilterChange = (
    filterType: keyof SelectedFilters,
    value: string,
  ) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };

      if (filterType === "interests") {
        const currentInterests = prev.interests;
        if (currentInterests.includes(value)) {
          newFilters.interests = currentInterests.filter((i) => i !== value);
        } else {
          newFilters.interests = [...currentInterests, value];
        }
      } else {
        (newFilters as any)[filterType] = value;

        // Reset dependent filters
        if (filterType === "country") {
          newFilters.state = "";
          newFilters.city = "";
        } else if (filterType === "state") {
          newFilters.city = "";
        }
      }

      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      country: "",
      state: "",
      city: "",
      ageGroup: "",
      incomeRange: "",
      interests: [],
      educationLevel: "",
      employmentStatus: "",
      gender: "",
    });
  };

  const getActiveFilterCount = () => {
    return Object.entries(selectedFilters).filter(([_key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== "";
    }).length;
  };

  const handleSuccessfulPurchase = (
    dataPoints: MockUserProfile[],
    purchaseInfo: any,
    transactionHash?: string,
  ) => {
    const result: PurchaseResult = {
      dataPoints,
      totalCost: finalPrice,
      purchaseId: purchaseInfo.purchaseId || `purchase-${Date.now()}`,
      purchaseInfo,
      filters: { ...selectedFilters },
      transactionHash,
    };

    setPurchaseResult(result);
    setRecentPurchases((prev) => [result, ...prev.slice(0, 4)]);

    toast({
      title: "Purchase Successful!",
      description: `Received ${dataPoints.length} targeted data points via USDC payment.`,
      variant: "default",
    });

    // Reset form but keep filters
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

    // Check if user has sufficient USDC balance
    if (hasInsufficientBalance(finalPrice)) {
      toast({
        title: "Insufficient USDC Balance",
        description: `You need ${finalPrice.toFixed(2)} USDC but only have ${balance} USDC in your wallet.`,
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);

    try {
      // Step 1: Process USDC payment via MetaMask
      toast({
        title: "Initiating Payment",
        description: "Processing USDC payment via MetaMask...",
        variant: "default",
      });

      const paymentResult = await payWithUSDC(finalPrice);

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment failed");
      }

      // Step 2: Call API with payment proof
      toast({
        title: "Payment Confirmed",
        description: "Fetching your targeted data...",
        variant: "default",
      });

      const requestBody = {
        sources: selectedSources,
        quantity,
        filters: selectedFilters,
        targetingMultiplier: getFilterPriceMultiplier(),
        paymentProof: {
          transactionHash: paymentResult.transactionHash,
          amount: finalPrice,
          timestamp: Date.now(),
        },
      };

      const response = await fetch("/api/data-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PAYMENT": "usdc-payment-confirmed",
          "X-TRANSACTION-HASH": paymentResult.transactionHash || "",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          handleSuccessfulPurchase(
            data.dataPoints,
            data.purchaseInfo,
            paymentResult.transactionHash,
          );
          return;
        }
      }

      // If API call fails after successful payment, still show success but with warning
      if (response.status >= 400) {
        toast({
          title: "Payment Successful, Data Pending",
          description:
            "Your USDC payment was successful. Data will be delivered shortly.",
          variant: "default",
        });
        return;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description:
          error instanceof Error ? error.message : "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const downloadDataAsJSON = (result: PurchaseResult) => {
    const exportData = {
      dataPoints: result.dataPoints,
      purchaseInfo: result.purchaseInfo,
      filters: result.filters,
      totalCost: result.totalCost,
      purchaseId: result.purchaseId,
      transactionHash: result.transactionHash,
    };

    const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `targeted-data-purchase-${result.purchaseId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isPurchaseDisabled =
    isPurchasing ||
    isPaymentProcessing ||
    !isConnected ||
    selectedSources.length === 0;

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
              {isConnected && (
                <div className="text-muted-foreground text-sm">
                  USDC Balance: {balance}
                </div>
              )}
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
              USDC Data Broker Portal
            </h1>
            <p className="text-muted-foreground text-lg">
              Purchase targeted consumer data with USDC payments via MetaMask on
              Base Sepolia.
            </p>
          </div>

          {/* Status Overview */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
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
                    ? `${balance} USDC available`
                    : "Please connect wallet"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Active Filters
                </CardTitle>
                <Filter className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-primary text-2xl font-bold">
                  {getActiveFilterCount()}
                </div>
                <p className="text-muted-foreground text-xs">
                  Targeting criteria applied
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
                  {formatCurrency(finalPrice)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {quantity} targeted data points
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
                  Payment Status
                </CardTitle>
                <CreditCard className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div
                  className={`flex items-center text-2xl font-bold ${isPurchasing || isPaymentProcessing ? "text-info" : "text-foreground"}`}
                >
                  {isPurchasing || isPaymentProcessing
                    ? "Processing..."
                    : "Ready"}
                </div>
                <p className="text-muted-foreground text-xs">
                  {isPurchasing || isPaymentProcessing
                    ? "Processing USDC payment..."
                    : "Awaiting purchase"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Purchase and Filters Section */}
            <div className="space-y-6 lg:col-span-2">
              {/* Targeting Filters */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Filter className="text-primary mr-3 h-5 w-5" />
                      <div>
                        <CardTitle>Audience Targeting Filters</CardTitle>
                        <CardDescription>
                          Narrow down your data purchase to specific
                          demographics and interests
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getActiveFilterCount() > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFilters}
                        >
                          Clear All
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        {showFilters ? "Hide" : "Show"} Filters
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {showFilters && (
                  <CardContent className="space-y-6">
                    {/* Geographic Filters */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-primary h-4 w-4" />
                        <h4 className="font-medium">Geographic Targeting</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Country
                          </label>
                          <select
                            value={selectedFilters.country}
                            onChange={(e) =>
                              handleFilterChange("country", e.target.value)
                            }
                            className="bg-background w-full rounded-lg border p-2"
                            disabled={loadingGeoData}
                          >
                            <option value="">All Countries</option>
                            {filterOptions.countries.map((country) => (
                              <option key={country.cca2} value={country.cca2}>
                                {country.name.common}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            State/Province
                          </label>
                          <select
                            value={selectedFilters.state}
                            onChange={(e) =>
                              handleFilterChange("state", e.target.value)
                            }
                            className="bg-background w-full rounded-lg border p-2"
                            disabled={
                              !selectedFilters.country || loadingGeoData
                            }
                          >
                            <option value="">All States/Provinces</option>
                            {filterOptions.states.map((state, index) => (
                              <option key={index} value={state.adminName1}>
                                {state.adminName1}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            City
                          </label>
                          <select
                            value={selectedFilters.city}
                            onChange={(e) =>
                              handleFilterChange("city", e.target.value)
                            }
                            className="bg-background w-full rounded-lg border p-2"
                            disabled={!selectedFilters.state || loadingGeoData}
                          >
                            <option value="">All Cities</option>
                            {filterOptions.cities.map((city, index) => (
                              <option key={index} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Demographic Filters */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Users className="text-primary h-4 w-4" />
                        <h4 className="font-medium">Demographics</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Age Group
                          </label>
                          <select
                            value={selectedFilters.ageGroup}
                            onChange={(e) =>
                              handleFilterChange("ageGroup", e.target.value)
                            }
                            className="bg-background w-full rounded-lg border p-2"
                          >
                            <option value="">All Ages</option>
                            {filterOptions.ageGroups.map((age) => (
                              <option key={age} value={age}>
                                {age}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Income Range
                          </label>
                          <select
                            value={selectedFilters.incomeRange}
                            onChange={(e) =>
                              handleFilterChange("incomeRange", e.target.value)
                            }
                            className="bg-background w-full rounded-lg border p-2"
                          >
                            <option value="">All Income Levels</option>
                            {filterOptions.incomeRanges.map((income) => (
                              <option key={income} value={income}>
                                {income}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Education
                          </label>
                          <select
                            value={selectedFilters.educationLevel}
                            onChange={(e) =>
                              handleFilterChange(
                                "educationLevel",
                                e.target.value,
                              )
                            }
                            className="bg-background w-full rounded-lg border p-2"
                          >
                            <option value="">All Education Levels</option>
                            {filterOptions.educationLevels.map((education) => (
                              <option key={education} value={education}>
                                {education}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Gender
                          </label>
                          <select
                            value={selectedFilters.gender}
                            onChange={(e) =>
                              handleFilterChange("gender", e.target.value)
                            }
                            className="bg-background w-full rounded-lg border p-2"
                          >
                            <option value="">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non-binary">Non-binary</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Interest Categories */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Heart className="text-primary h-4 w-4" />
                        <h4 className="font-medium">Interest Categories</h4>
                        <span className="text-muted-foreground text-sm">
                          ({selectedFilters.interests.length} selected)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
                        {filterOptions.interests.map((interest) => (
                          <label
                            key={interest}
                            className={`cursor-pointer rounded-lg border p-3 text-sm transition-all ${
                              selectedFilters.interests.includes(interest)
                                ? "bg-primary/10 border-primary"
                                : "bg-secondary hover:border-border"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.interests.includes(
                                interest,
                              )}
                              onChange={() =>
                                handleFilterChange("interests", interest)
                              }
                              className="sr-only"
                            />
                            <div className="font-medium">{interest}</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Employment Status */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="text-primary h-4 w-4" />
                        <h4 className="font-medium">Employment Status</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <select
                          value={selectedFilters.employmentStatus}
                          onChange={(e) =>
                            handleFilterChange(
                              "employmentStatus",
                              e.target.value,
                            )
                          }
                          className="bg-background w-full rounded-lg border p-2"
                        >
                          <option value="">All Employment Status</option>
                          {filterOptions.employmentStatus.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Targeting Summary */}
                    {getActiveFilterCount() > 0 && (
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium">
                              Targeting Premium
                            </span>
                            <span className="text-primary font-bold">
                              +
                              {((getFilterPriceMultiplier() - 1) * 100).toFixed(
                                0,
                              )}
                              %
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Higher precision targeting increases data value and
                            cost
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Bulk Data Purchase */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="text-primary mr-3 h-5 w-5" />
                    USDC Bulk Data Purchase
                  </CardTitle>
                  <CardDescription>
                    Select data types and quantity - payments processed via
                    MetaMask using USDC.
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
                        <div className="text-muted-foreground flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(totalPrice, "USD")}</span>
                        </div>
                        {getFilterPriceMultiplier() > 1 && (
                          <div className="text-primary flex justify-between">
                            <span>
                              Targeting Premium (+
                              {((getFilterPriceMultiplier() - 1) * 100).toFixed(
                                0,
                              )}
                              %)
                            </span>
                            <span>
                              + {formatCurrency(finalPrice - totalPrice, "USD")}
                            </span>
                          </div>
                        )}
                        <div className="border-border mt-2 flex justify-between border-t pt-2 font-semibold">
                          <span>Total (USDC)</span>
                          <span>{formatCurrency(finalPrice, "USD")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* USDC Balance Warning */}
                  {isConnected &&
                    hasInsufficientBalance(finalPrice) &&
                    selectedSources.length > 0 && (
                      <Card className="bg-destructive/5 border-destructive/20">
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="text-destructive h-4 w-4" />
                            <span className="text-destructive font-medium">
                              Insufficient USDC Balance
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1 text-sm">
                            You need {finalPrice.toFixed(2)} USDC but only have{" "}
                            {balance} USDC in your wallet.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                  <Button
                    onClick={handlePurchase}
                    disabled={isPurchaseDisabled}
                    className="w-full"
                    size="lg"
                  >
                    {isPurchasing || isPaymentProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isPaymentProcessing
                          ? "Processing USDC Payment..."
                          : "Finalizing Purchase..."}
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay {formatCurrency(finalPrice, "USDC")} USDC
                      </>
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
                    Your targeted data will appear here.
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
                      {purchaseResult.transactionHash && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Transaction:
                          </span>
                          <div className="mt-1">
                            <code className="bg-secondary rounded px-2 py-1 text-xs">
                              {purchaseResult.transactionHash.slice(0, 10)}...
                              {purchaseResult.transactionHash.slice(-8)}
                            </code>
                          </div>
                        </div>
                      )}
                      {purchaseResult.filters && getActiveFilterCount() > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Filters Applied:
                          </span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(purchaseResult.filters).map(
                              ([key, value]) => {
                                if (Array.isArray(value) && value.length > 0) {
                                  return (
                                    <div key={key} className="text-xs">
                                      <span className="capitalize">{key}:</span>{" "}
                                      {value.join(", ")}
                                    </div>
                                  );
                                }
                                if (value && typeof value === "string") {
                                  return (
                                    <div key={key} className="text-xs">
                                      <span className="capitalize">{key}:</span>{" "}
                                      {value}
                                    </div>
                                  );
                                }
                                return null;
                              },
                            )}
                          </div>
                        </div>
                      )}
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
                      {isPurchasing || isPaymentProcessing ? (
                        <div className="space-y-3">
                          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
                          <p className="text-muted-foreground">
                            {isPaymentProcessing
                              ? "Processing USDC payment..."
                              : "Finalizing targeted purchase..."}
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
