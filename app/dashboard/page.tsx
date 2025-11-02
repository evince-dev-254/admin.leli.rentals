'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { usersService, type User } from '@/lib/services/users'
import { listingsService, type Listing } from '@/lib/services/listings'
import { bookingsService, type Booking } from '@/lib/services/bookings'
import { statsService, type PlatformStats } from '@/lib/services/stats'
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  DollarSign,
  Home,
  Eye,
  Calendar,
  Package,
  Activity,
  RefreshCw,
  MoreVertical,
} from 'lucide-react'

interface UserStats {
  totalUsers: number
  owners: number
  renters: number
  verifiedUsers: number
  pendingVerifications: number
  rejectedVerifications: number
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    owners: 0,
    renters: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    rejectedVerifications: 0
  })
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'owner' | 'renter' | 'verified' | 'pending'>('all')

  // Listings state
  const [listings, setListings] = useState<Listing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [listingsFilter, setListingsFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  
  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsFilter, setBookingsFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  
  // Platform stats
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Check admin access
  useEffect(() => {
    if (isLoaded && user) {
      // TEMPORARILY DISABLED FOR DEVELOPMENT - Allow all authenticated users
      setIsAdmin(true)
      fetchAllUsers()
      fetchListings()
      fetchBookings()
      fetchPlatformStats()
    }
  }, [isLoaded, user])

  const fetchAllUsers = async () => {
    setIsLoadingStats(true)
    try {
      const data = await usersService.getAllUsers()
      
      if (data.success && data.users) {
        setAllUsers(data.users)
        setFilteredUsers(data.users)
        calculateStats(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: '❌ Error',
        description: 'Failed to load user data',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const fetchListings = async () => {
    setListingsLoading(true)
    try {
      const data = await listingsService.getAllListings()
      
      if (data.success && data.listings) {
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      toast({
        title: '❌ Error',
        description: 'Failed to load listings',
        variant: 'destructive'
      })
    } finally {
      setListingsLoading(false)
    }
  }

  const fetchBookings = async () => {
    setBookingsLoading(true)
    try {
      const data = await bookingsService.getAllBookings()
      
      if (data.success && data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: '❌ Error',
        description: 'Failed to load bookings',
        variant: 'destructive'
      })
    } finally {
      setBookingsLoading(false)
    }
  }

  const fetchPlatformStats = async () => {
    setStatsLoading(true)
    try {
      const data = await statsService.getPlatformStats()
      setPlatformStats(data)
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      toast({
        title: '❌ Error',
        description: 'Failed to load platform stats',
        variant: 'destructive'
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const calculateStats = (users: User[]) => {
    const stats: UserStats = {
      totalUsers: users.length,
      owners: users.filter(u => u.unsafeMetadata?.accountType === 'owner').length,
      renters: users.filter(u => u.unsafeMetadata?.accountType === 'renter').length,
      verifiedUsers: users.filter(u => u.unsafeMetadata?.verificationStatus === 'approved').length,
      pendingVerifications: users.filter(u => u.unsafeMetadata?.verificationStatus === 'pending').length,
      rejectedVerifications: users.filter(u => u.unsafeMetadata?.verificationStatus === 'rejected').length,
    }
    setUserStats(stats)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterUsers(query, filterType)
  }

  const handleFilterChange = (type: typeof filterType) => {
    setFilterType(type)
    filterUsers(searchQuery, type)
  }

  const filterUsers = (query: string, type: typeof filterType) => {
    let filtered = allUsers

    // Apply type filter
    if (type === 'owner') {
      filtered = filtered.filter(u => u.unsafeMetadata?.accountType === 'owner')
    } else if (type === 'renter') {
      filtered = filtered.filter(u => u.unsafeMetadata?.accountType === 'renter')
    } else if (type === 'verified') {
      filtered = filtered.filter(u => u.unsafeMetadata?.verificationStatus === 'approved')
    } else if (type === 'pending') {
      filtered = filtered.filter(u => u.unsafeMetadata?.verificationStatus === 'pending')
    }

    // Apply search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(u => 
        u.firstName?.toLowerCase().includes(lowerQuery) ||
        u.lastName?.toLowerCase().includes(lowerQuery) ||
        u.emailAddresses?.[0]?.emailAddress?.toLowerCase().includes(lowerQuery)
      )
    }

    setFilteredUsers(filtered)
  }

  if (!isLoaded || isLoadingStats) {
    return <LoadingSpinner message="Loading Admin Panel..." variant="admin" />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have admin privileges</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Shield className="h-10 w-10 text-blue-600" />
              Admin Control Panel
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage users, verifications, and platform settings
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm hover:opacity-90 cursor-pointer"
            onClick={() => router.push('/dashboard/settings')}
          >
            Super Admin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => router.push('/dashboard/users')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered on platform
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Owners</CardTitle>
              <Home className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userStats.owners}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((userStats.owners / userStats.totalUsers) * 100 || 0).toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renters</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userStats.renters}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((userStats.renters / userStats.totalUsers) * 100 || 0).toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userStats.verifiedUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ID verification approved
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => router.push('/dashboard/verifications')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userStats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting admin review
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 dark:border-red-800 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => router.push('/dashboard/verifications')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userStats.rejectedVerifications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Verification rejected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats?.listings?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {platformStats?.listings?.published || 0} published
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats?.bookings?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {platformStats?.bookings?.confirmed || 0} confirmed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(platformStats?.revenue?.total || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${(platformStats?.revenue?.monthly || 0).toLocaleString()} this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {userStats.owners} owners, {userStats.renters} renters
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col" onClick={() => router.push('/dashboard/verifications')}>
                    <Shield className="h-5 w-5 mb-2" />
                    Review Verifications
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => router.push('/dashboard/listings')}>
                    <FileText className="h-5 w-5 mb-2" />
                    Manage Listings
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => router.push('/dashboard/bookings')}>
                    <Calendar className="h-5 w-5 mb-2" />
                    View Bookings
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => {
                    fetchPlatformStats()
                    fetchAllUsers()
                    fetchListings()
                    fetchBookings()
                  }}>
                    <BarChart3 className="h-5 w-5 mb-2" />
                    Refresh Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      onClick={() => handleFilterChange('all')}
                      size="sm"
                    >
                      All
                    </Button>
                    <Button 
                      variant={filterType === 'owner' ? 'default' : 'outline'}
                      onClick={() => handleFilterChange('owner')}
                      size="sm"
                    >
                      Owners
                    </Button>
                    <Button 
                      variant={filterType === 'renter' ? 'default' : 'outline'}
                      onClick={() => handleFilterChange('renter')}
                      size="sm"
                    >
                      Renters
                    </Button>
                    <Button 
                      variant={filterType === 'verified' ? 'default' : 'outline'}
                      onClick={() => handleFilterChange('verified')}
                      size="sm"
                    >
                      Verified
                    </Button>
                    <Button 
                      variant={filterType === 'pending' ? 'default' : 'outline'}
                      onClick={() => handleFilterChange('pending')}
                      size="sm"
                    >
                      Pending
                    </Button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Name</th>
                        <th className="text-left p-3 font-semibold">Email</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Joined</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-t hover:bg-muted/50">
                          <td className="p-3">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {user.emailAddresses?.[0]?.emailAddress || 'No email'}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">
                              {user.unsafeMetadata?.accountType || 'Not set'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge 
                              variant={
                                user.unsafeMetadata?.verificationStatus === 'approved' ? 'default' :
                                user.unsafeMetadata?.verificationStatus === 'pending' ? 'secondary' :
                                user.unsafeMetadata?.verificationStatus === 'rejected' ? 'destructive' :
                                'outline'
                              }
                            >
                              {user.unsafeMetadata?.verificationStatus || 'None'}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                if (user.unsafeMetadata?.verificationStatus === 'pending') {
                                  router.push(`/dashboard/verifications?email=${user.emailAddresses?.[0]?.emailAddress}`)
                                }
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verify Tab */}
          <TabsContent value="verify" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Verification</CardTitle>
                <CardDescription>Verify user identity documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/dashboard/verifications')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Open Verification Tool
                </Button>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {userStats.pendingVerifications} verification{userStats.pendingVerifications !== 1 ? 's' : ''} pending review
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Listings Management</CardTitle>
                    <CardDescription>View and moderate platform listings ({listings.length} total)</CardDescription>
                  </div>
                  <Button onClick={fetchListings} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={listingsFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setListingsFilter('all')}
                  >
                    All ({listings.length})
                  </Button>
                  <Button 
                    variant={listingsFilter === 'published' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setListingsFilter('published')}
                  >
                    Published ({listings.filter(l => l.status === 'published').length})
                  </Button>
                  <Button 
                    variant={listingsFilter === 'draft' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setListingsFilter('draft')}
                  >
                    Draft ({listings.filter(l => l.status === 'draft').length})
                  </Button>
                  <Button 
                    variant={listingsFilter === 'archived' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setListingsFilter('archived')}
                  >
                    Archived ({listings.filter(l => l.status === 'archived').length})
                  </Button>
                </div>

                {/* Listings Table */}
                {listingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading listings...</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-semibold">Title</th>
                          <th className="text-left p-3 font-semibold">Owner</th>
                          <th className="text-left p-3 font-semibold">Category</th>
                          <th className="text-left p-3 font-semibold">Price</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Created</th>
                          <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings
                          .filter(l => listingsFilter === 'all' || l.status === listingsFilter)
                          .slice(0, 50)
                          .map((listing) => (
                            <tr key={listing.id} className="border-t hover:bg-muted/50">
                              <td className="p-3 font-medium">{listing.title}</td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {listing.owner_name || 'Unknown'}
                              </td>
                              <td className="p-3">
                                <Badge variant="outline" className="capitalize">
                                  {listing.category || 'N/A'}
                                </Badge>
                              </td>
                              <td className="p-3">
                                {listing.price ? `KES ${listing.price.toLocaleString()}` : 'N/A'}
                              </td>
                              <td className="p-3">
                                <Badge 
                                  variant={
                                    listing.status === 'published' ? 'default' :
                                    listing.status === 'draft' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {listing.status || 'N/A'}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-3">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {listings.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No listings found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bookings Management</CardTitle>
                    <CardDescription>View and manage all platform bookings ({bookings.length} total)</CardDescription>
                  </div>
                  <Button onClick={fetchBookings} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={bookingsFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setBookingsFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={bookingsFilter === 'pending' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setBookingsFilter('pending')}
                  >
                    Pending ({bookings.filter(b => b.status === 'pending').length})
                  </Button>
                  <Button 
                    variant={bookingsFilter === 'confirmed' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setBookingsFilter('confirmed')}
                  >
                    Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
                  </Button>
                  <Button 
                    variant={bookingsFilter === 'completed' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setBookingsFilter('completed')}
                  >
                    Completed ({bookings.filter(b => b.status === 'completed').length})
                  </Button>
                  <Button 
                    variant={bookingsFilter === 'cancelled' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setBookingsFilter('cancelled')}
                  >
                    Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
                  </Button>
                </div>

                {/* Bookings Table */}
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading bookings...</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-semibold">Listing</th>
                          <th className="text-left p-3 font-semibold">Customer</th>
                          <th className="text-left p-3 font-semibold">Dates</th>
                          <th className="text-left p-3 font-semibold">Amount</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Created</th>
                          <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings
                          .filter(b => bookingsFilter === 'all' || b.status === bookingsFilter)
                          .slice(0, 50)
                          .map((booking) => (
                            <tr key={booking.id} className="border-t hover:bg-muted/50">
                              <td className="p-3 font-medium">{booking.listing_title || 'Unknown'}</td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {booking.customer_name || 'Unknown'}
                              </td>
                              <td className="p-3 text-sm">
                                {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'} - {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-3 font-medium">
                                {booking.total_price ? `KES ${booking.total_price.toLocaleString()}` : 'N/A'}
                              </td>
                              <td className="p-3">
                                <Badge 
                                  variant={
                                    booking.status === 'confirmed' ? 'default' :
                                    booking.status === 'completed' ? 'default' :
                                    booking.status === 'cancelled' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {booking.status || 'N/A'}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-3">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {bookings.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Platform statistics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/dashboard/analytics')} variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Full Analytics Dashboard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${(platformStats?.revenue?.total || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time earnings
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${(platformStats?.revenue?.monthly || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
                  <Activity className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${(platformStats?.revenue?.weekly || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 7 days
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Booking</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${(platformStats?.revenue?.averageBooking || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per booking
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

