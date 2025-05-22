
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Service } from "@/schemas/bookingSchema";

export const useServiceData = (selectedServiceId = "", stylistId: number | null = null) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch services - either all or filtered by stylist's services
  useEffect(() => {
    console.log("useServiceData effect triggered with stylistId:", stylistId);
    console.log("selectedServiceId:", selectedServiceId);
    
    // Always fetch all services regardless of stylist
    fetchAllServices();
  }, [stylistId, selectedServiceId]);

  const fetchAllServices = async () => {
    try {
      setLoading(true);
      console.log("Fetching all services...");
      const { data, error } = await supabase
        .from('services')
        .select('id, name, duration, price');
      
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
        // Use the actual service ID as the ID
        const formattedServices = data.map(service => ({
          id: service.id.toString(), // Convert to string for consistency
          label: service.name
        }));
        console.log("Services fetched successfully:", formattedServices);
        setServices(formattedServices);
      } else {
        console.log("No services found");
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    services,
    loading
  };
};
