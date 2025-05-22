
import { Button } from "@/components/ui/button";
import { Edit, Trash, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StylistActionButtonsProps {
  stylistId: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onManageAvailability: () => void;
  isLoading: boolean;
}

const StylistActionButtons = ({
  stylistId,
  onEdit,
  onDelete,
  onManageAvailability,
  isLoading
}: StylistActionButtonsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-wrap justify-end gap-2 mt-3">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onEdit(stylistId)}
        disabled={isLoading}
      >
        <Edit className="h-4 w-4 mr-1" />
        تعديل
      </Button>
      <Button 
        variant="outline"
        size="sm" 
        className="text-red-600 hover:text-red-700"
        onClick={() => onDelete(stylistId)}
        disabled={isLoading}
      >
        <Trash className="h-4 w-4 mr-1" />
        حذف
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 hover:text-blue-700"
        onClick={onManageAvailability}
        disabled={isLoading}
      >
        <Calendar className="h-4 w-4 mr-1" />
        Availability
      </Button>
      <Button 
        size="sm" 
        className="bg-salon-green hover:bg-salon-darkGreen text-white"
        onClick={() => navigate(`/stylist/${stylistId}`)}
      >
        عرض الجدول
      </Button>
    </div>
  );
};

export default StylistActionButtons;
