
import { useState } from "react";
import { Stylist } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStylistOperations = (initialStylists: Stylist[]) => {
  const [localStylists, setLocalStylists] = useState<Stylist[]>(initialStylists);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteStylist = async (id: number) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('stylists')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete error:", error);
        throw new Error(error.message || "Failed to delete stylist");
      }
      
      // Remove from local state
      const updatedStylists = localStylists.filter(s => s.id !== id);
      // Update the localStylists list
      setLocalStylists(updatedStylists);
      toast.success("تم حذف المصمم بنجاح");
    } catch (error: any) {
      console.error("Error deleting stylist:", error);
      toast.error(error.message || "حدث خطأ أثناء حذف المصمم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStylist = async (stylist: Partial<Stylist>) => {
    try {
      setIsLoading(true);
      
      // Extract user_id if it's present and then remove it from the main data object
      const user_id = stylist.user_id || null;
      const { user_id: _, ...stylistData } = stylist;

      // Insert into stylists table
      const { data, error } = await supabase
        .from('stylists')
        .insert({
          name: stylistData.name || "",
          role: stylistData.role || "",
          image: stylistData.image || "",
          bio: stylistData.bio || "",
          specialties: stylistData.specialties || [],
          rating: stylistData.rating || 5.0,
          reviews: stylistData.reviews || 0,
          available: stylistData.available !== undefined ? stylistData.available : true,
          experience: stylistData.experience || 1,
          user_id: user_id // Link to user if provided
        })
        .select();
      
      if (error) {
        console.error("Insert error:", error);
        throw new Error(error.message || "Failed to add stylist");
      }
      
      if (data && data[0]) {
        // Format the returned data
        const newStylist: Stylist = {
          id: data[0].id,
          name: data[0].name,
          role: data[0].role,
          image: data[0].image,
          rating: data[0].rating,
          reviews: data[0].reviews,
          specialties: data[0].specialties,
          bio: data[0].bio || "",
          available: data[0].available,
          experience: data[0].experience,
          services: [],
          clientReviews: [],
          user_id: data[0].user_id
        };
        
        // Add the new stylist to state
        setLocalStylists([...localStylists, newStylist]);
        
        // Show success message based on whether a user was associated
        if (user_id) {
          toast.success("تمت إضافة المصمم وتحديث دور المستخدم بنجاح");
        } else {
          toast.success("تمت إضافة المصمم بنجاح");
        }
        
        return newStylist;
      }
      return null;
    } catch (error: any) {
      console.error("Error adding stylist:", error);
      toast.error(error.message || "حدث خطأ أثناء إضافة المصمم");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditStylist = async (updatedStylist: Stylist) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('stylists')
        .update({
          name: updatedStylist.name,
          role: updatedStylist.role,
          image: updatedStylist.image,
          bio: updatedStylist.bio,
          specialties: updatedStylist.specialties,
          rating: updatedStylist.rating,
          reviews: updatedStylist.reviews,
          available: updatedStylist.available,
          experience: updatedStylist.experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedStylist.id);
      
      if (error) {
        console.error("Update error:", error);
        throw new Error(error.message || "Failed to update stylist");
      }
      
      // Update the stylist in state
      const updatedStylists = localStylists.map(stylist => 
        stylist.id === updatedStylist.id ? updatedStylist : stylist
      );
      setLocalStylists(updatedStylists);
      toast.success("تم تحديث بيانات المصمم بنجاح");
      return updatedStylist;
    } catch (error: any) {
      console.error("Error updating stylist:", error);
      toast.error(error.message || "حدث خطأ أثناء تحديث بيانات المصمم");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    localStylists,
    setLocalStylists,
    isLoading,
    handleDeleteStylist,
    handleAddStylist,
    handleEditStylist
  };
};
