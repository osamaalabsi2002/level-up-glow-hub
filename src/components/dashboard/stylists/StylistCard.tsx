
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Star, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Stylist } from "@/types/dashboard";

interface StylistCardProps {
  stylist: Stylist;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

const StylistCard = ({ stylist, onEdit, onDelete, isLoading }: StylistCardProps) => {
  const navigate = useNavigate();

  return (
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
            
            <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(stylist.id)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-1" />
                تعديل
              </Button>
              <Button 
                variant="outline"
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete(stylist.id)}
                disabled={isLoading}
              >
                <Trash className="h-4 w-4 mr-1" />
                حذف
              </Button>
              <Button 
                size="sm" 
                className="bg-salon-green hover:bg-salon-darkGreen text-white"
                onClick={() => navigate(`/stylist/${stylist.id}`)}
              >
                عرض الجدول
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StylistCard;
