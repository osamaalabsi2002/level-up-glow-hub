
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types/dashboard";
import { bookingFormSchema, BookingFormValues } from "@/schemas/bookingSchema";
import { useBookingForm } from "@/hooks/useBookingForm";

// Component imports
import UserInfoFields from "./UserInfoFields";
import DateSelector from "./DateSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import ServiceSelector from "./ServiceSelector";
import StylistField from "./StylistField";

interface BookingFormProps {
  onClose: () => void;
  stylistName?: string;
  selectedServiceId?: string;
  user: any | null;
  profile: UserProfile | null;
}

const BookingForm = ({ onClose, stylistName = "", selectedServiceId = "", user, profile }: BookingFormProps) => {
  const navigate = useNavigate();
  
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

  // Use our custom hook to manage form state and logic
  const {
    loading,
    services,
    stylistId,
    selectedDate,
    eligibleStylists,
    handleDateChange,
    handleStylistSelect,
    handleSubmit
  } = useBookingForm(form, user, stylistName, selectedServiceId);

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

  const onSubmit = async (data: BookingFormValues) => {
    const success = await handleSubmit(data);
    if (success) {
      onClose();
      form.reset();
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
