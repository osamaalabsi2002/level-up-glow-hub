
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useStylistData = (stylistName = "", selectedServices: string[] = []) => {
  const [stylistId, setStylistId] = useState<number | null>(null);
  const [eligibleStylists, setEligibleStylists] = useState<number[]>([]);

  // Fetch stylist ID by name
  useEffect(() => {
    if (stylistName) {
      fetchStylistId(stylistName);
    }
  }, [stylistName]);

  // Fetch stylists who can perform the selected services
  useEffect(() => {
    if (selectedServices && selectedServices.length > 0) {
      fetchEligibleStylists(selectedServices);
    } else {
      setEligibleStylists([]);
    }
  }, [selectedServices]);

  const fetchStylistId = async (name: string) => {
    try {
      console.log("Fetching stylist ID for:", name);
      const { data, error } = await supabase
        .from('stylists')
        .select('id')
        .eq('name', name)
        .single();
      
      if (error) {
        console.error("Error fetching stylist ID:", error);
        throw error;
      }
      
      if (data) {
        console.log("Stylist ID found:", data.id);
        setStylistId(data.id);
      } else {
        console.log("No stylist found with name:", name);
      }
    } catch (error) {
      console.error('Error fetching stylist ID:', error);
    }
  };

  // Fetch eligible stylists based on services
  const fetchEligibleStylists = async (serviceNames: string[]) => {
    try {
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .in('name', serviceNames);
      
      if (serviceError) {
        console.error("Error fetching service IDs:", serviceError);
        return;
      }
      
      if (!serviceData || serviceData.length === 0) {
        return;
      }
      
      const serviceIds = serviceData.map(service => service.id);
      
      // For simplicity, currently assuming all stylists can perform all services
      // In a real application, you would query stylist_services or similar table
      const { data: stylistsData, error: stylistsError } = await supabase
        .from('stylists')
        .select('id')
        .eq('available', true);
      
      if (stylistsError) {
        console.error("Error fetching eligible stylists:", stylistsError);
        return;
      }
      
      if (stylistsData) {
        const stylistIds = stylistsData.map(stylist => stylist.id);
        setEligibleStylists(stylistIds);
      }
    } catch (error) {
      console.error("Error fetching eligible stylists:", error);
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
    handleStylistSelect
  };
};
