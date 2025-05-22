
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import BookingForm from "@/components/booking/BookingForm";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stylistName?: string;
  serviceId?: string;
  stylistId?: number;
}

const BookingModal = ({ 
  isOpen, 
  onClose, 
  stylistName = "", 
  serviceId = "",
  stylistId
}: BookingModalProps) => {
  const { profile, user } = useAuth();

  const handleClose = () => {
    // Reset form state when closing
    onClose();
  };

  // Create personalized title based on user and selected service/stylist
  const getModalTitle = () => {
    if (user && profile?.full_name) {
      return stylistName 
        ? `${profile.full_name}, book with ${stylistName}` 
        : serviceId 
          ? `${profile.full_name}, book a service` 
          : `${profile.full_name}, book an appointment`;
    } else {
      return stylistName 
        ? `Book with ${stylistName}` 
        : serviceId 
          ? "Book a Service" 
          : "Book an Appointment";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-salon-green text-xl">
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {user 
              ? "Fill out the form below to book your appointment. We'll contact you to confirm the details."
              : "Please sign in or create an account to book an appointment."}
          </DialogDescription>
        </DialogHeader>

        <BookingForm 
          onClose={handleClose} 
          stylistName={stylistName} 
          user={user} 
          profile={profile}
          selectedServiceId={serviceId}
          stylistId={stylistId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
