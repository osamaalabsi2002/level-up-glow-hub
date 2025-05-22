
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stylist } from "@/types/dashboard";
import AvailabilityModal from "./AvailabilityModal";
import StylistInfoSection from "./card/StylistInfoSection";
import StylistServicesSection from "./card/StylistServicesSection";
import StylistActionButtons from "./card/StylistActionButtons";

interface StylistCardProps {
  stylist: Stylist;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

const StylistCard = ({ stylist, onEdit, onDelete, isLoading }: StylistCardProps) => {
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  return (
    <>
      <Card key={stylist.id} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            <div className="w-1/3">
              <img 
                src={stylist.image} 
                alt={stylist.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="w-2/3 p-6">
              <StylistInfoSection stylist={stylist} />
              
              {/* Services section */}
              <StylistServicesSection stylistId={stylist.id} />
              
              <StylistActionButtons 
                stylistId={stylist.id}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageAvailability={() => setIsAvailabilityModalOpen(true)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <AvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        stylistId={stylist.id}
        stylistName={stylist.name}
      />
    </>
  );
};

export default StylistCard;
