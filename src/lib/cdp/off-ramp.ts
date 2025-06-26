import { env } from '~/env';
import type { CDPOffRampResponse, BankAccount } from '~/types';
import { generateId, generateMockBankAccount } from '../utils';

// Mock CDP off-ramp functionality for Base testnet
export class CDPOffRampService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = env.CDP_API_KEY_ID || 'mock-api-key';
    this.apiSecret = env.CDP_API_KEY_SECRET || 'mock-api-secret';
    this.baseUrl = env.NEXT_PUBLIC_CDP_BASE_URL;
  }

  /**
   * Get current exchange rates for ETH/USDC to USD
   */
  async getExchangeRates(): Promise<{ eth: number; usdc: number }> {
    try {
      // In production, this would call the actual CDP API
      // For demo, return mock exchange rates
      return {
        eth: 3500.00, // $3,500 per ETH
        usdc: 1.00    // $1.00 per USDC (stable)
      };
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return { eth: 3500.00, usdc: 1.00 };
    }
  }

  /**
   * Initiate off-ramp transaction to bank account
   */
  async initiateOffRamp(
    amount: string,
    currency: 'ETH' | 'USDC',
    bankAccountId: string,
    walletAddress: string
  ): Promise<CDPOffRampResponse> {
    try {
      const rates = await this.getExchangeRates();
      const cryptoAmount = parseFloat(amount);
      const exchangeRate = currency === 'ETH' ? rates.eth : rates.usdc;
      const usdAmount = (cryptoAmount * exchangeRate).toFixed(2);

      // Calculate fees
      const networkFee = currency === 'ETH' ? '0.002' : '1.00';
      const platformFee = (parseFloat(usdAmount) * 0.01).toFixed(2); // 1% platform fee

      // Mock response - in production, this would be a real transaction
      const response: CDPOffRampResponse = {
        transactionId: generateId('offramp'),
        status: 'pending',
        estimatedAmount: (parseFloat(usdAmount) - parseFloat(platformFee)).toFixed(2),
        exchangeRate: exchangeRate.toString(),
        fees: {
          networkFee,
          platformFee
        },
        estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      // Simulate processing
      setTimeout(() => {
        this.updateOffRampStatus(response.transactionId, 'processing');
      }, 2000);

      setTimeout(() => {
        this.updateOffRampStatus(response.transactionId, 'completed');
      }, 10000);

      return response;
    } catch (error) {
      console.error('Error initiating off-ramp:', error);
      throw new Error('Failed to initiate off-ramp transaction');
    }
  }

  /**
   * Get off-ramp transaction status
   */
  async getOffRampStatus(transactionId: string): Promise<CDPOffRampResponse | null> {
    try {
      // In production, this would query the CDP API
      // For demo, return mock status based on time elapsed
      const createdTime = this.extractTimestampFromId(transactionId);
      const elapsed = Date.now() - createdTime;

      let status: 'pending' | 'processing' | 'completed' | 'failed';
      if (elapsed < 2000) {
        status = 'pending';
      } else if (elapsed < 10000) {
        status = 'processing';
      } else {
        status = 'completed';
      }

      return {
        transactionId,
        status,
        estimatedAmount: '3485.50',
        exchangeRate: '3500.00',
        fees: {
          networkFee: '0.002',
          platformFee: '35.00'
        },
        estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error getting off-ramp status:', error);
      return null;
    }
  }

  /**
   * Link a bank account for off-ramp transactions
   */
  async linkBankAccount(
    consumerId: string,
    bankDetails: {
      routingNumber: string;
      accountNumber: string;
      accountType: 'checking' | 'savings';
      accountHolderName: string;
    }
  ): Promise<BankAccount> {
    try {
      // In production, this would verify the bank account via CDP
      // For demo, create a mock verified account
      const mockAccount = generateMockBankAccount();
      
      const bankAccount: BankAccount = {
        id: generateId('bank'),
        consumerId,
        accountType: bankDetails.accountType,
        last4: bankDetails.accountNumber.slice(-4),
        bankName: mockAccount.bankName || 'Unknown Bank',
        isVerified: true, // Auto-verify for demo
        addedAt: new Date().toISOString()
      };

      // Store bank account
      await this.storeBankAccount(bankAccount);

      return bankAccount;
    } catch (error) {
      console.error('Error linking bank account:', error);
      throw new Error('Failed to link bank account');
    }
  }

  /**
   * Get linked bank accounts for a consumer
   */
  async getBankAccounts(consumerId: string): Promise<BankAccount[]> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const bankAccountsPath = path.join(process.cwd(), 'src/data/bank-accounts.json');
      
      let accounts: BankAccount[] = [];
      try {
        const data = await fs.readFile(bankAccountsPath, 'utf-8');
        accounts = JSON.parse(data);
      } catch {
        // File doesn't exist, return empty array
        accounts = [];
      }
      
      return accounts.filter(account => account.consumerId === consumerId);
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      return [];
    }
  }

  /**
   * Perform KYC verification (mock implementation)
   */
  async performKYC(
    consumerId: string,
    kycData: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      ssn: string;
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      };
    }
  ): Promise<{ verified: boolean; referenceId: string }> {
    try {
      // Mock KYC verification - in production, this would call CDP's KYC service
      const isVerified = Math.random() > 0.1; // 90% verification rate for demo
      
      return {
        verified: isVerified,
        referenceId: generateId('kyc')
      };
    } catch (error) {
      console.error('Error performing KYC:', error);
      return {
        verified: false,
        referenceId: generateId('kyc')
      };
    }
  }

  /**
   * Calculate off-ramp fees
   */
  calculateFees(amount: string, currency: 'ETH' | 'USDC'): {
    networkFee: string;
    platformFee: string;
    totalFees: string;
  } {
    const cryptoAmount = parseFloat(amount);
    
    // Network fees (fixed)
    const networkFee = currency === 'ETH' ? '0.002' : '1.00';
    
    // Platform fee (1% of USD value)
    const exchangeRate = currency === 'ETH' ? 3500 : 1;
    const usdValue = cryptoAmount * exchangeRate;
    const platformFee = (usdValue * 0.01).toFixed(2);
    
    const totalFees = currency === 'ETH' 
      ? (parseFloat(networkFee) + parseFloat(platformFee) / exchangeRate).toFixed(6)
      : (parseFloat(networkFee) + parseFloat(platformFee)).toFixed(2);
    
    return {
      networkFee,
      platformFee,
      totalFees
    };
  }

  /**
   * Estimate processing time for off-ramp
   */
  estimateProcessingTime(method: 'standard' | 'expedited' = 'standard'): string {
    return method === 'expedited' ? '2-4 hours' : '1-3 business days';
  }

  private async storeBankAccount(bankAccount: BankAccount): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const bankAccountsPath = path.join(process.cwd(), 'src/data/bank-accounts.json');
      
      let accounts: BankAccount[] = [];
      try {
        const data = await fs.readFile(bankAccountsPath, 'utf-8');
        accounts = JSON.parse(data);
      } catch {
        // File doesn't exist, create new array
        accounts = [];
      }
      
      accounts.push(bankAccount);
      await fs.writeFile(bankAccountsPath, JSON.stringify(accounts, null, 2));
    } catch (error) {
      console.error('Error storing bank account:', error);
    }
  }

  private async updateOffRampStatus(transactionId: string, status: string): Promise<void> {
    // In production, this would update the CDP transaction status
    console.log(`Off-ramp transaction ${transactionId} status updated to ${status}`);
  }

  private extractTimestampFromId(id: string): number {
    // Extract timestamp from generated ID format
    const parts = id.split('-');
    if (parts.length >= 2) {
      const timestampPart = parts[1];
      if (timestampPart) {
        return parseInt(timestampPart, 36);
      }
    }
    return Date.now();
  }
}

// Singleton instance
export const cdpOffRampService = new CDPOffRampService(); 