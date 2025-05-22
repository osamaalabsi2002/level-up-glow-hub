
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";
import { Service } from "@/types/dashboard";
import ServiceFormModal from "./ServiceFormModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServicesTabProps {
  services: Service[];
  onAddService: (service: Partial<Service>) => void;
  onEditService: (service: Service) => void;
  onDeleteService: (id: number) => void;
  loading: boolean;
}

const ServicesTab = ({ 
  services, 
  onAddService, 
  onEditService, 
  onDeleteService, 
  loading 
}: ServicesTabProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };
  
  const handleEditClick = (service: Service) => {
    setEditingService(service);
  };
  
  // Function to handle adding a service to the database
  const handleAddServiceToDb = async (service: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration
        })
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Call the parent component's onAddService with the returned service
        onAddService(data[0]);
        toast.success("تمت إضافة الخدمة بنجاح");
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("حدث خطأ أثناء إضافة الخدمة");
    }
  };
  
  // Function to handle editing a service in the database
  const handleEditServiceInDb = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          updated_at: new Date().toISOString()
        })
        .eq('id', service.id);
      
      if (error) throw error;
      
      // Call the parent component's onEditService
      onEditService(service);
      toast.success("تم تحديث الخدمة بنجاح");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("حدث خطأ أثناء تحديث الخدمة");
    }
  };
  
  // Function to handle deleting a service from the database
  const handleDeleteServiceFromDb = async (id: number) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Call the parent component's onDeleteService
      onDeleteService(id);
      toast.success("تم حذف الخدمة بنجاح");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("حدث خطأ أثناء حذف الخدمة");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>إدارة الخدمات</CardTitle>
          <Button 
            className="bg-salon-green hover:bg-salon-darkGreen text-white"
            onClick={handleAddClick}
          >
            <Plus className="h-4 w-4 mr-1" />
            إضافة خدمة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <p>Loading services...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد خدمات مضافة. قم بإضافة خدمة جديدة.
              </div>
            ) : (
              services.map((service) => (
                <div key={service.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{service.price} ريال</p>
                      <p className="text-sm text-gray-500">{service.duration} دقيقة</p>
                    </div>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditClick(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteServiceFromDb(service.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
      
      {/* Add Service Modal */}
      <ServiceFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddServiceToDb} 
      />
      
      {/* Edit Service Modal */}
      {editingService && (
        <ServiceFormModal 
          isOpen={!!editingService} 
          onClose={() => setEditingService(undefined)} 
          onSave={(service) => {
            handleEditServiceInDb({...editingService, ...service} as Service);
          }} 
          editService={editingService}
        />
      )}
    </Card>
  );
};

export default ServicesTab;
