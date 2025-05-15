
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useBookingForm = (
  form: UseFormReturn<any>,
  user: any | null,
  stylistName = "",
  selectedServiceId = ""
) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stylistId, setStylistId] = useState<number | null>(null);
  const [services, setServices] = useState<{id: string; label: string}[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [eligibleStylists, setEligibleStylists] = useState<number[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, authentication will be required to complete booking");
    }
  }, [user, navigate]);

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log("Fetching services...");
        const { data, error } = await supabase
          .from('services')
          .select('id, name');
        
        if (error) {
          console.error("Error fetching services:", error);
          toast({
            title: "Error",
            description: "Failed to load services",
            variant: "destructive"
          });
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedServices = data.map(service => ({
            id: service.name,
            label: service.name
          }));
          console.log("Services fetched:", formattedServices);
          setServices(formattedServices);
        } else {
          console.log("No services found");
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    
    fetchServices();
  }, []);

  // Update form with stylist data when stylistName changes
  useEffect(() => {
    form.setValue("stylist", stylistName);
    // Fetch stylist ID based on name if provided
    if (stylistName) {
      fetchStylistId(stylistName);
    }
    
    if (selectedServiceId) {
      form.setValue("services", [selectedServiceId]);
    }
  }, [stylistName, selectedServiceId, form]);

  // Fetch stylists who can perform the selected services
  useEffect(() => {
    const selectedServices = form.getValues("services");
    if (selectedServices && selectedServices.length > 0) {
      fetchEligibleStylists(selectedServices);
    } else {
      setEligibleStylists([]);
    }
  }, [form.watch("services")]);

  // Fetch stylist ID by name
  const fetchStylistId = async (name: string) => {
    try {
      console.log("Fetching stylist ID for:", name);
      const { data, error } = await supabase
        .from('stylists')
        .select('id')
        .eq('name', name)
        .single();
      
      if (error) {
        console.error("Error fetching stylist ID:", error);
        throw error;
      }
      
      if (data) {
        console.log("Stylist ID found:", data.id);
        setStylistId(data.id);
      } else {
        console.log("No stylist found with name:", name);
      }
    } catch (error) {
      console.error('Error fetching stylist ID:', error);
    }
  };

  // Fetch eligible stylists based on services
  const fetchEligibleStylists = async (serviceNames: string[]) => {
    try {
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .in('name', serviceNames);
      
      if (serviceError) {
        console.error("Error fetching service IDs:", serviceError);
        return;
      }
      
      if (!serviceData || serviceData.length === 0) {
        return;
      }
      
      const serviceIds = serviceData.map(service => service.id);
      
      // For simplicity, currently assuming all stylists can perform all services
      // In a real application, you would query stylist_services or similar table
      const { data: stylistsData, error: stylistsError } = await supabase
        .from('stylists')
        .select('id')
        .eq('available', true);
      
      if (stylistsError) {
        console.error("Error fetching eligible stylists:", stylistsError);
        return;
      }
      
      if (stylistsData) {
        const stylistIds = stylistsData.map(stylist => stylist.id);
        setEligibleStylists(stylistIds);
      }
    } catch (error) {
      console.error("Error fetching eligible stylists:", error);
    }
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    console.log("Date changed to:", newDate);
    form.setValue("date", newDate);
    setSelectedDate(newDate);
    
    // Reset time when date changes
    form.setValue("time", "");
  };

  // Handle stylist selection from StylistField
  const handleStylistSelect = (id: number | null) => {
    console.log("Stylist selected with ID:", id);
    setStylistId(id);
    
    // Reset date and time when stylist changes
    form.setValue("date", "");
    form.setValue("time", "");
    setSelectedDate("");
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to log in to book an appointment",
        variant: "destructive"
      });
      navigate('/login');
      return false;
    }
    
    try {
      setLoading(true);
      console.log("Submitting booking form with data:", data);
      
      // Get service ID based on selected services
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id, name, duration')
        .in('name', data.services);
      
      if (serviceError && serviceError.code !== 'PGRST116') {
        console.error("Error fetching service data:", serviceError);
        throw serviceError;
      }
      
      if (!serviceData || serviceData.length === 0) {
        throw new Error("Selected services not found");
      }
      
      // Calculate total duration
      const totalDuration = serviceData.reduce((sum, service) => sum + service.duration, 0);
      
      // If stylistName not provided, try to find stylist by the entered name
      let finalStylistId = stylistId;
      if (!finalStylistId && data.stylist) {
        console.log("Looking up stylist by name:", data.stylist);
        const { data: stylistData } = await supabase
          .from('stylists')
          .select('id')
          .eq('name', data.stylist)
          .maybeSingle();
        
        if (stylistData) {
          console.log("Found stylist ID:", stylistData.id);
          finalStylistId = stylistData.id;
        } else {
          console.log("No stylist found with name:", data.stylist);
        }
      }

      // Store client info in the booking
      const bookingData = {
        client_id: user.id,
        stylist_id: finalStylistId,
        service_id: serviceData[0]?.id || null, // Primary service
        date: data.date,
        time: data.time,
        duration: totalDuration,
        status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'canceled',
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone,
        notes: `Additional services: ${data.services.slice(1).join(', ')}`, // Store additional services in notes
      };
      
      console.log("Booking data to insert:", bookingData);
      
      const { error } = await supabase
        .from('bookings')
        .insert(bookingData);
      
      if (error) {
        console.error("Error inserting booking:", error);
        toast({
          title: "Booking failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      console.log("Booking successful!");
      toast({
        title: "Booking successful!",
        description: "We'll contact you shortly to confirm your appointment.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    services,
    stylistId,
    selectedDate,
    eligibleStylists,
    handleDateChange,
    handleStylistSelect,
    handleSubmit
  };
};
