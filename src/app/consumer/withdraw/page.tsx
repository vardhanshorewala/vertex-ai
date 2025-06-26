"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { 
  ArrowLeft, 
  Wallet,
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info
} from "lucide-react";
import { formatCurrency, calculateNetworkFee, estimateWithdrawalTime, validateWalletAddress } from "~/lib/utils";
import type { CustodialWallet, BankAccount } from "~/types";
import Link from "next/link";

const mockWallet: CustodialWallet = {
  id: 'wallet-consumer-1',
  consumerId: 'consumer-1',
  address: '0x1234567890123456789012345678901234567890',
  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  balance: {
    eth: '0.0045',
    usdc: '12.50'
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z'
};

const mockBankAccounts: BankAccount[] = [
  {
    id: 'bank-001',
    consumerId: 'consumer-1',
    accountType: 'checking',
    last4: '1234',
    bankName: 'Chase Bank',
    isVerified: true,
    addedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'bank-002',
    consumerId: 'consumer-1',
    accountType: 'savings',
    last4: '5678',
    bankName: 'Bank of America',
    isVerified: false,
    addedAt: '2024-01-18T09:00:00Z'
  }
];

export default function WithdrawPage() {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<CustodialWallet | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawalMethod, setWithdrawalMethod] = useState<'wallet' | 'bank'>('wallet');
  const [currency, setCurrency] = useState<'eth' | 'usdc'>('usdc');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSecurityStep, setShowSecurityStep] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setWallet(mockWallet);
      setBankAccounts(mockBankAccounts);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const validateWithdrawal = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return false;
    }

    const withdrawalAmount = parseFloat(amount);
    const availableBalance = parseFloat(wallet?.balance[currency] || '0');

    if (withdrawalAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${formatCurrency(availableBalance, currency.toUpperCase() as 'ETH' | 'USDC')} available`,
        variant: "destructive"
      });
      return false;
    }

    if (withdrawalMethod === 'wallet') {
      if (!destinationAddress) {
        toast({
          title: "Missing Address",
          description: "Please enter a destination wallet address",
          variant: "destructive"
        });
        return false;
      }

      if (!validateWalletAddress(destinationAddress)) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid Ethereum wallet address",
          variant: "destructive"
        });
        return false;
      }
    } else {
      if (!selectedBankAccount) {
        toast({
          title: "No Bank Account",
          description: "Please select a bank account for withdrawal",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleWithdrawal = async () => {
    if (!validateWithdrawal()) return;

    setShowSecurityStep(true);
  };

  const confirmWithdrawal = async () => {
    if (!securityPin) {
      toast({
        title: "Security PIN Required",
        description: "Please enter your security PIN to confirm withdrawal",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal of ${formatCurrency(amount, currency.toUpperCase() as 'ETH' | 'USDC')} has been initiated. Expected completion: ${estimateWithdrawalTime(withdrawalMethod)}`,
      });

      // Reset form
      setAmount('');
      setDestinationAddress('');
      setSelectedBankAccount('');
      setSecurityPin('');
      setShowSecurityStep(false);

    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateFees = () => {
    if (!amount) return { networkFee: '0', processingFee: '0', totalFees: '0' };
    
    const networkFee = calculateNetworkFee(amount, currency.toUpperCase() as 'ETH' | 'USDC');
    const processingFee = withdrawalMethod === 'bank' ? '2.50' : '0';
    const totalFees = (parseFloat(networkFee) + parseFloat(processingFee)).toString();
    
    return { networkFee, processingFee, totalFees };
  };

  const { networkFee, processingFee, totalFees } = calculateFees();
  const netAmount = amount ? (parseFloat(amount) - parseFloat(totalFees)).toFixed(2) : '0';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading withdrawal interface...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/consumer/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white">Withdraw Funds</h1>
            <p className="text-gray-300">Transfer your earnings to external wallet or bank account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="space-y-6">
            {!showSecurityStep ? (
              <>
                {/* Available Balance */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Available Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">USDC</div>
                        <div className="text-white font-bold text-lg">
                          {formatCurrency(wallet?.balance.usdc || '0', 'USDC')}
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">ETH</div>
                        <div className="text-white font-bold text-lg">
                          {formatCurrency(wallet?.balance.eth || '0', 'ETH')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Withdrawal Method */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Withdrawal Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setWithdrawalMethod('wallet')}
                        className={`p-4 rounded-lg border transition-colors ${
                          withdrawalMethod === 'wallet'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <Wallet className="w-8 h-8 text-white mx-auto mb-2" />
                        <div className="text-white font-medium">External Wallet</div>
                        <div className="text-xs text-gray-400">2-5 minutes</div>
                      </button>
                      <button
                        onClick={() => setWithdrawalMethod('bank')}
                        className={`p-4 rounded-lg border transition-colors ${
                          withdrawalMethod === 'bank'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <CreditCard className="w-8 h-8 text-white mx-auto mb-2" />
                        <div className="text-white font-medium">Bank Account</div>
                        <div className="text-xs text-gray-400">1-3 business days</div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Amount & Currency */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as 'eth' | 'usdc')}
                          className="w-full p-3 rounded-md bg-white/5 border border-white/20 text-white"
                        >
                          <option value="usdc">USDC</option>
                          <option value="eth">ETH</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Amount</label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-lg bg-white/5 border-white/20 text-white"
                          />
                          <button
                            onClick={() => setAmount(wallet?.balance[currency] || '0')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Destination */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {withdrawalMethod === 'wallet' ? 'Destination Address' : 'Bank Account'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {withdrawalMethod === 'wallet' ? (
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Wallet Address</label>
                        <Input
                          placeholder="0x..."
                          value={destinationAddress}
                          onChange={(e) => setDestinationAddress(e.target.value)}
                          className="bg-white/5 border-white/20 text-white font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Select Bank Account</label>
                        <select
                          value={selectedBankAccount}
                          onChange={(e) => setSelectedBankAccount(e.target.value)}
                          className="w-full p-3 rounded-md bg-white/5 border border-white/20 text-white"
                        >
                          <option value="">Select an account...</option>
                          {bankAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.bankName} - {account.accountType} ending in {account.last4}
                              {!account.isVerified && ' (Unverified)'}
                            </option>
                          ))}
                        </select>
                        <Button className="mt-3 w-full bg-gradient-to-r from-green-500 to-teal-600">
                          + Add New Bank Account
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleWithdrawal}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  Continue to Security Verification
                </Button>
              </>
            ) : (
              /* Security Step */
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Verification
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Please confirm your withdrawal with your security PIN
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center text-yellow-300">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span className="text-sm">Security confirmation required for withdrawal</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Security PIN</label>
                      <Input
                        type="password"
                        placeholder="Enter your 4-digit PIN"
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value)}
                        maxLength={4}
                        className="bg-white/5 border-white/20 text-white text-center text-lg tracking-widest"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => setShowSecurityStep(false)}
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={confirmWithdrawal}
                        disabled={isProcessing || !securityPin}
                        className="flex-1 bg-gradient-to-r from-green-500 to-teal-600"
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Withdrawal
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Method:</span>
                    <span className="text-white capitalize">{withdrawalMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Currency:</span>
                    <span className="text-white">{currency.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount:</span>
                    <span className="text-white">{formatCurrency(amount || '0', currency.toUpperCase() as 'ETH' | 'USDC')}</span>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network Fee:</span>
                      <span className="text-gray-400">{formatCurrency(networkFee, currency.toUpperCase() as 'ETH' | 'USDC')}</span>
                    </div>
                    {withdrawalMethod === 'bank' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Processing Fee:</span>
                        <span className="text-gray-400">${processingFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span className="text-white">You'll Receive:</span>
                      <span className="text-green-400">{formatCurrency(netAmount, currency.toUpperCase() as 'ETH' | 'USDC')}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Est. Time:</span>
                    <span className="text-white">{estimateWithdrawalTime(withdrawalMethod)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/20 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-100">
                    <p className="font-medium mb-1">Withdrawal Information</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Wallet withdrawals are processed on Base network</li>
                      <li>• Bank withdrawals may take 1-3 business days</li>
                      <li>• Fees are deducted from withdrawal amount</li>
                      <li>• All withdrawals require security confirmation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 