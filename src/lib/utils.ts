import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number, currency: 'USD' | 'ETH' | 'USDC' = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  }
  
  return `${numAmount} ${currency}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

export function calculateBulkDiscount(quantity: number): number {
  if (quantity >= 50) return 0.2; // 20% discount
  if (quantity >= 10) return 0.1; // 10% discount
  return 0;
}

export function calculateDataPrice(
  basePrices: Record<string, number>,
  sources: string[],
  quantity: number = 1
): { totalPrice: number; breakdown: Record<string, number>; discount: number } {
  const basePrice = 1.50; // Base price per profile
  let totalSourcePrice = 0;
  const breakdown: Record<string, number> = {};
  
  sources.forEach(source => {
    const sourcePrice = basePrices[source] || 0;
    totalSourcePrice += sourcePrice;
    breakdown[source] = sourcePrice;
  });
  
  const subtotal = (basePrice + totalSourcePrice) * quantity;
  const discount = calculateBulkDiscount(quantity);
  const totalPrice = subtotal * (1 - discount);
  
  return {
    totalPrice,
    breakdown: {
      base: basePrice * quantity,
      ...Object.fromEntries(
        Object.entries(breakdown).map(([key, value]) => [key, value * quantity])
      ),
    },
    discount
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateWalletAddress(address: string): boolean {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function hashPin(pin: string): string {
  // In production, use proper cryptographic hashing
  // This is a simple hash for demo purposes
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export function verifyPin(pin: string, hashedPin: string): boolean {
  return hashPin(pin) === hashedPin;
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(d);
}

export function getTransactionStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-50';
    case 'pending': return 'text-yellow-600 bg-yellow-50';
    case 'failed': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    netflix: '🎬',
    spotify: '🎵',
    instagram: '📸',
    'apple-music': '🍎',
    facebook: '👥',
    google: '🔍',
  };
  return icons[platform] || '📱';
}

export function estimateWithdrawalTime(method: 'wallet' | 'bank'): string {
  if (method === 'wallet') return '2-5 minutes';
  return '1-3 business days';
}

export function calculateNetworkFee(amount: string, currency: 'ETH' | 'USDC'): string {
  const numAmount = parseFloat(amount);
  if (currency === 'ETH') {
    return (numAmount * 0.001).toFixed(6); // 0.1% network fee
  }
  return (numAmount * 0.005).toFixed(2); // 0.5% for USDC
}

export function generateMockBankAccount() {
  const bankNames = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank'];
  const randomBank = bankNames[Math.floor(Math.random() * bankNames.length)];
  const last4 = Math.floor(1000 + Math.random() * 9000).toString();
  
  return {
    bankName: randomBank,
    last4,
    accountType: Math.random() > 0.5 ? 'checking' : 'savings' as const,
  };
} 