
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BookingsTab from "@/components/dashboard/BookingsTab";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import AvailabilityManager from "@/components/dashboard/AvailabilityManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Booking, Stylist } from "@/types/dashboard";
import { redirect } from "react-router-dom";
import { Loader2 } from "lucide-react";

const StylistDashboard = () => {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadStylistData = async () => {
      try {
        setLoading(true);
        
        // First, check if the user is a stylist
        const { data: stylistData, error: stylistError } = await supabase
          .from('stylists')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (stylistError) throw stylistError;
        
        if (!stylistData) {
          toast({
            title: "Access Denied",
            description: "You don't have stylist permissions",
            variant: "destructive"
          });
          return redirect('/');
        }
        
        setStylist(stylistData);
        
        // Fetch bookings for this stylist
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            date,
            time,
            status,
            client_name as clientName,
            services (
              name
            )
          `)
          .eq('stylist_id', stylistData.id)
          .order('date', { ascending: true })
          .order('time', { ascending: true });
          
        if (bookingsError) throw bookingsError;
        
        // Transform the data to match our Booking interface
        const formattedBookings: Booking[] = bookingsData.map(booking => ({
          id: booking.id,
          date: booking.date,
          time: booking.time,
          clientName: booking.clientName || "Unknown",
          stylistName: stylistData.name,
          service: booking.services?.name || "Unknown service",
          status: booking.status || "pending"
        }));
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error("Error loading stylist data:", error);
        toast({
          title: "Error",
          description: "Failed to load your dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadStylistData();
  }, [user]);

  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-24">
        <DashboardHeader title="Stylist Dashboard" userRole="stylist" />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-salon-green" />
          </div>
        ) : (
          <>
            {stylist ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                </TabsList>
                
                <TabsContent value="bookings" className="pt-6">
                  <BookingsTab bookings={bookings} />
                </TabsContent>
                
                <TabsContent value="availability" className="pt-6">
                  <AvailabilityManager stylistId={stylist.id} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <p>You don't have stylist permissions.</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StylistDashboard;
