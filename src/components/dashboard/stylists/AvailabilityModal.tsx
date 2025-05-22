import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AvailabilityManager from "@/components/dashboard/AvailabilityManager";
import { useEffect, useState } from "react";

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  stylistId: number;
  stylistName: string;
}

const AvailabilityModal = ({
  isOpen,
  onClose,
  stylistId,
  stylistName,
}: AvailabilityModalProps) => {
  const [mountedId, setMountedId] = useState<number | null>(null);
  
  // Ensure we only mount the AvailabilityManager when we have a valid stylist ID
  // and the modal is open to prevent unnecessary API calls
  useEffect(() => {
    if (isOpen && stylistId) {
      console.log(`AvailabilityModal open for stylist ${stylistId} (${stylistName})`);
      // Ensure stylistId is treated as a number
      setMountedId(typeof stylistId === 'string' ? parseInt(stylistId) : stylistId);
    } else {
      setMountedId(null);
    }
  }, [isOpen, stylistId, stylistName]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Manage Availability for {stylistName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {mountedId ? (
            <AvailabilityManager stylistId={mountedId} />
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-salon-green border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvailabilityModal;
