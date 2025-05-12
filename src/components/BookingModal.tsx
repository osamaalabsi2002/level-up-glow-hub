
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stylistName?: string;
}

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

const BookingModal = ({ isOpen, onClose, stylistName = "" }: BookingModalProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stylistId, setStylistId] = useState<number | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: "",
      phone: profile?.phone || "",
      date: "",
      time: "",
      service: "",
      stylist: stylistName,
    },
  });

  // Update the form when stylistName changes
  useEffect(() => {
    form.setValue("stylist", stylistName);
    // Fetch stylist ID based on name if provided
    if (stylistName) {
      fetchStylistId(stylistName);
    }
  }, [stylistName, form]);

  // Fetch stylist ID by name
  const fetchStylistId = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('stylists')
        .select('id')
        .eq('name', name)
        .single();
      
      if (error) throw error;
      if (data) setStylistId(data.id);
    } catch (error) {
      console.error('Error fetching stylist ID:', error);
    }
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

      // For guest bookings (not logged in), we'll store their info but can't link to auth.users
      const bookingData = {
        client_id: profile?.id || null,
        stylist_id: finalStylistId,
        service_id: serviceData?.id || null,
        date: data.date,
        time: data.time,
        status: 'pending',
        // Store guest info in metadata if not logged in
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone
      };
      
      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);
      
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

  // Services offered by the salon
  const [services, setServices] = useState([
    { id: "haircut", label: "Haircut & Styling" },
    { id: "color", label: "Color Services" },
    { id: "treatment", label: "Hair Treatments" },
    { id: "makeup", label: "Makeup Application" },
  ]);

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

  // Available time slots
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-salon-green text-xl">
            {stylistName ? `Book with ${stylistName}` : "Book an Appointment"}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to book your appointment. We'll contact you to confirm the details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="your.email@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="(123) 456-7890" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-salon-green"
                        {...field}
                      >
                        <option value="" disabled>Select a time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-salon-green"
                      {...field}
                    >
                      <option value="" disabled>Select a service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>{service.label}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
