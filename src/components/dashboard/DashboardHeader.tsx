
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-serif font-bold text-salon-green mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      
      <div className="mt-4 md:mt-0 flex space-x-2 rtl:space-x-reverse">
        <Button 
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-1" />
          تسجيل الخروج
        </Button>
        
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
