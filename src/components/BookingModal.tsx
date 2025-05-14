
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

interface Service {
  id: string;
  label: string;
}

const BookingModal = ({ isOpen, onClose, stylistName = "" }: BookingModalProps) => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stylistId, setStylistId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
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
    
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

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

  // Check available time slots when date changes
  const checkAvailableTimeSlots = async (date: string, stylistIdToCheck: number | null) => {
    if (!date || !stylistIdToCheck) {
      // If no date or stylist, all slots are available
      return setTimeSlots(getDefaultTimeSlots());
    }

    try {
      // Fetch bookings for this stylist on this date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('time, status')
        .eq('stylist_id', stylistIdToCheck)
        .eq('date', date)
        .neq('status', 'canceled');
      
      if (error) throw error;

      // Default time slots (all available)
      const slots = getDefaultTimeSlots();
      
      // Mark booked slots as unavailable
      if (bookings && bookings.length > 0) {
        return setTimeSlots(slots.map(slot => {
          const isBooked = bookings.some(booking => booking.time === slot.value);
          return { ...slot, available: !isBooked };
        }));
      }

      return setTimeSlots(slots);
    } catch (error) {
      console.error('Error checking time slots:', error);
      // In case of error, return default slots
      return setTimeSlots(getDefaultTimeSlots());
    }
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    form.setValue("date", newDate);
    setSelectedDate(newDate);
    checkAvailableTimeSlots(newDate, stylistId);
  };

  // Default time slots
  const getDefaultTimeSlots = (): TimeSlot[] => [
    { value: "09:00 AM", label: "09:00 AM", available: true },
    { value: "10:00 AM", label: "10:00 AM", available: true },
    { value: "11:00 AM", label: "11:00 AM", available: true },
    { value: "12:00 PM", label: "12:00 PM", available: true },
    { value: "01:00 PM", label: "01:00 PM", available: true },
    { value: "02:00 PM", label: "02:00 PM", available: true },
    { value: "03:00 PM", label: "03:00 PM", available: true },
    { value: "04:00 PM", label: "04:00 PM", available: true },
    { value: "05:00 PM", label: "05:00 PM", available: true }
  ];

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
        status: 'pending',
        // For guest bookings or additional info
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
            {user ? (
              <Alert className="bg-blue-50 text-blue-800 border border-blue-200">
                <AlertDescription className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span>
                    Booking as <strong>{profile?.full_name || user.email}</strong>
                  </span>
                </AlertDescription>
              </Alert>
            ) : (
              <>
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
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field: { value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={value}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleDateChange(e)}
                        {...fieldProps} 
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
                        disabled={!selectedDate}
                        {...field}
                      >
                        <option value="" disabled>Select a time</option>
                        {timeSlots.map(slot => (
                          <option 
                            key={slot.value} 
                            value={slot.value}
                            disabled={!slot.available}
                            className={!slot.available ? "text-red-500" : ""}
                          >
                            {slot.label} {!slot.available && "(Booked)"}
                          </option>
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
