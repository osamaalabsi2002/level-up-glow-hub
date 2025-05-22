import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types/dashboard";
import { bookingFormSchema, BookingFormValues } from "@/schemas/bookingSchema";
import { useBookingForm } from "@/hooks/useBookingForm";
import { useServiceDuration } from "@/hooks/booking/useServiceDuration";

// Component imports
import UserInfoFields from "./UserInfoFields";
import DateSelector from "./DateSelector";
import TimelineSelector from "./TimelineSelector";
import ServiceSelector from "./ServiceSelector";
import StylistField from "./StylistField";
import ServiceDurationDisplay from "./ServiceDurationDisplay";
import BookingFormActions from "./BookingFormActions";
import BookingAuthPrompt from "./BookingAuthPrompt";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BookingFormProps {
  onClose: () => void;
  stylistName?: string;
  selectedServiceId?: string;
  user: { id: string; email?: string } | null;
  profile: UserProfile | null;
  stylistId?: number;
}

const BookingForm = ({ onClose, stylistName = "", selectedServiceId = "", user, profile, stylistId }: BookingFormProps) => {
  const navigate = useNavigate();
  
  console.log("BookingForm initialized with:", {
    stylistName,
    selectedServiceId,
    stylistId,
    user: user?.id,
    profile: profile ? { name: profile.full_name, phone: profile.phone } : null
  });
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      date: "",
      time: "",
      services: selectedServiceId ? [selectedServiceId] : [],
      stylist: stylistName || "",
      stylistId: stylistId || undefined,
    },
    mode: "onChange" // Enable validation as fields change
  });

  // Get service duration using the hook
  const { serviceDuration } = useServiceDuration(form);

  // Use our custom hook to manage form state and logic
  const {
    loading,
    stylistsLoading,
    servicesLoading,
    services,
    stylistId: formStylistId,
    selectedDate,
    eligibleStylists,
    handleDateChange,
    handleStylistSelect,
    handleServiceSelection,
    handleSubmit
  } = useBookingForm(form, user, stylistName, selectedServiceId, stylistId);

  // Update form with user data when profile changes
  useEffect(() => {
    if (profile) {
      console.log("Setting profile data in form:", profile.full_name, profile.phone);
      form.setValue("name", profile.full_name || "", { shouldValidate: true });
      form.setValue("phone", profile.phone || "", { shouldValidate: true });
    }
    if (user) {
      form.setValue("email", user.email || "", { shouldValidate: true });
    }
  }, [profile, user, form]);

  // Log important values for debugging
  useEffect(() => {
    console.log("BookingForm - Current state:", {
      stylistId: formStylistId,
      services: form.getValues("services"),
      eligibleStylists: eligibleStylists?.length || 0
    });
  }, [formStylistId, form, eligibleStylists]);

  const onSubmit = async (formData: BookingFormValues) => {
    console.log("Form submitted with data:", formData);
    
    try {
      // Important: Use form.getValues() instead of relying on the passed data
      const data = form.getValues();
      
      // Get current session
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult.data?.session;

      if (!session) {
        toast.error("Please sign in to book an appointment");
        return false;
      }

      const userId = session.user.id;

      // Format booking data the same way as handleSaveDraft
      const userName = data.name?.trim() || "Guest User";

      const bookingData = {
        client_id: userId,
        client_name: userName,
        client_email: data.email || session.user.email || "",
        client_phone: data.phone || "",
        stylist_id: data.stylistId || null,
        service_id: data.services?.length > 0 ? parseInt(data.services[0], 10) : null,
        date: data.date || null,
        time: data.time || null,
        status: "pending" as const,
        notes: data.notes || ""
      };

      console.log("Creating booking with data:", bookingData);

      const { data: result, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select();

      if (error) {
        console.error("Error creating booking:", error);
        toast.error("Failed to create booking");
        return false;
      }

      toast.success("Booking created successfully!", {
        description: "We'll contact you to confirm the details",
        position: "top-center"
      });

      console.log("Booking created:", result);
      form.reset();
      onClose();
      return true;
    } catch (error) {
      console.error("Unexpected error in onSubmit:", error);
      toast.error("Something went wrong while creating your booking.");
      return false;
    }
  };

  const handleSaveDraft = async () => {
  try {
    // ✅ التأكد من وجود جلسة مستخدم حقيقية
    const sessionResult = await supabase.auth.getSession();
    const session = sessionResult.data?.session;

    if (!session) {
      toast.error("Please sign in to save a draft");
      return;
    }

    const userId = session.user.id;

    // ✅ استخراج القيم من النموذج
    const data = form.getValues();

    // ⚠️ السماح بالحفظ بدون اسم
    const userName = data.name?.trim() || "Draft User";

    const bookingData = {
      client_id: userId, // ✅ تطابق RLS
      client_name: userName,
      client_email: data.email || session.user.email || "",
      client_phone: data.phone || "",
      stylist_id: data.stylistId || null,
      service_id: data.services?.length > 0 ? parseInt(data.services[0], 10) : null,
      date: data.date || null,
      time: data.time || null,
      status: "pending" as const,
      notes: data.notes || "Draft booking"
    };

    console.log("Saving draft with data:", bookingData);

    const { data: result, error } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select();

    if (error) {
      console.error("Error saving draft booking:", error);
      toast.error("Failed to save draft booking");
      return;
    }

    toast.success("Draft booking saved successfully", {
      description: "You can complete your booking later",
      position: "top-center"
    });

    console.log("Draft booking saved:", result);
    form.reset();
  } catch (error) {
    console.error("Unexpected error in handleSaveDraft:", error);
    toast.error("Something went wrong while saving draft.");
  }
};

  if (!user) {
    return <BookingAuthPrompt navigate={navigate} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        {/* User Information Fields */}
        <UserInfoFields form={form} user={user} profile={profile} />

        {/* Service Selection */}
        <ServiceSelector 
          form={form} 
          services={services} 
          multiSelect={true} 
          isLoading={servicesLoading}
          onServiceSelect={handleServiceSelection}
        />

        {/* Service Duration Display */}
        <ServiceDurationDisplay duration={serviceDuration} />

        {/* Stylist field and mark it as required */}
        <StylistField 
          form={form} 
          onStylistSelect={handleStylistSelect}
          isLoading={stylistsLoading}
        />

        {/* Date and Time Selection - only enabled if stylist is selected */}
        <div className="grid grid-cols-1 gap-4">
          <DateSelector 
            form={form} 
            handleDateChange={handleDateChange} 
            stylistId={formStylistId}
            disabled={!formStylistId}
          />
          
          {formStylistId && selectedDate && (
            <TimelineSelector 
              form={form} 
              selectedDate={selectedDate} 
              stylistId={formStylistId} 
              serviceDuration={serviceDuration}
            />
          )}
        </div>

        {/* Form Actions (Cancel, Save Draft and Submit) */}
        <BookingFormActions 
          onClose={onClose} 
          loading={loading} 
          isValid={true}
          onSave={handleSaveDraft}
        />
      </form>
    </Form>
  );
};

export default BookingForm;
