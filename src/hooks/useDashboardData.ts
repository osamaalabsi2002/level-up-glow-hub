import { useState, useEffect } from "react";
import { Booking, Service, Stylist } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    bookingsCount: 0,
    stylistsCount: 0,
    todayBookingsCount: 0,
    averageRating: 0,
  });
  
  // Get current user session to determine role
  const [userSession, setUserSession] = useState<any>(null);
  const [currentStylistId, setCurrentStylistId] = useState<number | null>(null);
  
  // Get user session on load
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data && data.session) {
        setUserSession(data.session);
      }
    };
    getSession();
  }, []);
  
  // Identify current stylist ID if the user is a stylist
  useEffect(() => {
    const getCurrentStylistId = async () => {
      if (!userSession?.user) return;
      
      try {
        // Get the current user's ID from the session
        const userId = userSession.user.id;
        
        // Use the user ID to find their stylist record
        const { data, error } = await supabase
          .from('stylists')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          console.error('Error finding stylist ID:', error);
          return;
        }
        
        if (data) {
          console.log(`Found stylist ID ${data.id} for user ${userId}`);
          setCurrentStylistId(data.id);
        }
      } catch (error) {
        console.error('Error in getCurrentStylistId:', error);
      }
    };
    
    getCurrentStylistId();
  }, [userSession]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBookings(),
        fetchServices(),
        fetchStylists(),
        fetchStats()
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          id,
          date,
          time,
          status,
          duration,
          client_name,
          client_email,
          client_phone,
          stylist_id,
          services:service_id(name),
          stylists:stylist_id(name)
        `)
        .order('date', { ascending: false });
      
      // Check the current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      
      if (currentUser) {
        // Get the user's profile to determine their role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        
        // If user is a stylist, find their stylist ID and filter bookings
        if (profileData?.role === 'stylist') {
          // Look up the stylist ID for this user
          const { data: stylistData } = await supabase
            .from('stylists')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();
          
          if (stylistData?.id) {
            console.log(`Filtering bookings for stylist ID: ${stylistData.id}`);
            query = query.eq('stylist_id', stylistData.id);
          } else {
            console.warn(`User ${currentUser.id} has stylist role but no stylist record found`);
          }
        }
      }
      
      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedBookings = data.map(booking => ({
          id: booking.id,
          date: booking.date,
          time: booking.time,
          status: booking.status,
          duration: booking.duration,
          clientName: booking.client_name || "",
          clientEmail: booking.client_email,
          clientPhone: booking.client_phone,
          stylistId: booking.stylist_id,
          stylistName: booking.stylists?.name || "Unassigned",
          service: booking.services?.name || "Unknown Service"
        }));
        
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStylists = async () => {
    try {
      const { data, error } = await supabase
        .from('stylists')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setStylists(data);
      }
    } catch (error) {
      console.error('Error fetching stylists:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get bookings count
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      // Get stylists count
      const { count: stylistsCount } = await supabase
        .from('stylists')
        .select('*', { count: 'exact', head: true });
      
      // Get today's bookings
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);
      
      // Get average rating
      const { data: ratingData } = await supabase
        .from('stylists')
        .select('rating');
      
      const avgRating = ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, item) => sum + item.rating, 0) / ratingData.length
        : 0;
      
      setStatsData({
        bookingsCount: bookingsCount || 0,
        stylistsCount: stylistsCount || 0,
        todayBookingsCount: todayCount || 0,
        averageRating: parseFloat(avgRating.toFixed(1))
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Helper function to check if a user is a stylist by looking at their role in profiles
  const isStylist = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error || !data) return false;
      return data.role === 'stylist';
    } catch (error) {
      console.error('Error checking stylist role:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    bookings,
    services,
    stylists,
    loading,
    fetchData,
    statsData,
    setBookings,
    setServices,
    setStylists
  };
};
