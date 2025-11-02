'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  Settings,
  UserCog,
  Key,
  Database,
  Globe,
  Bell,
  AlertTriangle,
  ArrowLeft,
  Save,
  Users,
  CheckCircle,
  FileText,
  DollarSign,
  Mail,
  Clock,
  Lock,
  Server,
  TrendingUp
} from 'lucide-react'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    // General
    siteName: 'Leli Rentals',
    siteUrl: 'https://www.leli.rentals',
    adminEmail: 'admin@leli.rentals',
    apiUrl: process.env.NEXT_PUBLIC_MAIN_API_URL || 'http://localhost:3000/api',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    adminNotifications: true,
    userNotifications: true,
    
    // Business
    currency: 'USD',
    timezone: 'UTC',
    registrationEnabled: true,
    listingApprovalRequired: true,
    
    // Security
    maintenanceMode: false,
    twoFactorAuth: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    
    // Performance
    cacheEnabled: true,
    rateLimitingEnabled: true,
    compressionEnabled: true
  })

  useEffect(() => {
    if (isLoaded && user) {
      // Load settings here
      setIsLoading(false)
    }
  }, [isLoaded, user])

  const handleSave = async () => {
    try {
      // Save settings logic here
      toast({
        title: '✅ Success',
        description: 'Settings saved successfully',
      })
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      })
    }
  }

  if (!isLoaded || isLoading) {
    return <LoadingSpinner message="Loading settings..." variant="admin" />
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Settings className="h-10 w-10 text-blue-600" />
              Super Admin Settings
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage platform-wide configuration and preferences
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm">
            Super Admin
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure basic platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  value={settings.apiUrl}
                  onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Configured via environment variables
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <Button
                  variant={settings.emailNotifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                >
                  {settings.emailNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
                </div>
                <Button
                  variant={settings.smsNotifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
                >
                  {settings.smsNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="admin">Admin Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive admin updates</p>
                </div>
                <Button
                  variant={settings.adminNotifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, adminNotifications: !settings.adminNotifications })}
                >
                  {settings.adminNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="user">User Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send notifications to users</p>
                </div>
                <Button
                  variant={settings.userNotifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, userNotifications: !settings.userNotifications })}
                >
                  {settings.userNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Control
              </CardTitle>
              <CardDescription>Manage system operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Temporarily disable platform access
                  </p>
                </div>
                <Button
                  variant={settings.maintenanceMode ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                >
                  {settings.maintenanceMode ? 'Active' : 'Inactive'}
                </Button>
              </div>
              {settings.maintenanceMode && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Warning</p>
                      <p className="text-xs text-yellow-600/80">
                        Maintenance mode will prevent users from accessing the platform
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Platform security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Authentication</Label>
                <Badge variant="outline" className="w-full justify-center py-2">
                  Clerk Integration Active
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>API Security</Label>
                <Badge variant="outline" className="w-full justify-center py-2">
                  Credential-based Auth Enabled
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                View Security Logs
              </Button>
            </CardContent>
          </Card>
          
          {/* Business Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Business Settings
              </CardTitle>
              <CardDescription>Configure business rules and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={settings.currency}
                  onValueChange={(value) => setSettings({ ...settings, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC - Coordinated Universal Time</SelectItem>
                    <SelectItem value="America/New_York">EST - Eastern Time</SelectItem>
                    <SelectItem value="Europe/London">GMT - London</SelectItem>
                    <SelectItem value="Africa/Nairobi">EAT - Nairobi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registration">Registration Enabled</Label>
                  <p className="text-xs text-muted-foreground">Allow new user registrations</p>
                </div>
                <Button
                  variant={settings.registrationEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, registrationEnabled: !settings.registrationEnabled })}
                >
                  {settings.registrationEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="approval">Listing Approval Required</Label>
                  <p className="text-xs text-muted-foreground">Approve listings before publishing</p>
                </div>
                <Button
                  variant={settings.listingApprovalRequired ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, listingApprovalRequired: !settings.listingApprovalRequired })}
                >
                  {settings.listingApprovalRequired ? 'Required' : 'Auto-approve'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Advanced Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Advanced Security
              </CardTitle>
              <CardDescription>Additional security configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">Require 2FA for admins</p>
                </div>
                <Button
                  variant={settings.twoFactorAuth ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                >
                  {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  min="1"
                  max="168"
                />
              </div>
              <div>
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                  min="3"
                  max="10"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
              <CardDescription>Optimize platform performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cache">Caching Enabled</Label>
                  <p className="text-xs text-muted-foreground">Enable response caching</p>
                </div>
                <Button
                  variant={settings.cacheEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, cacheEnabled: !settings.cacheEnabled })}
                >
                  {settings.cacheEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ratelimit">Rate Limiting</Label>
                  <p className="text-xs text-muted-foreground">Limit API request rates</p>
                </div>
                <Button
                  variant={settings.rateLimitingEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, rateLimitingEnabled: !settings.rateLimitingEnabled })}
                >
                  {settings.rateLimitingEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compression">Compression</Label>
                  <p className="text-xs text-muted-foreground">Enable response compression</p>
                </div>
                <Button
                  variant={settings.compressionEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, compressionEnabled: !settings.compressionEnabled })}
                >
                  {settings.compressionEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <UserCog className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription className="text-green-600/80">Admin user and role management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col border-green-500 text-green-600 hover:bg-green-500 hover:text-white" onClick={() => router.push('/dashboard/users')}>
                <Users className="h-5 w-5 mb-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="h-20 flex-col border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
                <Shield className="h-5 w-5 mb-2" />
                Admin Roles
              </Button>
              <Button variant="outline" className="h-20 flex-col border-green-500 text-green-600 hover:bg-green-500 hover:text-white" onClick={() => router.push('/dashboard/verifications')}>
                <CheckCircle className="h-5 w-5 mb-2" />
                Verifications
              </Button>
              <Button variant="outline" className="h-20 flex-col border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
                <FileText className="h-5 w-5 mb-2" />
                Activity Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

