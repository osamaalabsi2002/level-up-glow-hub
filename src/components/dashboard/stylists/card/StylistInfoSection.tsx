
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Stylist } from "@/types/dashboard";

interface StylistInfoSectionProps {
  stylist: Stylist;
}

const StylistInfoSection = ({ stylist }: StylistInfoSectionProps) => {
  return (
    <>
      <h3 className="text-lg font-semibold mb-1">{stylist.name}</h3>
      <p className="text-salon-green text-sm mb-3">{stylist.role}</p>
      
      <div className="flex items-center mb-2">
        <Star className="h-4 w-4 text-gold fill-gold" />
        <span className="ml-1 text-sm">
          {stylist.rating} ({stylist.reviews} تقييم)
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {stylist.specialties?.slice(0, 2).map((specialty) => (
          <Badge key={specialty} variant="outline" className="bg-gray-50">
            {specialty}
          </Badge>
        ))}
        {stylist.specialties && stylist.specialties.length > 2 && (
          <Badge variant="outline" className="bg-gray-50">
            +{stylist.specialties.length - 2}
          </Badge>
        )}
      </div>
      
      {/* Show if the stylist is linked to a user account */}
      {stylist.user_id && (
        <Badge className="bg-blue-100 text-blue-800 mb-3">
          Linked to User Account
        </Badge>
      )}
    </>
  );
};

export default StylistInfoSection;
