
import { useState } from "react";
import { Stylist } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Helper to shape DB row into our Stylist interface
const formatStylist = (row: any): Stylist => ({
  id: row.id,
  name: row.name,
  role: row.role,
  bio: row.bio || "",
  image: row.image,
  available: row.available,
  rating: row.rating,
  reviews: row.reviews,
  experience: row.experience,
  specialties: row.specialties || [],
  services: [],
  clientReviews: [],
  user_id: row.user_id ?? null,
});

// Extract URL path from a Supabase storage URL
const getStoragePathFromUrl = (url: string): string | null => {
  try {
    if (!url) return null;
    
    // Check if this is a Supabase storage URL
    if (!url.includes('storage/v1/object/public/stylist-images/')) {
      return null;
    }
    
    // Extract the path component after 'stylist-images/'
    const pathMatch = url.match(/stylist-images\/(.+)$/);
    return pathMatch ? pathMatch[1] : null;
  } catch (error) {
    console.error("Error extracting path from URL:", error);
    return null;
  }
};

export const useStylistOperations = (initialStylists: Stylist[]) => {
  const [localStylists, setLocalStylists] = useState<Stylist[]>(initialStylists);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to clean up unused images from storage
  const cleanupUnusedImage = async (oldImageUrl: string, newImageUrl: string) => {
    try {
      // Skip cleanup if URLs are the same or old URL is external
      if (oldImageUrl === newImageUrl || !oldImageUrl.includes('stylist-images')) {
        return;
      }
      
      const oldImagePath = getStoragePathFromUrl(oldImageUrl);
      if (!oldImagePath) return;
      
      // Check if any other stylist uses this image
      const { data: stylists } = await supabase
        .from('stylists')
        .select('id')
        .neq('id', -1) // Dummy condition to get all stylists
        .eq('image', oldImageUrl);
      
      if (!stylists || stylists.length <= 1) {
        // No other stylist uses this image, safe to delete
        const { error } = await supabase
          .storage
          .from('stylist-images')
          .remove([oldImagePath]);
          
        if (error) {
          console.error("Error removing old image:", error);
        } else {
          console.log("Old image removed successfully:", oldImagePath);
        }
      }
    } catch (error) {
      console.error("Error cleaning up image:", error);
      // Continue execution, don't block the main operation
    }
  };

  const handleDeleteStylist = async (id: number) => {
    try {
      setIsLoading(true);
      console.log(`Deleting stylist with ID: ${id}`);
      
      // Get the stylist's image URL before deletion
      const stylist = localStylists.find(s => s.id === id);
      const imageUrl = stylist?.image;
      
      const { error } = await supabase
        .from('stylists')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete error:", error);
        throw new Error(error.message || "Failed to delete stylist");
      }
      
      // Cleanup the image if it's from our storage
      if (imageUrl && imageUrl.includes('stylist-images')) {
        const imagePath = getStoragePathFromUrl(imageUrl);
        if (imagePath) {
          await supabase
            .storage
            .from('stylist-images')
            .remove([imagePath]);
        }
      }
      
      // Remove from local state
      const updatedStylists = localStylists.filter(s => s.id !== id);
      // Update the localStylists list
      setLocalStylists(updatedStylists);
      toast({
        title: "Success",
        description: "Stylist deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting stylist:", error);
      toast({
        title: "Error",
        description: error.message || "Error deleting stylist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStylist = async (stylist: Partial<Stylist>) => {
    try {
      setIsLoading(true);
      console.log("Adding new stylist:", stylist);
      
      // Extract user_id if it's present and valid
      const user_id = stylist.user_id && stylist.user_id !== 'none' ? stylist.user_id : null;
      // Separate stylist-specific fields (excluding user_id)
      const { user_id: _omitted, ...stylistData } = stylist;

      // ------------------------------------------------------
      // CASE 1: Link to an EXISTING USER -> rely on DB trigger
      // ------------------------------------------------------
      if (user_id) {
        // 1) Ensure the user's role is set to 'stylist' – only update if needed
        const { data: profileRow, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user_id)
          .single();

        if (profileErr) {
          throw new Error(profileErr.message || 'Failed to fetch user profile');
        }

        if (profileRow && profileRow.role !== 'stylist') {
          const { error: roleUpdateError } = await supabase
            .from('profiles')
            .update({ role: 'stylist' })
            .eq('id', user_id);

          if (roleUpdateError) {
            throw new Error(roleUpdateError.message || 'Failed to update user role');
          }
        }

        // 2) Wait for the trigger to create a stylist row (poll for up to 5 seconds)
        let existingStylist: any = null;
        const maxAttempts = 10;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const { data, error: fetchError } = await supabase
            .from('stylists')
            .select('*')
            .eq('user_id', user_id)
            .single();

          if (data) {
            existingStylist = data;
            break;
          }

          // If an error other than not-found, abort immediately
          if (fetchError && fetchError.code !== 'PGRST116') {
            throw new Error(fetchError.message || 'Error fetching stylist record');
          }

          // Wait 500ms before next attempt
          await new Promise((res) => setTimeout(res, 500));
        }

        if (!existingStylist) {
          throw new Error('Timed out waiting for stylist record creation');
        }

        // 3) Prepare any additional fields we want to update on that stylist
        const updatePayload: Partial<Stylist> = {};
        if (stylistData.name) updatePayload.name = stylistData.name;
        if (stylistData.role) updatePayload.role = stylistData.role;
        if (stylistData.image) updatePayload.image = stylistData.image;
        if (stylistData.bio !== undefined) updatePayload.bio = stylistData.bio;
        if (stylistData.specialties) updatePayload.specialties = stylistData.specialties;
        if (stylistData.rating !== undefined) updatePayload.rating = stylistData.rating;
        if (stylistData.reviews !== undefined) updatePayload.reviews = stylistData.reviews;
        if (stylistData.available !== undefined) updatePayload.available = stylistData.available;
        if (stylistData.experience !== undefined) updatePayload.experience = stylistData.experience;

        let finalStylist: Stylist = formatStylist(existingStylist);
        if (Object.keys(updatePayload).length > 0) {
          const { data: updatedStylist, error: updateError } = await supabase
            .from('stylists')
            .update(updatePayload)
            .eq('id', existingStylist.id)
            .select()
            .single();

          if (updateError) {
            // Not critical enough to rollback role change, but inform user
            toast({
              title: "Warning",
              description: "Stylist created but failed to update extra details",
              variant: "destructive",
            });
            console.error('Stylist extra detail update error:', updateError);
          } else if (updatedStylist) {
            finalStylist = formatStylist(updatedStylist);
          }
        }

        // 4) Update local state & notify
        setLocalStylists([...localStylists, finalStylist]);
        toast({
          title: "Success",
          description: "Stylist added and user role updated successfully",
        });
        return finalStylist;
      }

      // ------------------------------------------------------
      // CASE 2: Stand-alone stylist (no linked user) -> direct insert
      // ------------------------------------------------------
      const { data, error } = await supabase
        .from('stylists')
        .insert({
          name: stylistData.name || '',
          role: stylistData.role || '',
          image: stylistData.image || '',
          bio: stylistData.bio || '',
          specialties: stylistData.specialties || [],
          rating: stylistData.rating || 5.0,
          reviews: stylistData.reviews || 0,
          available: stylistData.available !== undefined ? stylistData.available : true,
          experience: stylistData.experience || 1,
          user_id: null
        })
        .select();

      if (error) {
        throw new Error(error.message || 'Failed to add stylist');
      }

      const newStylist: Stylist = formatStylist(data![0]);

      setLocalStylists([...localStylists, newStylist]);
      toast({
        title: "Success",
        description: "Stylist added successfully",
      });
      return newStylist;
    } catch (error: any) {
      console.error('Error adding stylist:', error);
      toast({
        title: "Error",
        description: error.message || "Error adding stylist",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStylist = async (updatedStylist: Stylist) => {
    try {
      setIsLoading(true);
      console.log(`Updating stylist with ID: ${updatedStylist.id}`, updatedStylist);
      
      // Find the original stylist to check for image changes
      const originalStylist = localStylists.find(s => s.id === updatedStylist.id);
      const oldImageUrl = originalStylist?.image || '';
      const newImageUrl = updatedStylist.image || '';
      
      // Cleanup old image if it's changed
      if (oldImageUrl !== newImageUrl) {
        await cleanupUnusedImage(oldImageUrl, newImageUrl);
      }
      
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
          user_id: updatedStylist.user_id,
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
      toast({
        title: "Success",
        description: "Stylist updated successfully",
      });
      return updatedStylist;
    } catch (error: any) {
      console.error("Error updating stylist:", error);
      toast({
        title: "Error",
        description: error.message || "Error updating stylist",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch stylist services
  const fetchStylistServices = async (stylistId: number) => {
    if (!stylistId) {
      console.error("Cannot fetch services without stylist ID");
      return [];
    }
    
    try {
      console.log(`Fetching services for stylist ID: ${stylistId}`);
      const { data, error } = await supabase
        .from('stylist_services')
        .select(`
          service_id,
          services:service_id (id, name, price, duration, description)
        `)
        .eq('stylist_id', stylistId);
      
      if (error) {
        console.error("Error fetching stylist services:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} services for stylist ${stylistId}`);
      return data?.map(item => item.services) || [];
    } catch (error) {
      console.error("Error fetching stylist services:", error);
      return [];
    }
  };

  return {
    localStylists,
    setLocalStylists,
    isLoading,
    handleDeleteStylist,
    handleAddStylist,
    handleEditStylist,
    fetchStylistServices
  };
};
