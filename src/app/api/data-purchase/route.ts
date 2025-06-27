import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// import { paymentMiddleware } from "x402-next";
import { mockUserProfiles, type MockUserProfile } from "~/lib/mock-user-data";

// x402 payment middleware (currently unused in favor of manual payment handling)
// const middleware = paymentMiddleware(
//   "0x1176FCbC388c500D01E8B8ceDd816A86C3365156", // Your receiving wallet address
//   {
//     "/api/data-purchase": {
//       price: "$0.01", // Base price per request (will be calculated dynamically)
//       network: "base-sepolia",
//       config: {
//         description: "Consumer data purchase",
//       },
//     },
//   },
//   // Using default facilitator (x402.org/facilitator for testnet)
// );

// Pricing per data source (in USD)
const DATA_SOURCE_PRICES = {
  netflix: 1.25,
  spotify: 1.0,
  instagram: 1.75,
  "apple-music": 0.75,
  facebook: 2.0,
} as const;

function generateDataPoints(
  sources: string[],
  count: number,
): MockUserProfile[] {
  // Filter profiles that have the requested data
  const availableProfiles = mockUserProfiles.filter((profile) =>
    sources.some((source) => {
      const sourceKey = source
        .replace("-", "")
        .toLowerCase() as keyof typeof profile.dataAvailable;
      return profile.dataAvailable[sourceKey];
    }),
  );

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

function calculateTotalCost(sources: string[], quantity: number): number {
  const baseCost = sources.reduce((sum: number, source: string) => {
    const price =
      DATA_SOURCE_PRICES[source as keyof typeof DATA_SOURCE_PRICES] || 0;
    return sum + price;
  }, 0);

  let totalCost = baseCost * quantity;

  // Apply bulk discount for orders > 10
  if (quantity > 10) {
    totalCost = totalCost * 0.9; // 10% discount
  }

  return totalCost;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as {
      sources?: string[];
      quantity?: number;
    };
    const { sources, quantity } = body;

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

    // Calculate total cost
    const totalCost = calculateTotalCost(sources, quantity);

    // Check for payment header (in a real implementation, this would be validated)
    const paymentHeader = request.headers.get("X-PAYMENT");

    if (!paymentHeader || paymentHeader === "simulated-payment-header") {
      if (!paymentHeader) {
        // Return 402 Payment Required with x402 payment details
        return NextResponse.json(
          {
            type: "x402-payment-required",
            amount: `$${totalCost.toFixed(2)}`,
            description: `Data purchase: ${sources.join(", ")} (${quantity} points)`,
            currency: "USDC",
            network: "base-sepolia",
            facilitator: "https://x402.org/facilitator",
            payTo: "0x1176FCbC388c500D01E8B8ceDd816A86C3365156",
            metadata: {
              sources: sources.join(","),
              quantity: quantity.toString(),
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
    }

    // Payment verified (in real implementation, would verify the payment signature)
    // Generate and return data
    const dataPoints = generateDataPoints(sources, quantity);

    return NextResponse.json({
      success: true,
      dataPoints,
      purchaseInfo: {
        sources,
        quantity,
        totalCostUSD: totalCost.toFixed(2),
        bulkDiscount: quantity > 10,
        timestamp: new Date().toISOString(),
        purchaseId: `purchase-${Date.now()}`,
        paymentMethod: "x402-protocol",
      },
    });
  } catch (error) {
    console.error("Data purchase API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
