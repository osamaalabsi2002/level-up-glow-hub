import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BookingsTab from '@/components/dashboard/BookingsTab';
import ServicesTab from '@/components/dashboard/ServicesTab';
import StylistsTab from '@/components/dashboard/StylistsTab';
import ProductsTab from '@/components/admin/ProductsTab';
import BlogsTab from '@/components/admin/BlogsTab';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useBookingOperations } from '@/hooks/useBookingOperations';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile, loading: authLoading, profileLoading, isAdmin } = useAuth();
  const [initialCheckCompleted, setInitialCheckCompleted] = useState(false);
  const navigate = useNavigate();
  
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

  // Debug information
  useEffect(() => {
    console.log('AdminDashboard - Auth State:', { 
      user: user?.email,
      profile: profile?.role,
      authLoading,
      profileLoading,
      isAdmin: isAdmin?.()
    });
  }, [user, profile, authLoading, profileLoading, isAdmin]);

  // Two-phase access check
  // First phase: Initial check when component mounts
  useEffect(() => {
    console.log('AdminDashboard - Initial mount phase', { 
      authLoading, 
      profileLoading,
      profile: profile?.role, 
      initialCheckCompleted,
      userEmail: user?.email
    });

    // If auth is loading, wait
    if (authLoading) return;

    // If no user (not logged in), redirect immediately
    if (!user) {
      console.log('No user found, redirecting to login');
      toast.error('Please sign in to access the admin dashboard');
      navigate('/', { replace: true });
      return;
    }

    // Wait for profile to load before making final decision
    if (!profileLoading) {
      setInitialCheckCompleted(true);
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  // Second phase: Role verification after profile is loaded
  useEffect(() => {
    if (!initialCheckCompleted) return;
    
    console.log('AdminDashboard - Role verification phase', { 
      initialCheckCompleted, 
      profile: profile?.role,
      isAdmin: isAdmin?.(),
      userEmail: user?.email
    });

    // Check if user has admin role
    if (!isAdmin()) {
      console.log('User is not admin, redirecting to home');
      toast.error('Only admins can access this page');
      navigate('/', { replace: true });
    }
  }, [initialCheckCompleted, profile, isAdmin, navigate, user]);

  // Show loading state while checking auth
  if (authLoading || (profileLoading && !initialCheckCompleted)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-salon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-salon-green">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If we get here and user is not admin, redirect
  if (!isAdmin()) {
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
        subtitle={profile?.full_name || user?.email || "Administrator"} 
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
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <DashboardStats 
                  bookingsCount={statsData.bookingsCount}
                  stylistsCount={statsData.stylistsCount}
                  todayBookingsCount={statsData.todayBookingsCount}
                  averageRating={statsData.averageRating}
                />
              )}
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
