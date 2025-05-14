
import { useState, useEffect } from "react";
import { Booking, Service, Stylist } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDashboardData = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch services from Supabase
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*');
      
      if (servicesError) throw servicesError;
      setServices(servicesData || []);
      
      // Fetch stylists from Supabase
      const { data: stylistsData, error: stylistsError } = await supabase
        .from('stylists')
        .select('*');
      
      if (stylistsError) throw stylistsError;
      
      // Transform the data to match our Stylist type
      const formattedStylists: Stylist[] = (stylistsData || []).map(stylist => ({
        id: stylist.id,
        name: stylist.name,
        role: stylist.role,
        image: stylist.image,
        rating: stylist.rating,
        reviews: stylist.reviews,
        specialties: stylist.specialties,
        bio: stylist.bio || "",
        available: stylist.available,
        experience: stylist.experience,
        services: [],
        clientReviews: []
      }));
      
      setStylists(formattedStylists);
      
      // For now, bookings will remain as sample data since we haven't created a bookings table yet
      const sampleBookings: Booking[] = [
        {
          id: 1,
          clientName: "سارة احمد",
          stylistName: "Sarah Johnson",
          date: "2025-05-10",
          time: "10:30 AM",
          service: "قص الشعر",
          status: "confirmed"
        },
        {
          id: 2,
          clientName: "ليلى محمد",
          stylistName: "Michael Rodriguez",
          date: "2025-05-11",
          time: "2:00 PM",
          service: "صباغة الشعر",
          status: "pending"
        },
        {
          id: 3,
          clientName: "نورة سعيد",
          stylistName: "Jessica Chen",
          date: "2025-05-12",
          time: "11:15 AM",
          service: "تصفيف الشعر",
          status: "confirmed"
        },
        {
          id: 4,
          clientName: "هند خالد",
          stylistName: "Sarah Johnson",
          date: "2025-05-01",
          time: "9:00 AM",
          service: "قص الشعر",
          status: "completed"
        },
        {
          id: 5,
          clientName: "منى عبدالله",
          stylistName: "Jessica Chen",
          date: "2025-05-02",
          time: "3:30 PM",
          service: "العناية بالبشرة",
          status: "completed"
        },
        {
          id: 6,
          clientName: "دانة فهد",
          stylistName: "Michael Rodriguez",
          date: "2025-05-03",
          time: "1:15 PM",
          service: "المانيكير والباديكير",
          status: "canceled"
        },
      ];
      
      setBookings(sampleBookings);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics for the dashboard
  const todayBookingsCount = bookings.filter(b => b.date === "2025-05-10").length;
  const averageRating = stylists.length > 0 ? 
    stylists.reduce((total, stylist) => total + stylist.rating, 0) / stylists.length : 
    0;

  return {
    bookings,
    services,
    stylists,
    loading,
    fetchData,
    statsData: {
      bookingsCount: bookings.length,
      stylistsCount: stylists.length,
      todayBookingsCount,
      averageRating
    },
    setBookings,
    setServices,
    setStylists
  };
};
