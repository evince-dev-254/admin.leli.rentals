'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { usersService, type User } from '@/lib/services/users'
import { Search, Eye, Users as UsersIcon, ArrowLeft } from 'lucide-react'

export default function UsersPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'owner' | 'renter' | 'verified' | 'pending'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchAllUsers()
    }
  }, [isLoaded, user])

  const fetchAllUsers = async () => {
    setIsLoading(true)
    try {
      const data = await usersService.getAllUsers()
      
      if (data.success && data.users) {
        setAllUsers(data.users)
        setFilteredUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: '❌ Error',
        description: 'Failed to load user data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
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

  if (!isLoaded || isLoading) {
    return <LoadingSpinner message="Loading users..." variant="admin" />
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
              <UsersIcon className="h-10 w-10 text-blue-600" />
              User Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              View and manage all registered users
            </p>
          </div>
          <Button onClick={fetchAllUsers} variant="outline">
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({allUsers.length})</CardTitle>
            <CardDescription>Search and filter users by type or verification status</CardDescription>
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
                            router.push(`/dashboard/verifications?email=${user.emailAddresses?.[0]?.emailAddress}`)
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
      </div>
    </div>
  )
}

