import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BookingsTab from '@/components/dashboard/BookingsTab';
import AvailabilityManager from '@/components/dashboard/AvailabilityManager';
import DashboardStats from '@/components/dashboard/DashboardStats';
import BlogsTab from '@/components/admin/BlogsTab';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useBookingOperations } from '@/hooks/useBookingOperations';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const StylistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, loading: authLoading, profileLoading, isStylist } = useAuth();
  const [initialCheckCompleted, setInitialCheckCompleted] = useState(false);
  const [stylistId, setStylistId] = useState<number | null>(null);
  const navigate = useNavigate();
  
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
  
  // Two-phase access check
  // First phase: Initial check when component mounts
  useEffect(() => {
    console.log('StylistDashboard - Initial mount phase', { 
      authLoading, 
      profileLoading,
      profile: profile?.role, 
      initialCheckCompleted 
    });

    // If auth is loading, wait
    if (authLoading || profileLoading) return;

    // If no profile (not logged in), redirect immediately
    if (!profile) {
      console.log('No profile found, redirecting to home');
      toast.error('Please sign in to access the stylist dashboard');
      navigate('/', { replace: true });
      return;
    }

    // Mark initial check as complete
    setInitialCheckCompleted(true);
  }, [profile, authLoading, profileLoading, navigate]);

  // Second phase: Role verification after profile is loaded
  useEffect(() => {
    console.log('StylistDashboard - Role verification phase', { 
      initialCheckCompleted, 
      profile: profile?.role,
      isStylist: isStylist?.()
    });

    // Skip if initial check isn't complete or auth is still loading
    if (!initialCheckCompleted || authLoading || profileLoading) return;

    // Now that we have the profile, check if user is stylist
    if (!isStylist()) {
      console.log('User is not stylist, redirecting to home');
      toast.error('Only stylists can access this page');
      navigate('/', { replace: true });
    }
  }, [initialCheckCompleted, profile, isStylist, navigate, authLoading, profileLoading]);

  // Fetch stylist ID for the logged-in user
  useEffect(() => {
    const fetchStylistId = async () => {
      if (!profile || !profile.id) return;
      
      try {
        // Get the stylist record for this user
        const { data, error } = await supabase
          .from('stylists')
          .select('id')
          .eq('user_id', profile.id)
          .single();
          
        if (error) {
          console.error('Error fetching stylist ID:', error);
          return;
        }
        
        if (data) {
          console.log(`Found stylist ID ${data.id} for user ${profile.id}`);
          setStylistId(data.id);
        } else {
          console.warn(`No stylist record found for user ${profile.id}`);
        }
      } catch (error) {
        console.error('Error in fetchStylistId:', error);
      }
    };
    
    if (initialCheckCompleted && profile?.id) {
      fetchStylistId();
    }
  }, [profile, initialCheckCompleted]);

  // Show loading state while checking auth
  if (authLoading || profileLoading || !initialCheckCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-salon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-salon-green">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Verifying stylist access...</p>
        </div>
      </div>
    );
  }

  // If we get here and user is not stylist, redirect
  if (!isStylist()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Stylist Dashboard" 
        subtitle={profile.full_name || "Stylist"} 
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
              {stylistId ? (
                <AvailabilityManager stylistId={stylistId} />
              ) : (
                <div className="p-6 bg-white rounded-lg shadow text-center">
                  <p className="text-lg text-gray-600 mb-2">Unable to load availability settings</p>
                  <p className="text-sm text-gray-500">Could not determine your stylist ID. Please contact support.</p>
                </div>
              )}
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
