'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { listingsService, type Listing } from '@/lib/services/listings'
import { Package, RefreshCw, Eye, ArrowLeft } from 'lucide-react'

export default function ListingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [listings, setListings] = useState<Listing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [listingsFilter, setListingsFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')

  useEffect(() => {
    if (isLoaded && user) {
      fetchListings()
    }
  }, [isLoaded, user])

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

  if (!isLoaded) {
    return <LoadingSpinner message="Loading..." variant="admin" />
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
              <Package className="h-10 w-10 text-blue-600" />
              Listings Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              View and moderate platform listings ({listings.length} total)
            </p>
          </div>
          <Button onClick={fetchListings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Listings</CardTitle>
            <CardDescription>Filter listings by status</CardDescription>
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
      </div>
    </div>
  )
}

