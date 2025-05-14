
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddStylistCardProps {
  onClick: () => void;
  isLoading: boolean;
}

const AddStylistCard = ({ onClick, isLoading }: AddStylistCardProps) => {
  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardContent className="flex items-center justify-center p-12">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center p-8"
          onClick={onClick}
          disabled={isLoading}
        >
          <Plus className="h-8 w-8 mb-2 text-salon-green" />
          <span>إضافة مصمم جديد</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddStylistCard;
