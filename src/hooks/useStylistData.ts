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
      // If no services selected, make all stylists eligible
      fetchAllStylists();
    }
  }, [selectedServices]);

  const fetchAllStylists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stylists')
        .select('id')
        .eq('available', true);
        
      if (error) {
        console.error("Error fetching stylists:", error);
        toast({
          title: "Error",
          description: "Failed to load stylists",
          variant: "destructive" 
        });
        return;
      }
      
      if (data && data.length > 0) {
        const stylistIds = data.map(stylist => stylist.id);
        console.log("All available stylists:", stylistIds);
        setEligibleStylists(stylistIds);
      } else {
        setEligibleStylists([]);
      }
    } catch (error) {
      console.error("Error fetching all stylists:", error);
    } finally {
      setLoading(false);
    }
  };

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
        fetchAllStylists();
        return;
      }
      
      // Convert string IDs to numbers for database query
      const numericServiceIds = validServiceIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      console.log("Using numeric service IDs:", numericServiceIds);
      
      if (numericServiceIds.length === 0) {
        console.log("No valid numeric service IDs available");
        fetchAllStylists();
        return;
      }
      
      // Get list of all stylists first to have a fallback
      const { data: allStylists, error: stylistsError } = await supabase
        .from('stylists')
        .select('id, name, available')
        .eq('available', true);
        
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
        // Fallback: allow all stylists if we can't load the service relationships
        const allStylistIds = allStylists.map(stylist => stylist.id);
        setEligibleStylists(allStylistIds);
        return;
      }
      
      console.log("Raw stylist services data:", stylistServicesData);
      
      if (!stylistServicesData || stylistServicesData.length === 0) {
        console.log("No stylists found for these services");
        setEligibleStylists([]);
        return;
      }
      
      // Count which services each stylist offers
      const stylistServiceMap = new Map<number, Set<number>>();
      
      // Initialize the map with all available stylists
      allStylists.forEach(stylist => {
        if (stylist.available) {
          stylistServiceMap.set(stylist.id, new Set());
        }
      });
      
      // Add services to each stylist's set
      stylistServicesData.forEach(item => {
        const serviceSet = stylistServiceMap.get(item.stylist_id) || new Set();
        serviceSet.add(item.service_id);
        stylistServiceMap.set(item.stylist_id, serviceSet);
      });
      
      console.log("Stylist service map:", Object.fromEntries([...stylistServiceMap.entries()].map(([k, v]) => [k, [...v]])));
      
      // Filter to stylists who offer ALL requested services
      const eligibleStylistIds: number[] = [];
      stylistServiceMap.forEach((services, stylistId) => {
        // Consider a stylist eligible if they provide at least one of the requested services
        // This change makes it more flexible - users can book any service with any stylist
        if (services.size > 0) {
          eligibleStylistIds.push(stylistId);
        }
      });
      
      console.log("Eligible stylist IDs:", eligibleStylistIds);
      setEligibleStylists(eligibleStylistIds);
    } catch (error) {
      console.error("Error fetching eligible stylists:", error);
      fetchAllStylists(); // Fallback to all stylists
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
