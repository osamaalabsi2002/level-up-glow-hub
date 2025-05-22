
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useStylistData = (stylistName = "", selectedServices: string[] = []) => {
  const [stylistId, setStylistId] = useState<number | null>(null);
  const [eligibleStylists, setEligibleStylists] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch stylist ID by name
  useEffect(() => {
    if (stylistName) {
      fetchStylistId(stylistName);
    } else {
      setStylistId(null);
    }
  }, [stylistName]);

  // Fetch stylists who can perform the selected services
  useEffect(() => {
    if (selectedServices && selectedServices.length > 0 && selectedServices.every(id => id)) {
      console.log("Fetching eligible stylists for services:", selectedServices);
      fetchEligibleStylists(selectedServices);
    } else {
      setEligibleStylists([]);
    }
  }, [selectedServices]);

  const fetchStylistId = async (name: string) => {
    try {
      setLoading(true);
      console.log("Fetching stylist ID for:", name);
      const { data, error } = await supabase
        .from('stylists')
        .select('id')
        .eq('name', name)
        .single();
      
      if (error) {
        console.error("Error fetching stylist ID:", error);
        if (error.code !== 'PGRST116') { // Not found error
          toast({
            title: "Error",
            description: "Failed to load stylist information",
            variant: "destructive"
          });
        }
        return;
      }
      
      if (data) {
        console.log("Stylist ID found:", data.id);
        setStylistId(data.id);
        
        // Also check if this stylist has any services
        const { data: services, error: servicesError } = await supabase
          .from('stylist_services')
          .select('service_id')
          .eq('stylist_id', data.id);
          
        if (servicesError) {
          console.error("Error checking stylist services:", servicesError);
        } else {
          const hasServices = services && services.length > 0;
          console.log("Stylist has services:", hasServices);
          console.log("Services:", services);
        }
      } else {
        console.log("No stylist found with name:", name);
      }
    } catch (error) {
      console.error('Error fetching stylist ID:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch eligible stylists based on services - using junction table
  const fetchEligibleStylists = async (serviceIds: string[]) => {
    try {
      setLoading(true);
      console.log("Fetching eligible stylists for services:", serviceIds);
      
      // Filter out any invalid or empty service IDs
      const validServiceIds = serviceIds.filter(id => id && id.trim() !== '');
      if (validServiceIds.length === 0) {
        console.log("No valid service IDs provided");
        setEligibleStylists([]);
        return;
      }
      
      // Convert string IDs to numbers for database query
      const numericServiceIds = validServiceIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      console.log("Using numeric service IDs:", numericServiceIds);
      
      if (numericServiceIds.length === 0) {
        console.log("No valid numeric service IDs available");
        setEligibleStylists([]);
        return;
      }
      
      // Get list of all stylists first
      const { data: allStylists, error: stylistsError } = await supabase
        .from('stylists')
        .select('id, name, available');
        
      if (stylistsError) {
        console.error("Error fetching stylists:", stylistsError);
        toast({
          title: "Error",
          description: "Failed to load stylists",
          variant: "destructive" 
        });
        return;
      }
      
      console.log("All stylists fetched:", allStylists);
      
      if (!allStylists || allStylists.length === 0) {
        console.log("No stylists found");
        setEligibleStylists([]);
        return;
      }
      
      // Find stylists who can provide all the requested services using the junction table
      const { data: stylistServicesData, error: stylistServicesError } = await supabase
        .from('stylist_services')
        .select('stylist_id, service_id')
        .in('service_id', numericServiceIds);
        
      if (stylistServicesError) {
        console.error("Error fetching stylist services:", stylistServicesError);
        return;
      }
      
      console.log("Raw stylist services data:", stylistServicesData);
      
      if (!stylistServicesData || stylistServicesData.length === 0) {
        console.log("No stylists found for these services");
        setEligibleStylists([]);
        return;
      }
      
      // Count how many services each stylist offers from our requested services
      const stylistServiceCount = new Map<number, number>();
      stylistServicesData.forEach(item => {
        const count = stylistServiceCount.get(item.stylist_id) || 0;
        stylistServiceCount.set(item.stylist_id, count + 1);
      });
      
      console.log("Stylist service count map:", Object.fromEntries(stylistServiceCount));
      
      // Find stylists who offer all requested services
      const eligibleStylistIds: number[] = [];
      stylistServiceCount.forEach((count, stylistId) => {
        if (count >= numericServiceIds.length) {
          eligibleStylistIds.push(stylistId);
        }
      });
      
      console.log("Eligible stylist IDs:", eligibleStylistIds);
      setEligibleStylists(eligibleStylistIds);
    } catch (error) {
      console.error("Error fetching eligible stylists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStylistSelect = (id: number | null) => {
    console.log("Stylist selected with ID:", id);
    setStylistId(id);
    return id;
  };

  return {
    stylistId,
    eligibleStylists,
    loading,
    handleStylistSelect
  };
};
