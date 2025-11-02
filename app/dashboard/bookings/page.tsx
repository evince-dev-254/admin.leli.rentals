'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { bookingsService, type Booking } from '@/lib/services/bookings'
import { Calendar, RefreshCw, Eye, ArrowLeft } from 'lucide-react'

export default function BookingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsFilter, setBookingsFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    if (isLoaded && user) {
      fetchBookings()
    }
  }, [isLoaded, user])

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
              <Calendar className="h-10 w-10 text-blue-600" />
              Bookings Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              View and manage all platform bookings ({bookings.length} total)
            </p>
          </div>
          <Button onClick={fetchBookings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>Filter bookings by status</CardDescription>
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
      </div>
    </div>
  )
}

