
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import BookingForm from "@/components/booking/BookingForm";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stylistName?: string;
  serviceId?: string;
}

const BookingModal = ({ isOpen, onClose, stylistName = "", serviceId = "" }: BookingModalProps) => {
  const { profile, user } = useAuth();

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

        <BookingForm 
          onClose={onClose} 
          stylistName={stylistName} 
          user={user} 
          profile={profile}
          selectedServiceId={serviceId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
