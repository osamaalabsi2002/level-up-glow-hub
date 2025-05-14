
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-serif font-bold text-salon-green mb-2">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      
      <div className="mt-4 md:mt-0 flex space-x-2 rtl:space-x-reverse">
        <Button 
          className="bg-salon-green hover:bg-salon-darkGreen text-white"
          onClick={() => toast.success("This feature is coming soon!")}
        >
          <Plus className="h-4 w-4 mr-1" />
          إضافة موعد جديد
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
