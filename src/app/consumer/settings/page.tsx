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
import { useToast } from "~/components/ui/use-toast";
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Eye,
  Key,
  Globe,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";
import type { Consumer } from "~/types";
import Link from "next/link";

const mockConsumer: Consumer = {
  id: "consumer-1",
  email: "alice@example.com",
  name: "Alice Johnson",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
  custodialWalletId: "wallet-consumer-1",
  linkedAccounts: [],
  kycStatus: "verified",
};

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="bg-secondary flex items-center justify-between rounded-lg p-4">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground text-sm">{description}</div>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="bg-background peer after:border-border peer-checked:bg-primary h-6 w-11 rounded-full peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [, setConsumer] = useState<Consumer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Security settings
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Privacy settings
  const [dataSharing, setDataSharing] = useState(true);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setConsumer(mockConsumer);
      setName(mockConsumer.name);
      setEmail(mockConsumer.email);
      setPhone("+1 (555) 123-4567");

      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
      variant: "default",
    });
  };

  const handleChangePIN = async () => {
    if (
      !currentPin ||
      !newPin ||
      !confirmPin ||
      newPin !== confirmPin ||
      newPin.length !== 4
    ) {
      toast({
        title: "PIN Error",
        description: "Please check your PIN entries.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "PIN Updated",
      description: "Your security PIN has been changed successfully.",
      variant: "default",
    });
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  const handleToggle2FA = async () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      variant: "default",
    });
  };

  const handleSavePrivacy = async () => {
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
      variant: "default",
    });
  };

  const handleSaveNotifications = async () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
      variant: "default",
    });
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and you will lose all your data and earnings.",
    );
    if (confirmed) {
      toast({
        title: "Account Deletion Initiated",
        description: "Your account deletion request has been submitted.",
        variant: "default",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveProfile} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case "security":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium">Change Security PIN</h4>
                <Input
                  type="password"
                  placeholder="Current PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  maxLength={4}
                  className="text-center tracking-widest"
                />
                <Input
                  type="password"
                  placeholder="New PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={4}
                  className="text-center tracking-widest"
                />
                <Input
                  type="password"
                  placeholder="Confirm New PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={4}
                  className="text-center tracking-widest"
                />
                <Button
                  onClick={handleChangePIN}
                  variant="secondary"
                  className="w-full"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Update PIN
                </Button>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
                <Toggle
                  checked={twoFactorEnabled}
                  onChange={handleToggle2FA}
                  label="Authenticator App"
                  description={twoFactorEnabled ? "Enabled" : "Disabled"}
                />
              </div>
            </CardContent>
          </Card>
        );
      case "privacy":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Privacy Controls</CardTitle>
              <CardDescription>
                Control how your data is used across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                checked={dataSharing}
                onChange={setDataSharing}
                label="Data Sharing"
                description="Allow data sales to approved brokers"
              />
              <Toggle
                checked={analyticsOptIn}
                onChange={setAnalyticsOptIn}
                label="Platform Analytics"
                description="Help us improve our platform"
              />
              <Toggle
                checked={marketingEmails}
                onChange={setMarketingEmails}
                label="Marketing Emails"
                description="Receive promotional content and offers"
              />
              <div className="pt-4">
                <Button onClick={handleSavePrivacy} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case "notifications":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure your notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                checked={emailNotifications}
                onChange={setEmailNotifications}
                label="Email Notifications"
                description="Account updates and security alerts"
              />
              <Toggle
                checked={pushNotifications}
                onChange={setPushNotifications}
                label="Push Notifications"
                description="Browser and mobile alerts"
              />
              <Toggle
                checked={transactionAlerts}
                onChange={setTransactionAlerts}
                label="Transaction Alerts"
                description="Notifications for data sales and withdrawals"
              />
              <div className="pt-4">
                <Button onClick={handleSaveNotifications} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case "account":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account and data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
                <h4 className="text-destructive mb-2 font-medium">
                  Delete Account
                </h4>
                <p className="text-muted-foreground mb-4 text-sm">
                  Deleting your account will permanently remove all your data,
                  linked accounts, transaction history, and any remaining wallet
                  balance. This action cannot be undone.
                </p>
                <Button onClick={handleDeleteAccount} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: Globe },
  ];

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
            <Button asChild variant="outline" size="sm">
              <Link href="/consumer/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container">
          <div className="mb-12">
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your profile, security, and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="flex flex-col space-y-1">
                    {tabs.map((tab) => (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        onClick={() => setActiveTab(tab.id)}
                        className="w-full justify-start"
                      >
                        <tab.icon className="mr-3 h-4 w-4" />
                        {tab.label}
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">{renderContent()}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
