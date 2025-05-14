
import { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/dashboard";

import UserInfoFields from "./UserInfoFields";
import DateSelector from "./DateSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import ServiceSelector from "./ServiceSelector";
import StylistField from "./StylistField";

const bookingFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  date: z.string().min(1, { message: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  service: z.string().min(1, { message: "Please select a service" }),
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
  user: any | null;
  profile: UserProfile | null;
}

const BookingForm = ({ onClose, stylistName = "", user, profile }: BookingFormProps) => {
  const [loading, setLoading] = useState(false);
  const [stylistId, setStylistId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      date: "",
      time: "",
      service: "",
      stylist: stylistName,
    },
  });

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

  // Update the form when stylistName changes
  useEffect(() => {
    form.setValue("stylist", stylistName);
    // Fetch stylist ID based on name if provided
    if (stylistName) {
      fetchStylistId(stylistName);
    }
  }, [stylistName, form]);

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setServices(data.map(service => ({
            id: service.name,
            label: service.name
          })));
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    
    fetchServices();
  }, []);

  // Fetch stylist ID by name
  const fetchStylistId = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('stylists')
        .select('id')
        .eq('name', name)
        .single();
      
      if (error) throw error;
      if (data) {
        setStylistId(data.id);
      }
    } catch (error) {
      console.error('Error fetching stylist ID:', error);
    }
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    form.setValue("date", newDate);
    setSelectedDate(newDate);
    
    // Reset time when date changes
    form.setValue("time", "");
  };

  const handleSubmit = async (data: BookingFormValues) => {
    try {
      setLoading(true);
      
      // Get service ID based on selection
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('name', data.service)
        .single();
      
      if (serviceError && serviceError.code !== 'PGRST116') {
        throw serviceError;
      }
      
      // If stylistName not provided, try to find stylist by the entered name
      let finalStylistId = stylistId;
      if (!finalStylistId && data.stylist) {
        const { data: stylistData } = await supabase
          .from('stylists')
          .select('id')
          .eq('name', data.stylist)
          .maybeSingle();
        
        if (stylistData) {
          finalStylistId = stylistData.id;
        }
      }

      // Store client info in the booking
      const bookingData = {
        client_id: user?.id || null,
        stylist_id: finalStylistId,
        service_id: serviceData?.id || null,
        date: data.date,
        time: data.time,
        status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'canceled',
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone
      };
      
      const { error } = await supabase
        .from('bookings')
        .insert(bookingData);
      
      if (error) throw error;
      
      toast.success("Booking successful!", {
        description: "We'll contact you shortly to confirm your appointment.",
      });
      
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        {/* User Information Fields */}
        <UserInfoFields form={form} user={user} profile={profile} />

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateSelector form={form} handleDateChange={handleDateChange} />
          <TimeSlotSelector form={form} selectedDate={selectedDate} stylistId={stylistId} />
        </div>

        {/* Service Selection */}
        <ServiceSelector form={form} services={services} />

        {/* Only show stylist field if not already selected */}
        {!stylistName && (
          <FormField
            control={form.control}
            name="stylist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Stylist (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter stylist name (if any)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
