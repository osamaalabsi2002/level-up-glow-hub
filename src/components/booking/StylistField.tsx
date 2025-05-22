
import { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Stylist {
  id: number;
  name: string;
  available: boolean;
}

interface StylistFieldProps {
  form: UseFormReturn<any>;
  onStylistSelect?: (id: number | null) => void;
  isLoading?: boolean;
}

const StylistField = ({ form, onStylistSelect, isLoading = false }: StylistFieldProps) => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    try {
      setLoading(true);
      console.log("Fetching all stylists...");
      
      const { data, error } = await supabase
        .from('stylists')
        .select('id, name, available');
      
      if (error) {
        console.error("Error fetching stylists:", error);
        toast.error("Failed to load stylists");
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Stylists fetched:", data);
        setStylists(data);
      } else {
        console.log("No stylists found");
        setStylists([]);
      }
    } catch (error) {
      console.error('Error fetching stylists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStylistChange = (value: string) => {
    const stylistId = value ? parseInt(value) : null;
    console.log("Selected stylist ID:", stylistId);
    
    if (onStylistSelect) {
      onStylistSelect(stylistId);
    }
    
    const selectedStylist = stylists.find(s => s.id === stylistId);
    if (selectedStylist) {
      console.log("Selected stylist name:", selectedStylist.name);
      form.setValue("stylist", selectedStylist.name);
      form.setValue("stylistId", stylistId);
      form.clearErrors(["stylist", "stylistId"]);
    } else {
      console.log("No stylist selected, clearing field");
      form.setValue("stylist", "");
      form.setValue("stylistId", undefined);
    }
  };

  // Make sure we have valid stylists with proper IDs
  const validStylists = stylists.filter(stylist => stylist && stylist.id !== undefined && stylist.id !== null);

  return (
    <FormField
      control={form.control}
      name="stylist"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Stylist <span className="text-red-500">*</span></FormLabel>
          <Select 
            disabled={loading || isLoading || validStylists.length === 0} 
            onValueChange={handleStylistChange}
            value={form.watch("stylistId") ? String(form.watch("stylistId")) : undefined}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  loading || isLoading 
                    ? "Loading..."
                    : validStylists.length === 0 
                      ? "No stylists found" 
                      : "Select a stylist"
                } />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {validStylists.map((stylist) => (
                <SelectItem
                  key={stylist.id}
                  value={String(stylist.id)}
                >
                  {stylist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StylistField;
