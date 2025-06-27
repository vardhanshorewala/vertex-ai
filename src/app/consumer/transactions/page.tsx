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
  ArrowLeft,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  Loader2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatDate } from "~/lib/utils";
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
      dataSourcesRequested: ["netflix", "spotify"],
    },
    createdAt: "2024-01-20T14:00:00Z",
    completedAt: "2024-01-20T14:02:00Z",
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
      withdrawalMethod: "wallet",
    },
    createdAt: "2024-01-19T16:30:00Z",
    completedAt: "2024-01-19T16:35:00Z",
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
      dataSourcesRequested: ["instagram"],
    },
    createdAt: "2024-01-19T10:45:00Z",
    completedAt: "2024-01-19T10:47:00Z",
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
      bankAccountId: "bank-001",
    },
    createdAt: "2024-01-21T09:15:00Z",
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
      dataSourcesRequested: ["netflix", "instagram", "facebook"],
    },
    createdAt: "2024-01-18T13:20:00Z",
    completedAt: "2024-01-18T13:22:00Z",
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
      dataSourcesRequested: ["spotify", "apple-music"],
    },
    createdAt: "2024-01-17T11:30:00Z",
    completedAt: "2024-01-17T11:32:00Z",
  },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "data_sale" | "withdrawal"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const loadTransactions = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setIsLoading(false);
    };
    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((tx) => tx.type === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((tx) => tx.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, filterStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-success h-4 w-4" />;
      case "pending":
        return <Clock className="text-warning h-4 w-4" />;
      case "failed":
        return <XCircle className="text-destructive h-4 w-4" />;
      default:
        return <Clock className="text-muted-foreground h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "data_sale":
        return <ArrowDownLeft className="text-success h-5 w-5" />;
      case "withdrawal":
        return <ArrowUpRight className="text-info h-5 w-5" />;
      default:
        return <ArrowUpRight className="text-muted-foreground h-5 w-5" />;
    }
  };

  const calculateTotals = () => {
    const earnings = filteredTransactions
      .filter((tx) => tx.type === "data_sale" && tx.status === "completed")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    const withdrawals = filteredTransactions
      .filter((tx) => tx.type === "withdrawal" && tx.status === "completed")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    return { earnings, withdrawals };
  };

  const { earnings, withdrawals } = calculateTotals();

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-lg">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Globe className="text-primary-foreground h-5 w-5" />
              </div>
              <h1 className="text-foreground text-xl font-bold">DataMarket</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/consumer/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container">
          <div className="mb-12">
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              Transaction History
            </h1>
            <p className="text-muted-foreground text-lg">
              Track all your earnings and withdrawals.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Total Earnings
                </CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-success text-2xl font-bold">
                  {formatCurrency(earnings, "USDC")}
                </div>
                <p className="text-muted-foreground text-xs">
                  From{" "}
                  {
                    filteredTransactions.filter((tx) => tx.type === "data_sale")
                      .length
                  }{" "}
                  data sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Total Withdrawals
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-info text-2xl font-bold">
                  {formatCurrency(withdrawals, "USDC")}
                </div>
                <p className="text-muted-foreground text-xs">
                  {
                    filteredTransactions.filter(
                      (tx) => tx.type === "withdrawal",
                    ).length
                  }{" "}
                  successful withdrawals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Net Balance Change
                </CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(earnings - withdrawals, "USDC")}
                </div>
                <p className="text-muted-foreground text-xs">
                  For filtered period
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="text-primary mr-3 h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      placeholder="Search description or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-secondary border-border w-full rounded-md border p-2"
                  >
                    <option value="all">All Types</option>
                    <option value="data_sale">Data Sales</option>
                    <option value="withdrawal">Withdrawals</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-secondary border-border w-full rounded-md border p-2"
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

          <Card>
            <CardHeader>
              <CardTitle>
                Transactions ({filteredTransactions.length})
              </CardTitle>
              <CardDescription>
                Your complete transaction history is listed below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center">
                    <p>No transactions found matching your filters.</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-secondary flex items-center justify-between rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-background rounded-full p-3">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.description}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {formatDate(transaction.createdAt)}
                          </div>
                          {transaction.metadata?.dataSourcesRequested && (
                            <div className="text-primary mt-1 text-xs">
                              Sources:{" "}
                              {transaction.metadata.dataSourcesRequested.join(
                                ", ",
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            transaction.type === "data_sale"
                              ? "text-success"
                              : "text-info"
                          }`}
                        >
                          {transaction.type === "data_sale" ? "+" : "-"}
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency,
                          )}
                        </div>
                        <div
                          className={`mt-1 flex items-center justify-end text-xs`}
                        >
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1.5 capitalize">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
