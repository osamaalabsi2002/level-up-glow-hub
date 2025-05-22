
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

export const useServiceDuration = (form: UseFormReturn<any>) => {
  const [serviceDuration, setServiceDuration] = useState<number>(60); // Default to 60 minutes
  const selectedServices = form.watch("services");

  useEffect(() => {
    const fetchServiceDurations = async () => {
      if (!selectedServices || selectedServices.length === 0) {
        console.log("No services selected, using default duration");
        setServiceDuration(60); // Default duration
        return;
      }

      try {
        console.log("Fetching durations for services:", selectedServices);
        
        // Filter out any invalid or empty service IDs
        const validServiceIds = selectedServices.filter(id => id && id.trim() !== '');
        if (validServiceIds.length === 0) {
          console.log("No valid service IDs provided");
          setServiceDuration(60); // Default duration
          return;
        }
        
        // Convert string IDs to numbers for database query
        const numericServiceIds = validServiceIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        console.log("Using numeric service IDs:", numericServiceIds);
        
        if (numericServiceIds.length === 0) {
          console.log("No valid numeric service IDs available");
          setServiceDuration(60); // Default duration
          return;
        }
        
        // Fetch durations for selected services by their IDs
        const { data, error } = await supabase
          .from('services')
          .select('id, duration')
          .in('id', numericServiceIds);
          
        if (error) {
          console.error("Error fetching service durations:", error);
          throw error;
        }
        
        console.log("Service duration data:", data);
        
        if (data && data.length > 0) {
          // Calculate total duration
          const totalDuration = data.reduce((sum, service) => sum + (service.duration || 60), 0);
          setServiceDuration(totalDuration);
          console.log(`Total service duration: ${totalDuration} minutes`);
        } else {
          console.log("No duration data found, using default");
          setServiceDuration(60); // Default if no services found
        }
      } catch (err) {
        console.error("Error fetching service durations:", err);
        setServiceDuration(60); // Default on error
      }
    };
    
    fetchServiceDurations();
  }, [selectedServices]);

  return { serviceDuration };
};
