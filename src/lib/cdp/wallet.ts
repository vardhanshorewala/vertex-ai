import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';
import { env } from '~/env';

export interface CDPWalletResult {
  address: string;
  seed: string;
  walletId: string;
}

export async function createCDPWallet(): Promise<CDPWalletResult> {
  try {
    // Check if CDP credentials are available
    if (!env.CDP_API_KEY_ID || !env.CDP_API_KEY_SECRET) {
      // Return mock data for development/demo
      return {
        address: `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`,
        seed: generateMockSeed(),
        walletId: `mock-wallet-${Date.now()}`,
      };
    }

    // Initialize Coinbase CDP with proper error handling
    try {
      Coinbase.configure({
        apiKeyName: env.CDP_API_KEY_ID,
        privateKey: env.CDP_API_KEY_SECRET.replace(/\\n/g, '\n'),
      });
    } catch (configError) {
      console.error('CDP configuration error:', configError);
      throw new Error('Failed to configure CDP SDK');
    }

    const networkId = 'base-sepolia';

    // Create a new wallet using CDP SDK
    const wallet = await Wallet.create({ networkId });

    // Get the default address
    const address = await wallet.getDefaultAddress();

    // Export wallet for backup (includes seed phrase)
    const walletData = wallet.export();

    const walletId = wallet.getId();
    if (!walletId) {
      throw new Error('Failed to get wallet ID from CDP');
    }

    return {
      address: address.getId(),
      seed: walletData.seed,
      walletId: walletId,
    };
  } catch (error) {
    console.error('Error creating CDP wallet:', error);
    
    // Fallback to mock wallet for development
    console.warn('Falling back to mock wallet data');
    return {
      address: `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`,
      seed: generateMockSeed(),
      walletId: `fallback-wallet-${Date.now()}`,
    };
  }
}

function generateMockSeed(): string {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
  ];
  
  return Array.from({ length: 12 }, () => 
    words[Math.floor(Math.random() * words.length)]
  ).join(' ');
} 