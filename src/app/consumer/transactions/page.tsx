"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatCurrency, formatDate, getTransactionStatusColor } from "~/lib/utils";
import type { Transaction } from "~/types";
import Link from "next/link";

const mockTransactions: Transaction[] = [
  {
    id: "txn-001",
    type: "data_sale",
    fromWallet: "0xBrokerWallet123",
    toWallet: "0x1234567890123456789012345678901234567890",
    amount: "5.25",
    currency: "USDC",
    status: "completed",
    description: "Data sale: Netflix + Spotify data",
    metadata: {
      dataBrokerId: "broker-001",
      dataSourcesRequested: ["netflix", "spotify"]
    },
    createdAt: "2024-01-20T14:00:00Z",
    completedAt: "2024-01-20T14:02:00Z"
  },
  {
    id: "txn-002",
    type: "withdrawal",
    fromWallet: "0x1234567890123456789012345678901234567890",
    toWallet: "0xExternalWallet456",
    amount: "3.00",
    currency: "USDC",
    status: "completed",
    description: "Withdrawal to external wallet",
    metadata: {
      withdrawalMethod: "wallet"
    },
    createdAt: "2024-01-19T16:30:00Z",
    completedAt: "2024-01-19T16:35:00Z"
  },
  {
    id: "txn-003",
    type: "data_sale",
    fromWallet: "0xBrokerWallet789",
    toWallet: "0x1234567890123456789012345678901234567890",
    amount: "3.25",
    currency: "USDC",
    status: "completed",
    description: "Data sale: Instagram data",
    metadata: {
      dataBrokerId: "broker-002",
      dataSourcesRequested: ["instagram"]
    },
    createdAt: "2024-01-19T10:45:00Z",
    completedAt: "2024-01-19T10:47:00Z"
  },
  {
    id: "txn-004",
    type: "withdrawal",
    fromWallet: "0x1234567890123456789012345678901234567890",
    amount: "2.50",
    currency: "USDC",
    status: "pending",
    description: "Withdrawal to bank account",
    metadata: {
      withdrawalMethod: "bank",
      bankAccountId: "bank-001"
    },
    createdAt: "2024-01-21T09:15:00Z"
  },
  {
    id: "txn-005",
    type: "data_sale",
    fromWallet: "0xBrokerWallet456",
    toWallet: "0x1234567890123456789012345678901234567890",
    amount: "7.50",
    currency: "USDC",
    status: "completed",
    description: "Data sale: Netflix + Instagram + Facebook data",
    metadata: {
      dataBrokerId: "broker-003",
      dataSourcesRequested: ["netflix", "instagram", "facebook"]
    },
    createdAt: "2024-01-18T13:20:00Z",
    completedAt: "2024-01-18T13:22:00Z"
  },
  {
    id: "txn-006",
    type: "data_sale",
    fromWallet: "0xBrokerWallet123",
    toWallet: "0x1234567890123456789012345678901234567890",
    amount: "4.75",
    currency: "USDC",
    status: "completed",
    description: "Data sale: Spotify + Apple Music data",
    metadata: {
      dataBrokerId: "broker-001",
      dataSourcesRequested: ["spotify", "apple-music"]
    },
    createdAt: "2024-01-17T11:30:00Z",
    completedAt: "2024-01-17T11:32:00Z"
  }
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "data_sale" | "withdrawal">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const loadTransactions = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setIsLoading(false);
    };
    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, filterStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data_sale': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
      default: return <ArrowUpRight className="w-4 h-4 text-gray-500" />;
    }
  };

  const calculateTotals = () => {
    const earnings = filteredTransactions
      .filter(tx => tx.type === 'data_sale' && tx.status === 'completed')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    const withdrawals = filteredTransactions
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    return { earnings, withdrawals };
  };

  const { earnings, withdrawals } = calculateTotals();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href="/consumer/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white">Transaction History</h1>
              <p className="text-gray-300">Track all your earnings and withdrawals</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-teal-600">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(earnings, 'USDC')}
              </div>
              <p className="text-xs text-gray-400">From data sales</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {formatCurrency(withdrawals, 'USDC')}
              </div>
              <p className="text-xs text-gray-400">Successfully withdrawn</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(earnings - withdrawals, 'USDC')}
              </div>
              <p className="text-xs text-gray-400">Available balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full p-2 rounded-md bg-white/5 border border-white/20 text-white"
                >
                  <option value="all">All Types</option>
                  <option value="data_sale">Data Sales</option>
                  <option value="withdrawal">Withdrawals</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full p-2 rounded-md bg-white/5 border border-white/20 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              Transactions ({filteredTransactions.length})
            </CardTitle>
            <CardDescription className="text-gray-300">
              All your transaction activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No transactions found matching your filters.
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type)}
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-400">
                          {transaction.id} • {formatDate(transaction.createdAt)}
                        </div>
                        {transaction.metadata?.dataSourcesRequested && (
                          <div className="text-xs text-blue-400 mt-1">
                            Sources: {transaction.metadata.dataSourcesRequested.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${
                        transaction.type === 'data_sale' ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {transaction.type === 'data_sale' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${getTransactionStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 