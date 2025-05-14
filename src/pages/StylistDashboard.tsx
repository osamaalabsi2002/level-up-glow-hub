
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BookingsTab from '@/components/dashboard/BookingsTab';
import AvailabilityManager from '@/components/dashboard/AvailabilityManager';
import DashboardStats from '@/components/dashboard/DashboardStats';
import BlogsTab from '@/components/admin/BlogsTab';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useBookingOperations } from '@/hooks/useBookingOperations';

const StylistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, loading: authLoading } = useAuth();
  
  // Use the dashboard data hook to get necessary data
  const { 
    bookings, 
    loading, 
    statsData 
  } = useDashboardData();
  
  // Use booking operations
  const { 
    handleConfirmBooking, 
    handleDeleteBooking,
    isLoading: bookingLoading 
  } = useBookingOperations(bookings);
  
  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!profile || profile.role !== 'stylist') {
    return <Navigate to="/" replace />;
  }

  // Get the stylist ID if needed for availability manager
  // This is a placeholder - you would need to implement the actual lookup
  // of the stylist ID based on the profile.id
  const stylistId = 1; // Placeholder, implement actual lookup

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Stylist Dashboard" 
        subtitle="Stylist" 
      />
      
      <div className="container mx-auto py-10 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-4xl mx-auto mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="blogs">Blog</TabsTrigger>
          </TabsList>

          <div className="max-w-7xl mx-auto">
            <TabsContent value="overview">
              <DashboardStats 
                bookingsCount={statsData.bookingsCount}
                stylistsCount={statsData.stylistsCount}
                todayBookingsCount={statsData.todayBookingsCount}
                averageRating={statsData.averageRating}
              />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingsTab 
                bookings={bookings}
                onConfirmBooking={handleConfirmBooking}
                onDeleteBooking={handleDeleteBooking}
                loading={loading || bookingLoading}
              />
            </TabsContent>

            <TabsContent value="availability">
              <AvailabilityManager stylistId={stylistId} />
            </TabsContent>
            
            <TabsContent value="blogs">
              <BlogsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default StylistDashboard;
