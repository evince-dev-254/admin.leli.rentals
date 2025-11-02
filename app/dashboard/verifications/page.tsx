'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { usersService, type User } from '@/lib/services/users'
import { verificationService } from '@/lib/services/verification'
import {
  Shield,
  CheckCircle,
  XCircle,
  Search,
  Users,
  FileText,
  ArrowLeft
} from 'lucide-react'

export default function VerificationsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if user is admin
  const isAdmin = true // TEMPORARILY DISABLED FOR DEVELOPMENT

  useEffect(() => {
    if (isLoaded && user) {
      fetchAllUsers()
    }
  }, [isLoaded, user])

  useEffect(() => {
    filterUsers(searchQuery, verificationFilter)
  }, [allUsers, searchQuery, verificationFilter])

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
        description: 'Failed to load users',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = (query: string, filter: typeof verificationFilter) => {
    let filtered = allUsers

    // Apply verification status filter
    if (filter === 'pending') {
      filtered = filtered.filter(u => u.unsafeMetadata?.verificationStatus === 'pending')
    } else if (filter === 'approved') {
      filtered = filtered.filter(u => u.unsafeMetadata?.verificationStatus === 'approved')
    } else if (filter === 'rejected') {
      filtered = filtered.filter(u => u.unsafeMetadata?.verificationStatus === 'rejected')
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

  const handleFilterChange = (filter: typeof verificationFilter) => {
    setVerificationFilter(filter)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  if (!isLoaded) {
    return <LoadingSpinner message="Loading..." variant="admin" />
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }


  const handleApprove = async () => {
    if (!selectedUser) return

    // Enforce: documents must be present before approval
    const docs = selectedUser?.unsafeMetadata?.verificationDocuments || {}
    const hasAllRequiredDocs = Boolean(docs.documentFront && docs.documentBack && docs.selfieWithDocument)
    if (!hasAllRequiredDocs) {
      toast({
        title: '⚠️ Documents Required',
        description: 'Please ensure the user has submitted ID front, ID back, and a selfie with the ID before approving.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      await verificationService.approveVerification(selectedUser.id)
      toast({
        title: '✅ Verification Approved!',
        description: `${selectedUser.firstName} ${selectedUser.lastName} is now verified`,
      })
      setSelectedUser(null)
      setRejectionReason('')
      fetchAllUsers() // Refresh the list
    } catch (error) {
      console.error('Error approving verification:', error)
      toast({
        title: '❌ Approval Failed',
        description: error instanceof Error ? error.message : 'Error approving verification',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedUser) return

    if (!rejectionReason.trim()) {
      toast({
        title: '⚠️ Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      await verificationService.rejectVerification(selectedUser.id, rejectionReason.trim())
      toast({
        title: '✅ Verification Rejected',
        description: `Rejection email sent to ${selectedUser.firstName}`,
      })
      setSelectedUser(null)
      setRejectionReason('')
      fetchAllUsers() // Refresh the list
    } catch (error) {
      console.error('Error rejecting verification:', error)
      toast({
        title: '❌ Rejection Failed',
        description: 'Error rejecting verification',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading users..." variant="admin" />
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        {/* Header */}
        <div className="text-center">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600">
            Admin Panel
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            User Verification Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse and verify all users ({filteredUsers.length} shown)
          </p>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div>
              <Label>Verification Status</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  variant={verificationFilter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </Button>
                <Button 
                  variant={verificationFilter === 'pending' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFilterChange('pending')}
                >
                  Pending
                </Button>
                <Button 
                  variant={verificationFilter === 'approved' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFilterChange('approved')}
                >
                  Approved
                </Button>
                <Button 
                  variant={verificationFilter === 'rejected' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleFilterChange('rejected')}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {!selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Click on a user to view details and verify</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge 
                          variant={
                            user.unsafeMetadata?.verificationStatus === 'approved' ? 'default' :
                            user.unsafeMetadata?.verificationStatus === 'pending' ? 'secondary' :
                            user.unsafeMetadata?.verificationStatus === 'rejected' ? 'destructive' :
                            'outline'
                          }
                        >
                          {user.unsafeMetadata?.verificationStatus || 'Not Submitted'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.emailAddresses?.[0]?.emailAddress}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* User Details Card */}
        {selectedUser && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Details
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Back to List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedUser.emailAddresses?.[0]?.emailAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{selectedUser.phoneNumbers?.[0]?.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <Badge 
                    variant={
                      selectedUser.unsafeMetadata?.verificationStatus === 'approved' ? 'default' :
                      selectedUser.unsafeMetadata?.verificationStatus === 'pending' ? 'secondary' :
                      selectedUser.unsafeMetadata?.verificationStatus === 'rejected' ? 'destructive' :
                      'outline'
                    }
                  >
                    {selectedUser.unsafeMetadata?.verificationStatus || 'Not Submitted'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-semibold capitalize">
                    {selectedUser.unsafeMetadata?.accountType || 'Not Set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Verification Documents */}
              {(selectedUser.unsafeMetadata?.verificationDocuments || selectedUser.unsafeMetadata?.verificationStatus === 'pending') && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Verification Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Document Front */}
                    {selectedUser.unsafeMetadata?.verificationDocuments?.documentFront && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">ID Front</Label>
                        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img 
                            src={selectedUser.unsafeMetadata.verificationDocuments.documentFront} 
                            alt="Document Front" 
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(selectedUser.unsafeMetadata.verificationDocuments.documentFront, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                    {/* Document Back */}
                    {selectedUser.unsafeMetadata?.verificationDocuments?.documentBack && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">ID Back</Label>
                        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img 
                            src={selectedUser.unsafeMetadata.verificationDocuments.documentBack} 
                            alt="Document Back" 
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(selectedUser.unsafeMetadata.verificationDocuments.documentBack, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                    {/* Selfie with Document */}
                    {selectedUser.unsafeMetadata?.verificationDocuments?.selfieWithDocument && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Selfie with ID</Label>
                        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img 
                            src={selectedUser.unsafeMetadata.verificationDocuments.selfieWithDocument} 
                            alt="Selfie with Document" 
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(selectedUser.unsafeMetadata.verificationDocuments.selfieWithDocument, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason Input */}
              {selectedUser.unsafeMetadata?.verificationStatus !== 'approved' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Enter reason for rejection (e.g., 'Documents not clear', 'ID expired', etc.)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing || selectedUser.unsafeMetadata?.verificationStatus === 'approved'}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Verification
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Verification
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

