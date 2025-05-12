import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Booking, Service, Stylist } from "@/types/dashboard";
import DashboardStats from "@/components/dashboard/DashboardStats";
import BookingsTab from "@/components/dashboard/BookingsTab";
import StylistsTab from "@/components/dashboard/StylistsTab";
import ServicesTab from "@/components/dashboard/ServicesTab";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [activeTab, setActiveTab] = useState("bookings");
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not admin
    if (profile && profile.role !== 'admin') {
      toast.error("You don't have permission to access this page");
      navigate('/');
      return;
    }

    // Fetch data
    fetchData();
  }, [profile, navigate]);

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
  
  // Functions for CRUD operations
  const handleDeleteBooking = (id: number) => {
    toast.success(`Booking #${id} deleted successfully`);
    setBookings(bookings.filter(booking => booking.id !== id));
  };
  
  const handleConfirmBooking = (id: number) => {
    toast.success(`Booking #${id} confirmed successfully`);
    setBookings(bookings.map(booking => 
      booking.id === id ? {...booking, status: "confirmed" as const} : booking
    ));
  };
  
  const handleAddService = (service: Partial<Service>) => {
    // Add the new service to state
    if (service.id) { // If returned from DB with ID
      setServices([...services, service as Service]);
    }
    // The actual DB insertion happens in ServicesTab
  };
  
  const handleEditService = (updatedService: Service) => {
    setServices(services.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
    // The actual DB update happens in ServicesTab
  };
  
  const handleDeleteService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
    // The actual DB deletion happens in ServicesTab
  };
  
  const handleAddStylist = async (stylist: Partial<Stylist>) => {
    try {
      // Insert the new stylist into Supabase
      const { data, error } = await supabase
        .from('stylists')
        .insert({
          name: stylist.name || "",
          role: stylist.role || "",
          image: stylist.image || "",
          bio: stylist.bio || "",
          specialties: stylist.specialties || [],
          rating: stylist.rating || 5.0,
          reviews: stylist.reviews || 0,
          available: stylist.available !== undefined ? stylist.available : true,
          experience: stylist.experience || 1
        })
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Format the returned data
        const newStylist: Stylist = {
          id: data[0].id,
          name: data[0].name,
          role: data[0].role,
          image: data[0].image,
          rating: data[0].rating,
          reviews: data[0].reviews,
          specialties: data[0].specialties,
          bio: data[0].bio || "",
          available: data[0].available,
          experience: data[0].experience,
          services: [],
          clientReviews: []
        };
        
        // Add the new stylist to state
        setStylists([...stylists, newStylist]);
        toast.success("تمت إضافة المصمم بنجاح");
      }
    } catch (error) {
      console.error("Error adding stylist:", error);
      toast.error("حدث خطأ أثناء إضافة المصمم");
    }
  };
  
  const handleEditStylist = async (updatedStylist: Stylist) => {
    try {
      // Update the stylist in Supabase
      const { error } = await supabase
        .from('stylists')
        .update({
          name: updatedStylist.name,
          role: updatedStylist.role,
          image: updatedStylist.image,
          bio: updatedStylist.bio,
          specialties: updatedStylist.specialties,
          rating: updatedStylist.rating,
          reviews: updatedStylist.reviews,
          available: updatedStylist.available,
          experience: updatedStylist.experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedStylist.id);
      
      if (error) throw error;
      
      // Update the stylist in state
      setStylists(stylists.map(stylist => 
        stylist.id === updatedStylist.id ? updatedStylist : stylist
      ));
      toast.success("تم تحديث بيانات المصمم بنجاح");
    } catch (error) {
      console.error("Error updating stylist:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات المصمم");
    }
  };

  // Calculate statistics for the dashboard
  const todayBookingsCount = bookings.filter(b => b.date === "2025-05-10").length;
  const averageRating = stylists.length > 0 ? 
    stylists.reduce((total, stylist) => total + stylist.rating, 0) / stylists.length : 
    0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-salon-green mb-2">لوحة تحكم المدير</h1>
              <p className="text-gray-600">إدارة المواعيد والمصممين والخدمات</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2 rtl:space-x-reverse">
              <Button 
                className="bg-salon-green hover:bg-salon-darkGreen text-white"
                onClick={() => toast.success("This feature is coming soon!")}
              >
                <Plus className="h-4 w-4 mr-1" />
                إضافة موعد جديد
              </Button>
            </div>
          </header>
          
          <DashboardStats
            bookingsCount={bookings.length}
            stylistsCount={stylists.length}
            todayBookingsCount={todayBookingsCount}
            averageRating={averageRating}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="bookings" className="flex-1">المواعيد</TabsTrigger>
              <TabsTrigger value="stylists" className="flex-1">المصممين</TabsTrigger>
              <TabsTrigger value="services" className="flex-1">الخدمات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings">
              <BookingsTab 
                bookings={bookings}
                onConfirmBooking={handleConfirmBooking}
                onDeleteBooking={handleDeleteBooking}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="stylists">
              <StylistsTab 
                stylists={stylists}
                onAddStaff={handleAddStylist}
                onEditStaff={handleEditStylist}
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
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
