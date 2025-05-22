
import { useState } from "react";
import { Service } from "@/types/dashboard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useServiceOperations = (initialServices: Service[]) => {
  const [localServices, setLocalServices] = useState<Service[]>(initialServices);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddService = (service: Partial<Service>) => {
    // Add the new service to state
    if (service.id) { // If returned from DB with ID
      setLocalServices([...localServices, service as Service]);
    }
    // The actual DB insertion happens in ServicesTab
  };
  
  const handleEditService = (updatedService: Service) => {
    setLocalServices(localServices.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
    // The actual DB update happens in ServicesTab
  };
  
  const handleDeleteService = (id: number) => {
    setLocalServices(localServices.filter(service => service.id !== id));
    // The actual DB deletion happens in ServicesTab
  };

  return {
    localServices,
    setLocalServices,
    isLoading,
    handleAddService,
    handleEditService,
    handleDeleteService
  };
};
