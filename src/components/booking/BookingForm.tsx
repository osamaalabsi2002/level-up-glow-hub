
import { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/dashboard";
import { useNavigate } from "react-router-dom";

import UserInfoFields from "./UserInfoFields";
import DateSelector from "./DateSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import ServiceSelector from "./ServiceSelector";
import StylistField from "./StylistField";
import { Alert, AlertDescription } from "@/components/ui/alert";

const bookingFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  date: z.string().min(1, { message: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  services: z.array(z.string()).min(1, { message: "Please select at least one service" }),
  stylist: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface Service {
  id: string;
  label: string;
}

interface BookingFormProps {
  onClose: () => void;
  stylistName?: string;
  selectedServiceId?: string;
  user: any | null;
  profile: UserProfile | null;
}

const BookingForm = ({ onClose, stylistName = "", selectedServiceId = "", user, profile }: BookingFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stylistId, setStylistId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [eligibleStylists, setEligibleStylists] = useState<number[]>([]);
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      date: "",
      time: "",
      services: selectedServiceId ? [selectedServiceId] : [],
      stylist: stylistName,
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to log in to book an appointment",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [user, navigate]);

  // Update form with user data when profile changes
  useEffect(() => {
    if (profile) {
      form.setValue("name", profile.full_name || "");
      form.setValue("phone", profile.phone || "");
    }
    if (user) {
      form.setValue("email", user.email || "");
    }
  }, [profile, user, form]);

  // Update the form when stylistName or selectedServiceId changes
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

  // Fetch stylists who can perform the selected services
  useEffect(() => {
    const selectedServices = form.getValues("services");
    if (selectedServices && selectedServices.length > 0) {
      fetchEligibleStylists(selectedServices);
    } else {
      setEligibleStylists([]);
    }
  }, [form.watch("services")]);

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

  const handleSubmit = async (data: BookingFormValues) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to log in to book an appointment",
        variant: "destructive"
      });
      navigate('/login');
      return;
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
      
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Alert className="bg-amber-50 border border-amber-200">
        <AlertDescription className="flex items-center justify-center">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
          <span>Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>log in</Button> to book an appointment.</span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        {/* User Information Fields */}
        <UserInfoFields form={form} user={user} profile={profile} />

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateSelector 
            form={form} 
            handleDateChange={handleDateChange} 
            stylistId={stylistId}
          />
          <TimeSlotSelector 
            form={form} 
            selectedDate={selectedDate} 
            stylistId={stylistId} 
          />
        </div>

        {/* Service Selection */}
        <ServiceSelector form={form} services={services} multiSelect={true} />

        {/* Only show stylist field if not already selected */}
        {!stylistName && (
          <StylistField 
            form={form} 
            onStylistSelect={handleStylistSelect} 
            eligibleStylistIds={eligibleStylists.length > 0 ? eligibleStylists : undefined}
          />
        )}

        <div className="flex justify-end pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-salon-green hover:bg-salon-darkGreen text-white"
            disabled={loading}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {loading ? "Submitting..." : "Book Now"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingForm;
