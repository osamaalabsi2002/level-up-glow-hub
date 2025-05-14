import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle, Mail, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Types for our appointments
interface Appointment {
  id: number;
  clientName: string;
  date: string;
  time: string;
  service: string;
  clientPhone?: string;
  clientEmail?: string;
  status?: "completed" | "canceled" | "pending" | "confirmed";
}

const StylistDashboard = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [stylistId, setStylistId] = useState<number | null>(null);
  
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not stylist
    if (profile && profile.role !== 'stylist' && profile.role !== 'admin') {
      toast.error("You don't have permission to access this page");
      navigate('/');
      return;
    }

    // Get stylist ID for the logged in user
    const getStylistId = async () => {
      if (!profile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('stylists')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setStylistId(data.id);
        }
      } catch (error) {
        console.error('Error fetching stylist ID:', error);
      }
    };
    
    getStylistId();
  }, [profile, navigate]);
  
  useEffect(() => {
    // Fetch appointments once we have stylist ID
    if (stylistId !== null) {
      fetchAppointments();
    }
  }, [stylistId]);
  
  const fetchAppointments = async () => {
    if (!stylistId) return;
    
    setLoading(true);
    try {
      // Get current date to separate upcoming and past appointments
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch bookings with client profiles
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          date,
          time,
          status,
          client_id,
          service_id,
          profiles:client_id (full_name, email, phone)
        `)
        .eq('stylist_id', stylistId);
      
      if (error) throw error;
      
      // Now fetch service names in a separate query
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, name');
      
      const servicesMap: Record<number, string> = {};
      if (servicesData) {
        servicesData.forEach((service: { id: number; name: string }) => {
          servicesMap[service.id] = service.name;
        });
      }
      
      if (data) {
        // Process and separate the bookings
        const upcoming: Appointment[] = [];
        const past: Appointment[] = [];
        
        data.forEach((booking: any) => {
          const appointmentData: Appointment = {
            id: booking.id,
            clientName: booking.profiles?.full_name || 'Guest',
            date: booking.date,
            time: booking.time,
            service: servicesMap[booking.service_id] || 'Not specified',
            clientPhone: booking.profiles?.phone,
            clientEmail: booking.profiles?.email,
            status: booking.status as any
          };
          
          if (booking.date >= today) {
            upcoming.push(appointmentData);
          } else {
            past.push(appointmentData);
          }
        });
        
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle appointment actions
  const handleConfirmAppointment = async (id: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Appointment #${id} confirmed`);
      
      // Update local state
      setUpcomingAppointments(upcomingAppointments.map(app => 
        app.id === id ? {...app, status: "confirmed" as const} : app
      ));
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Failed to confirm appointment");
    }
  };
  
  const handleCancelAppointment = async (id: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'canceled' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Appointment #${id} canceled`);
      
      // Find the appointment to move to past appointments
      const appointment = upcomingAppointments.find(app => app.id === id);
      if (appointment) {
        // Update local state
        setUpcomingAppointments(upcomingAppointments.filter(app => app.id !== id));
        setPastAppointments([...pastAppointments, {
          ...appointment,
          status: "canceled" as const
        }]);
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };
  
  // If no appointments are available and not loading, show sample data for UI testing
  useEffect(() => {
    if (!loading && upcomingAppointments.length === 0 && pastAppointments.length === 0) {
      // Sample upcoming appointments for UI testing
      setUpcomingAppointments([
        {
          id: 1,
          clientName: "سارة احمد",
          date: "2025-05-10",
          time: "10:30 AM",
          service: "قص الشعر",
          clientPhone: "+966 50 123 4567",
          clientEmail: "sara@example.com",
          status: "confirmed"
        },
        {
          id: 2,
          clientName: "ليلى محمد",
          date: "2025-05-11",
          time: "2:00 PM",
          service: "صباغة الشعر",
          clientPhone: "+966 55 987 6543",
          clientEmail: "layla@example.com",
          status: "pending"
        }
      ]);
      
      // Sample past appointments
      setPastAppointments([
        {
          id: 101,
          clientName: "هند خالد",
          date: "2025-05-01",
          time: "9:00 AM",
          service: "قص الشعر",
          status: "completed"
        },
        {
          id: 102,
          clientName: "منى عبدالله",
          date: "2025-05-02",
          time: "3:30 PM",
          service: "العناية بالبشرة",
          status: "completed"
        }
      ]);
    }
  }, [loading, upcomingAppointments.length, pastAppointments.length]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-salon-green mb-2">لو��ة تحكم المصمم</h1>
            <p className="text-gray-600">
              مرحبًا{profile?.full_name ? `, ${profile.full_name}` : ''}! {' '}
              {!loading && upcomingAppointments.length > 0 ? 
                `لديك ${upcomingAppointments.length} مواعيد قادمة` : 
                'ليس لديك مواعيد قادمة حاليًا'
              }
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="bg-salon-green text-white rounded-t-lg">
                <CardTitle className="text-center">المواعيد اليوم</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <p className="text-4xl font-bold text-salon-green">
                  {loading ? "..." : upcomingAppointments.filter(app => {
                    const today = new Date().toISOString().split('T')[0];
                    return app.date === today;
                  }).length}
                </p>
                <p className="text-gray-600">مواعيد</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-salon-green text-white rounded-t-lg">
                <CardTitle className="text-center">هذا الأسبوع</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <p className="text-4xl font-bold text-salon-green">
                  {loading ? "..." : upcomingAppointments.length}
                </p>
                <p className="text-gray-600">مواعيد</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-salon-green text-white rounded-t-lg">
                <CardTitle className="text-center">معدل التقييم</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <p className="text-4xl font-bold text-salon-green">4.9</p>
                <p className="text-gray-600">من 5 نجوم</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="upcoming" className="flex-1">المواعيد القادمة</TabsTrigger>
              <TabsTrigger value="past" className="flex-1">المواعيد السابقة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <p>Loading appointments...</p>
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden border-l-4 border-l-salon-green">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{appointment.clientName}</h3>
                            <p className="text-sm text-gray-600 mb-2">{appointment.service}</p>
                            
                            <div className="space-y-2 mt-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{appointment.time}</span>
                              </div>
                              {appointment.clientPhone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  <span>{appointment.clientPhone}</span>
                                </div>
                              )}
                              {appointment.clientEmail && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-4 w-4 mr-2" />
                                  <span>{appointment.clientEmail}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end space-x-2 rtl:space-x-reverse">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            إلغاء
                          </Button>
                          {appointment.status === "pending" && (
                            <Button 
                              size="sm" 
                              className="bg-salon-green hover:bg-salon-darkGreen text-white"
                              onClick={() => handleConfirmAppointment(appointment.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              تأكيد
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">ليس لديك مواعيد قادمة حاليًا</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <p>Loading appointments...</p>
                </div>
              ) : pastAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastAppointments.map((appointment) => (
                    <Card 
                      key={appointment.id} 
                      className={`overflow-hidden border-l-4 ${
                        appointment.status === "completed" ? "border-l-green-500" : "border-l-red-500"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{appointment.clientName}</h3>
                            <p className="text-sm text-gray-600 mb-2">{appointment.service}</p>
                            
                            <div className="flex items-center mt-3">
                              {appointment.status === "completed" ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  تم الإنجاز
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  تم الإلغاء
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-2 mt-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{appointment.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">ليس لديك مواعيد سابقة حاليًا</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StylistDashboard;
