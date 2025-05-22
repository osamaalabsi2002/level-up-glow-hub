
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StylistService {
  id: number;
  stylist_id: number;
  service_id: number;
}

export const useStylistServices = (stylistId: number | null) => {
  const [loading, setLoading] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to load existing services for a stylist
  const loadStylistServices = async (stylistId: number) => {
    if (!stylistId) {
      console.log("No stylist ID provided to loadStylistServices");
      return [];
    }
    
    try {
      console.log(`Loading services for stylist ID: ${stylistId}`);
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('stylist_services')
        .select('service_id')
        .eq('stylist_id', stylistId);

      if (error) {
        console.error('Error loading stylist services:', error);
        setError(error.message);
        throw error;
      }

      const serviceIds = data?.map(item => item.service_id) || [];
      console.log('Loaded stylist services:', serviceIds);
      setSelectedServiceIds(serviceIds);
      return serviceIds;
    } catch (error: any) {
      console.error('Error in loadStylistServices:', error);
      setError(error.message || 'Failed to load stylist services');
      toast.error('Failed to load stylist services');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to update services for a stylist
  const updateStylistServices = async (stylistId: number, serviceIds: number[]) => {
    if (!stylistId) {
      console.error("No stylist ID provided to updateStylistServices");
      toast.error("Cannot update services without stylist ID");
      return false;
    }
    
    try {
      console.log(`Updating services for stylist ID: ${stylistId}`, serviceIds);
      setLoading(true);
      setError(null);
      
      // First, delete all existing associations for this stylist
      const { error: deleteError } = await supabase
        .from('stylist_services')
        .delete()
        .eq('stylist_id', stylistId);

      if (deleteError) {
        console.error('Error deleting stylist services:', deleteError);
        setError(deleteError.message);
        throw deleteError;
      }

      // If there are services to add, insert them
      if (serviceIds.length > 0) {
        const servicesToInsert = serviceIds.map(serviceId => ({
          stylist_id: stylistId,
          service_id: serviceId
        }));

        console.log('Inserting stylist services:', servicesToInsert);
        
        const { error: insertError } = await supabase
          .from('stylist_services')
          .insert(servicesToInsert);

        if (insertError) {
          console.error('Error inserting stylist services:', insertError);
          setError(insertError.message);
          throw insertError;
        }
      }

      setSelectedServiceIds(serviceIds);
      toast.success('Stylist services updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error in updateStylistServices:', error);
      setError(error.message || 'Failed to update stylist services');
      toast.error('Failed to update stylist services');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize selected services when stylistId changes
  useEffect(() => {
    if (stylistId) {
      console.log(`StylistId changed to ${stylistId}, loading services...`);
      loadStylistServices(stylistId);
    } else {
      // Reset selected services when no stylist is selected
      console.log('No stylist ID, resetting selected services');
      setSelectedServiceIds([]);
      setError(null);
    }
  }, [stylistId]);

  return {
    loading,
    selectedServiceIds,
    setSelectedServiceIds,
    loadStylistServices,
    updateStylistServices,
    error
  };
};
