import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface BookingFormActionsProps {
  onClose: () => void;
  loading: boolean;
  isValid: boolean;
  disabled?: boolean;
  onSave?: () => void;
}

const BookingFormActions = ({ 
  onClose, 
  loading, 
  isValid,
  disabled = false,
  onSave
}: BookingFormActionsProps) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </Button>
      <div className="flex gap-2">
        {onSave && (
          <Button 
            type="button"
            variant="secondary"
            onClick={onSave}
            disabled={loading || disabled}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
        )}
        <Button 
          type="submit"
          className="bg-salon-green hover:bg-salon-green/90 text-white font-medium"
          disabled={loading || disabled}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BookingFormActions;
