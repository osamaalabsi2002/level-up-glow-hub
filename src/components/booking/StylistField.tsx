
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
}

const StylistField = ({ form, onStylistSelect }: StylistFieldProps) => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    try {
      setLoading(true);
      console.log("Fetching stylists...");
      
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
    } else {
      console.log("No stylist selected, clearing field");
      form.setValue("stylist", "");
    }
  };

  return (
    <FormField
      control={form.control}
      name="stylist"
      render={() => (
        <FormItem>
          <FormLabel>Stylist</FormLabel>
          <Select 
            disabled={loading} 
            onValueChange={handleStylistChange}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a stylist" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {stylists.map((stylist) => (
                <SelectItem
                  key={stylist.id}
                  value={String(stylist.id)}
                  disabled={!stylist.available}
                  className={!stylist.available ? "text-red-500 opacity-50" : ""}
                >
                  {stylist.name} {!stylist.available && "(Not Available)"}
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
