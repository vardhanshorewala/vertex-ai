"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { 
  ArrowLeft, 
  User,
  Shield,
  Bell,
  Eye,
  Smartphone,
  Key,
  CreditCard,
  Globe,
  Save,
  Lock,
  Trash2
} from "lucide-react";
import type { Consumer } from "~/types";
import Link from "next/link";

const mockConsumer: Consumer = {
  id: 'consumer-1',
  email: 'alice@example.com',
  name: 'Alice Johnson',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
  custodialWalletId: 'wallet-consumer-1',
  linkedAccounts: [],
  kycStatus: 'verified'
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [consumer, setConsumer] = useState<Consumer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile settings
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Security settings
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
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
    // Mock data loading
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConsumer(mockConsumer);
      setName(mockConsumer.name);
      setEmail(mockConsumer.email);
      setPhone('+1 (555) 123-4567'); // Mock phone
      
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChangePIN = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all PIN fields.",
        variant: "destructive"
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "New PIN and confirmation PIN don't match.",
        variant: "destructive"
      });
      return;
    }

    if (newPin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive"
      });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "PIN Updated",
        description: "Your security PIN has been changed successfully.",
      });

      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      toast({
        title: "PIN Change Failed",
        description: "Failed to change PIN. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggle2FA = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTwoFactorEnabled(!twoFactorEnabled);
      
      toast({
        title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
        description: twoFactorEnabled 
          ? "Two-factor authentication has been disabled." 
          : "Two-factor authentication has been enabled.",
      });
    } catch (error) {
      toast({
        title: "2FA Update Failed",
        description: "Failed to update two-factor authentication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and you will lose all your data and earnings."
    );

    if (!confirmed) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Account Deletion Initiated",
        description: "Your account deletion request has been submitted. You will receive an email confirmation.",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/consumer/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white">Account Settings</h1>
            <p className="text-gray-300">Manage your profile, security, and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-300">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Phone Number</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="pt-4">
                  <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-300">
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* PIN Change */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Change Security PIN</h4>
                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="Current PIN"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      maxLength={4}
                      className="bg-white/5 border-white/20 text-white text-center tracking-widest"
                    />
                    <Input
                      type="password"
                      placeholder="New PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      maxLength={4}
                      className="bg-white/5 border-white/20 text-white text-center tracking-widest"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      maxLength={4}
                      className="bg-white/5 border-white/20 text-white text-center tracking-widest"
                    />
                    <Button onClick={handleChangePIN} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                      <Key className="w-4 h-4 mr-2" />
                      Update PIN
                    </Button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-white text-sm">Authenticator App</div>
                        <div className="text-gray-400 text-xs">
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleToggle2FA}
                      variant={twoFactorEnabled ? "destructive" : "default"}
                      size="sm"
                    >
                      {twoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Privacy Controls
              </CardTitle>
              <CardDescription className="text-gray-300">
                Control how your data is used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white text-sm">Data Sharing</div>
                    <div className="text-gray-400 text-xs">Allow data sales to approved brokers</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataSharing}
                      onChange={(e) => setDataSharing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white text-sm">Analytics</div>
                    <div className="text-gray-400 text-xs">Help improve our platform</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsOptIn}
                      onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white text-sm">Marketing Emails</div>
                    <div className="text-gray-400 text-xs">Receive promotional content</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingEmails}
                      onChange={(e) => setMarketingEmails(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <Button onClick={handleSavePrivacy} className="w-full bg-gradient-to-r from-green-500 to-teal-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription className="text-gray-300">
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white text-sm">Email Notifications</div>
                    <div className="text-gray-400 text-xs">Account updates and alerts</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white text-sm">Push Notifications</div>
                    <div className="text-gray-400 text-xs">Browser and mobile alerts</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white text-sm">Transaction Alerts</div>
                    <div className="text-gray-400 text-xs">Data sales and withdrawals</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transactionAlerts}
                      onChange={(e) => setTransactionAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Account Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Manage your account and data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Link href="/consumer/transactions">
                    <CreditCard className="w-4 h-4 mr-2" />
                    View All Transactions
                  </Link>
                </Button>

                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Lock className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>

                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>

              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <h4 className="text-red-300 font-medium mb-2">Account Deletion</h4>
                <p className="text-red-200 text-sm">
                  Deleting your account will permanently remove all your data, linked accounts, 
                  transaction history, and any remaining wallet balance. This action cannot be undone.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 