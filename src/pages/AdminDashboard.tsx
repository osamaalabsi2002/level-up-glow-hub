
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BookingsTab from '@/components/dashboard/BookingsTab';
import ServicesTab from '@/components/dashboard/ServicesTab';
import StylistsTab from '@/components/dashboard/StylistsTab';
import ProductsTab from '@/components/admin/ProductsTab';
import BlogsTab from '@/components/admin/BlogsTab';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useBookingOperations } from '@/hooks/useBookingOperations';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, loading: authLoading } = useAuth();
  
  // Use the dashboard data hook to get all necessary data
  const { 
    bookings, 
    services, 
    stylists, 
    loading, 
    fetchData,
    statsData,
    setBookings,
    setServices,
    setStylists
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

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Handlers for CRUD operations
  const handleAddService = (service) => {
    setServices([...services, service]);
  };
  
  const handleEditService = (updatedService) => {
    setServices(services.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
  };
  
  const handleDeleteService = (id) => {
    setServices(services.filter(service => service.id !== id));
  };
  
  const handleAddStaff = (stylist) => {
    setStylists([...stylists, stylist]);
  };
  
  const handleEditStaff = (updatedStylist) => {
    setStylists(stylists.map(stylist => 
      stylist.id === updatedStylist.id ? updatedStylist : stylist
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Admin Dashboard" 
        subtitle="Administrator" 
      />
      
      <div className="container mx-auto py-10 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-4xl mx-auto mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="stylists">Stylists</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
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

            <TabsContent value="services">
              <ServicesTab 
                services={services}
                onAddService={handleAddService}
                onEditService={handleEditService}
                onDeleteService={handleDeleteService}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="stylists">
              <StylistsTab 
                stylists={stylists}
                onAddStaff={handleAddStaff}
                onEditStaff={handleEditStaff}
              />
            </TabsContent>
            
            <TabsContent value="products">
              <ProductsTab />
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

export default AdminDashboard;
