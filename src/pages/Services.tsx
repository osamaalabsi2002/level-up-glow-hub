
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Clock, Sparkles, SprayCan, Brush } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/dashboard";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  // Function to get an icon based on service name
  const getServiceIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("cut") || nameLower.includes("hair")) return Scissors;
    if (nameLower.includes("color") || nameLower.includes("dye")) return SprayCan;
    if (nameLower.includes("treatment") || nameLower.includes("therapy")) return Sparkles;
    if (nameLower.includes("makeup")) return Brush;
    return Clock; // Default icon
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select('*');
          
        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleBookingClick = (serviceId: string) => {
    if (!user) {
      // Show a toast notification
      toast("Authentication required", {
        description: "Please sign in or create an account to book an appointment."
      });
      
      // Redirect to login
      navigate('/login');
      return;
    }
    
    setSelectedService(serviceId);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-salon-green mb-4">Our Services</h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive range of beauty and hair services designed to enhance your natural 
              beauty and leave you feeling refreshed and confident.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p>Loading services...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {services.length > 0 ? (
                services.map((service) => {
                  const ServiceIcon = getServiceIcon(service.name);
                  return (
                    <Card key={service.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <ServiceIcon className="h-8 w-8 text-gold" />
                          <span className="font-bold text-lg text-salon-green">${service.price}</span>
                        </div>
                        <CardTitle className="text-xl font-semibold mt-2">{service.name}</CardTitle>
                        <CardDescription className="text-gray-600">{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{service.duration} minutes</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-salon-green hover:bg-salon-darkGreen"
                          onClick={() => handleBookingClick(service.id.toString())}
                          type="button"
                        >
                          Book Now
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p>No services found. Please check back later.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="text-center bg-salon-green/5 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-salon-green mb-4">Custom Services</h2>
            <p className="text-gray-600 mb-6">
              Don't see exactly what you're looking for? Our stylists can create custom service 
              packages tailored to your specific needs.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                className="bg-salon-green hover:bg-salon-darkGreen"
                onClick={() => handleBookingClick("")}
                type="button"
              >
                <Clock className="mr-2 h-4 w-4" /> Schedule Consultation
              </Button>
              <Button variant="outline" className="border-gold text-salon-green">
                View Price List
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={bookingModalOpen} 
        onClose={() => setBookingModalOpen(false)}
        serviceId={selectedService}
      />
    </div>
  );
};

export default Services;
