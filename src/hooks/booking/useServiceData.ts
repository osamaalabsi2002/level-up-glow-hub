
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Service } from "@/schemas/bookingSchema";

export const useServiceData = (selectedServiceId = "") => {
  const [services, setServices] = useState<Service[]>([]);

  // Fetch services from Supabase
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log("Fetching services...");
      const { data, error } = await supabase
        .from('services')
        .select('id, name');
      
      if (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description: "Failed to load services",
          variant: "destructive"
        });
        throw error;
      }
      
      if (data && data.length > 0) {
        const formattedServices = data.map(service => ({
          id: service.name,
          label: service.name
        }));
        console.log("Services fetched:", formattedServices);
        setServices(formattedServices);
      } else {
        console.log("No services found");
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  return { 
    services 
  };
};
