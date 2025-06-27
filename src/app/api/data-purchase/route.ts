import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// import { paymentMiddleware } from "x402-next";
import { mockUserProfiles, type MockUserProfile } from "~/lib/mock-user-data";

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

interface PaymentProof {
  transactionHash?: string;
  amount: number;
  timestamp: number;
}

// Pricing per data source (in USD)
const DATA_SOURCE_PRICES = {
  netflix: 1.25,
  spotify: 1.0,
  instagram: 1.75,
  "apple-music": 0.75,
  facebook: 2.0,
} as const;

function applyFiltersToProfiles(
  profiles: MockUserProfile[],
  filters: SelectedFilters,
): MockUserProfile[] {
  return profiles.filter((profile) => {
    // Apply geographic filters
    if (filters.country && profile.location.country !== filters.country) {
      return false;
    }
    if (filters.state && profile.location.state !== filters.state) {
      return false;
    }
    if (filters.city && profile.location.city !== filters.city) {
      return false;
    }

    // Apply demographic filters
    if (filters.ageGroup) {
      const ageRange = filters.ageGroup.includes("+")
        ? [parseInt(filters.ageGroup), 100]
        : filters.ageGroup.split("-").map(Number);
      const [minAge, maxAge] = ageRange;
      if (
        minAge !== undefined &&
        maxAge !== undefined &&
        (profile.age < minAge || profile.age > maxAge)
      ) {
        return false;
      }
    }

    if (
      filters.gender &&
      profile.gender.toLowerCase() !== filters.gender.toLowerCase()
    ) {
      return false;
    }

    // Apply income filter
    if (filters.incomeRange) {
      const profileIncome = profile.demographics.income;
      const incomeMatch = checkIncomeRange(profileIncome, filters.incomeRange);
      if (!incomeMatch) return false;
    }

    // Apply education filter
    if (
      filters.educationLevel &&
      profile.demographics.education !== filters.educationLevel
    ) {
      return false;
    }

    // Apply employment status filter
    if (
      filters.employmentStatus &&
      profile.demographics.employmentStatus !== filters.employmentStatus
    ) {
      return false;
    }

    // Apply interests filter (user must have at least one matching interest)
    if (filters.interests && filters.interests.length > 0) {
      const hasMatchingInterest = filters.interests.some((interest) =>
        profile.interests.some(
          (userInterest) =>
            userInterest.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(userInterest.toLowerCase()),
        ),
      );
      if (!hasMatchingInterest) return false;
    }

    return true;
  });
}

function checkIncomeRange(profileIncome: number, targetRange: string): boolean {
  switch (targetRange) {
    case "Under $25k":
      return profileIncome < 25000;
    case "$25k-$50k":
      return profileIncome >= 25000 && profileIncome < 50000;
    case "$50k-$75k":
      return profileIncome >= 50000 && profileIncome < 75000;
    case "$75k-$100k":
      return profileIncome >= 75000 && profileIncome < 100000;
    case "$100k-$150k":
      return profileIncome >= 100000 && profileIncome < 150000;
    case "$150k+":
      return profileIncome >= 150000;
    default:
      return true;
  }
}

function generateDataPoints(
  sources: string[],
  count: number,
  filters?: SelectedFilters,
): MockUserProfile[] {
  // Filter profiles that have the requested data
  let availableProfiles = mockUserProfiles.filter((profile) =>
    sources.some((source) => {
      const sourceKey = source
        .replace("-", "")
        .toLowerCase() as keyof typeof profile.dataAvailable;
      return profile.dataAvailable[sourceKey];
    }),
  );

  // Apply targeting filters if provided
  if (filters) {
    availableProfiles = applyFiltersToProfiles(availableProfiles, filters);
  }

  // If no profiles match the filters, return a subset of available profiles
  // (in real implementation, this would indicate insufficient inventory)
  if (availableProfiles.length === 0) {
    availableProfiles = mockUserProfiles.slice(0, Math.min(5, count));
  }

  // Randomly select and duplicate profiles to reach requested quantity
  const selectedProfiles: MockUserProfile[] = [];
  for (let i = 0; i < count; i++) {
    const randomProfile =
      availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
    if (randomProfile) {
      // Create a copy with modified ID to simulate different data points
      selectedProfiles.push({
        ...randomProfile,
        id: `${randomProfile.id}-${i}-${Date.now()}`,
        email: `${randomProfile.email.split("@")[0]}+${i}@${randomProfile.email.split("@")[1]}`,
      });
    }
  }

  return selectedProfiles;
}

function calculateTotalCost(
  sources: string[],
  quantity: number,
  targetingMultiplier = 1.0,
): number {
  const baseCost = sources.reduce((sum, source: string) => {
    const price =
      DATA_SOURCE_PRICES[source as keyof typeof DATA_SOURCE_PRICES] || 0;
    return sum + price;
  }, 0);

  let totalCost = baseCost * quantity;

  // Apply bulk discount for orders > 10
  if (quantity > 10) {
    totalCost = totalCost * 0.9; // 10% discount
  }

  // Apply targeting multiplier
  totalCost = totalCost * targetingMultiplier;

  return totalCost;
}

function isValidTransactionHash(hash?: string): boolean {
  if (!hash) return false;
  // Basic validation: should be 66 characters starting with 0x
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as {
      sources?: string[];
      quantity?: number;
      filters?: SelectedFilters;
      targetingMultiplier?: number;
      paymentProof?: PaymentProof;
    };
    const { sources, quantity, filters, targetingMultiplier = 1.0 } = body;

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing data sources" },
        { status: 400 },
      );
    }

    if (!quantity || quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 1000" },
        { status: 400 },
      );
    }

    // Calculate total cost including targeting premium
    const totalCost = calculateTotalCost(
      sources,
      quantity,
      targetingMultiplier,
    );

    // Check for payment headers and proof
    const paymentHeader = request.headers.get("X-PAYMENT");
    const transactionHash = request.headers.get("X-TRANSACTION-HASH");

    // If this is a USDC payment, verify the transaction hash
    if (paymentHeader === "usdc-payment-confirmed") {
      if (!isValidTransactionHash(transactionHash || undefined)) {
        return NextResponse.json(
          { error: "Invalid transaction hash provided" },
          { status: 400 },
        );
      }

      // In a real implementation, you would:
      // 1. Verify the transaction on the blockchain
      // 2. Check that the amount matches
      // 3. Verify the recipient address
      // 4. Ensure the transaction is confirmed

      // For demo purposes, we'll accept any valid-looking transaction hash
      console.log(
        `Processing USDC payment with transaction: ${transactionHash}`,
      );

      // Generate and return data immediately for USDC payments
      const dataPoints = generateDataPoints(sources, quantity, filters);

      // Calculate how well the filters matched
      const totalAvailable = mockUserProfiles.filter((profile) =>
        sources.some((source) => {
          const sourceKey = source
            .replace("-", "")
            .toLowerCase() as keyof typeof profile.dataAvailable;
          return profile.dataAvailable[sourceKey];
        }),
      ).length;

      const filteredAvailable = filters
        ? applyFiltersToProfiles(mockUserProfiles, filters).length
        : totalAvailable;

      return NextResponse.json({
        success: true,
        dataPoints,
        purchaseInfo: {
          sources,
          quantity,
          totalCostUSD: totalCost.toFixed(2),
          baseCostUSD: calculateTotalCost(sources, quantity, 1.0).toFixed(2),
          targetingPremium: `+${((targetingMultiplier - 1) * 100).toFixed(0)}%`,
          bulkDiscount: quantity > 10,
          timestamp: new Date().toISOString(),
          purchaseId: `purchase-${Date.now()}`,
          paymentMethod: "usdc-blockchain",
          transactionHash: transactionHash,
          targeting: {
            filtersApplied: filters
              ? Object.entries(filters).filter(([_key, value]) => {
                  if (Array.isArray(value)) return value.length > 0;
                  return value !== "";
                }).length
              : 0,
            matchingProfiles: filteredAvailable,
            totalAvailableProfiles: totalAvailable,
            precision:
              filteredAvailable > 0
                ? ((filteredAvailable / totalAvailable) * 100).toFixed(1) + "%"
                : "0%",
          },
        },
      });
    }

    // Legacy x402 flow - return 402 Payment Required
    if (!paymentHeader) {
      const filterSummary = filters
        ? `with ${
            Object.entries(filters).filter(([_key, value]) => {
              if (Array.isArray(value)) return value.length > 0;
              return value !== "";
            }).length
          } targeting filters`
        : "";

      return NextResponse.json(
        {
          type: "payment-required",
          amount: `$${totalCost.toFixed(2)}`,
          description: `Targeted data purchase: ${sources.join(", ")} (${quantity} points) ${filterSummary}`,
          currency: "USDC",
          network: "base-sepolia",
          recipient: "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9",
          metadata: {
            sources: sources.join(","),
            quantity: quantity.toString(),
            filters: filters ? JSON.stringify(filters) : "",
            targetingMultiplier: targetingMultiplier.toString(),
            timestamp: Date.now().toString(),
          },
        },
        {
          status: 402,
          headers: {
            "Content-Type": "application/json",
            "X-Payment-Required": "true",
          },
        },
      );
    }

    // Unknown payment method
    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Data purchase API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
