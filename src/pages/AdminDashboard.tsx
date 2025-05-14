import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Stylist } from "@/types/dashboard";
import DashboardStats from "@/components/dashboard/DashboardStats";
import BookingsTab from "@/components/dashboard/BookingsTab";
import StylistsTab from "@/components/dashboard/StylistsTab";
import ServicesTab from "@/components/dashboard/ServicesTab";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useBookingOperations } from "@/hooks/useBookingOperations";
import { useServiceOperations } from "@/hooks/useServiceOperations";
import { useStylistOperations } from "@/hooks/useStylistOperations";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const { 
    bookings, 
    services, 
    stylists, 
    loading, 
    statsData,
    setStylists
  } = useDashboardData();

  const {
    localBookings,
    handleDeleteBooking,
    handleConfirmBooking
  } = useBookingOperations(bookings);

  const {
    localServices,
    handleAddService,
    handleEditService,
    handleDeleteService
  } = useServiceOperations(services);

  useEffect(() => {
    // Redirect if not admin
    if (profile && profile.role !== 'admin') {
      toast.error("You don't have permission to access this page");
      navigate('/');
    }
  }, [profile, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <DashboardHeader 
            title="لوحة تحكم المدير" 
            subtitle="إدارة المواعيد والمصممين والخدمات" 
          />
          
          <DashboardStats
            bookingsCount={statsData.bookingsCount}
            stylistsCount={statsData.stylistsCount}
            todayBookingsCount={statsData.todayBookingsCount}
            averageRating={statsData.averageRating}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="bookings" className="flex-1">المواعيد</TabsTrigger>
              <TabsTrigger value="stylists" className="flex-1">المصممين</TabsTrigger>
              <TabsTrigger value="services" className="flex-1">الخدمات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings">
              <BookingsTab 
                bookings={localBookings}
                onConfirmBooking={handleConfirmBooking}
                onDeleteBooking={handleDeleteBooking}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="stylists">
              <StylistsTab 
                stylists={stylists}
                onAddStaff={(stylist) => {
                  // This function is now handled within StylistsTab
                  // using the useStylistOperations hook
                }}
                onEditStaff={(stylist) => {
                  // This function is now handled within StylistsTab
                  // using the useStylistOperations hook
                }}
              />
            </TabsContent>
            
            <TabsContent value="services">
              <ServicesTab 
                services={localServices}
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
