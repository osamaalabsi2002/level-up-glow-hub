import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DayAvailability, validateTimeRanges, createDefaultAvailability } from "@/utils/availabilityUtils";

export const useAvailabilityManager = (initialStylistId?: number | null) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stylistId, setStylistId] = useState<number | null>(initialStylistId || null);
  
  // Create a reference to hold the current stylist ID for use in callbacks
  const stylistIdRef = useRef<number | null>(stylistId);
  
  // If no stylist ID is provided, try to get the current user's stylist ID
  useEffect(() => {
    const getCurrentUserStylistId = async () => {
      if (initialStylistId) {
        // If an ID is provided, use it directly
        setStylistId(initialStylistId);
        return;
      }
      
      try {
        setLoading(true);
        // Get the current user's session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          console.warn("No user session found in useAvailabilityManager");
          setError("You must be logged in to manage availability.");
          setLoading(false);
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Check user profile role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (profileError || !profileData) {
          console.error("Error getting user profile:", profileError);
          setError("Unable to verify your user role.");
          setLoading(false);
          return;
        }
        
        // Only proceed if user is a stylist
        if (profileData.role !== 'stylist') {
          console.warn(`User ${userId} is not a stylist (role: ${profileData.role})`);
          setError("Only stylists can manage availability.");
          setLoading(false);
          return;
        }
        
        // Get the stylist ID for the current user
        const { data: stylistData, error: stylistError } = await supabase
          .from('stylists')
          .select('id')
          .eq('user_id', userId)
          .single();
          
        if (stylistError || !stylistData) {
          console.error("Error getting stylist ID:", stylistError);
          setError("Could not find your stylist profile.");
          setLoading(false);
          return;
        }
        
        console.log(`Found stylist ID ${stylistData.id} for current user ${userId}`);
        setStylistId(stylistData.id);
      } catch (error: any) {
        console.error("Error in getCurrentUserStylistId:", error);
        setError("An error occurred while determining your stylist ID.");
        setLoading(false);
      }
    };
    
    getCurrentUserStylistId();
  }, [initialStylistId]);
  
  // Update the ref when the stylist ID changes
  useEffect(() => {
    stylistIdRef.current = stylistId;
    console.log(`StylistID updated to: ${stylistId}`);
    
    // When stylistId is set, fetch availability
    if (stylistId) {
      fetchAvailability();
    }
  }, [stylistId]);
  
  const fetchAvailability = async () => {
    // Use the current value from the ref
    const currentStylistId = stylistIdRef.current;
    
    if (!currentStylistId) {
      console.error("Cannot fetch availability without stylist ID");
      setError("Stylist ID is missing. Please refresh the page and try again.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching availability for stylist ID: ${currentStylistId}`);
      
      // First verify if the stylist exists
      const { data: stylistData, error: stylistError } = await supabase
        .from('stylists')
        .select('id, name')
        .eq('id', currentStylistId)
        .single();
        
      if (stylistError) {
        console.error('Error verifying stylist:', stylistError);
        setError(`Could not verify stylist ID ${currentStylistId}`);
        setLoading(false);
        return;
      }
      
      if (!stylistData) {
        console.error(`Stylist with ID ${currentStylistId} not found`);
        setError(`Stylist with ID ${currentStylistId} not found`);
        setLoading(false);
        return;
      }
      
      console.log(`Verified stylist: ${stylistData.name} (ID: ${stylistData.id})`);
      
      // Now fetch availability
      const { data, error } = await supabase
        .from('available_times')
        .select('*')
        .eq('stylist_id', currentStylistId)
        .order('day_of_week');
        
      if (error) {
        console.error('Error fetching availability:', error);
        setError(error.message);
        toast.error("Failed to load availability settings");
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} availability entries for stylist ${currentStylistId}`);
        setAvailability(data);
      } else {
        console.log(`No availability found for stylist ${currentStylistId}, creating default`);
        // Initialize default availability if none exists
        const defaultAvailability = createDefaultAvailability(currentStylistId);
        setAvailability(defaultAvailability);
        
        // Create default availability in database
        await createInitialAvailability(defaultAvailability);
      }
    } catch (error: any) {
      console.error('Error in fetchAvailability:', error);
      setError(error.message || "Failed to load availability settings");
    } finally {
      setLoading(false);
    }
  };
  
  const createInitialAvailability = async (defaultAvailability: DayAvailability[]) => {
    try {
      const currentStylistId = stylistIdRef.current;
      console.log(`Creating initial availability for stylist ${currentStylistId}`);
      
      // Make sure we're using the right stylist ID in all availability entries
      const availabilityWithCorrectId = defaultAvailability.map(day => ({
        ...day,
        stylist_id: currentStylistId
      }));
      
      const { error } = await supabase
        .from('available_times')
        .insert(availabilityWithCorrectId);
        
      if (error) {
        console.error('Error creating initial availability:', error);
        toast.error("Failed to create initial availability");
        return false;
      }
      
      console.log('Initial availability created successfully');
      return true;
    } catch (error: any) {
      console.error('Error in createInitialAvailability:', error);
      return false;
    }
  };
  
  const handleToggleDay = (dayIndex: number) => {
    console.log(`Toggling availability for day: ${dayIndex}`);
    setAvailability(current => 
      current.map(day => 
        day.day_of_week === dayIndex 
          ? { ...day, is_available: !day.is_available } 
          : day
      )
    );
  };
  
  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    console.log(`Changing ${field} for day ${dayIndex} to ${value}`);
    setAvailability(current => 
      current.map(day => 
        day.day_of_week === dayIndex 
          ? { ...day, [field]: value } 
          : day
      )
    );
  };
  
  const handleSaveAvailability = async () => {
    const currentStylistId = stylistIdRef.current;
    
    if (!currentStylistId) {
      toast.error("Cannot save availability without stylist ID");
      setError("Stylist ID is missing. Please refresh the page and try again.");
      return false;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      console.log(`Saving availability for stylist ID: ${currentStylistId}`);
      
      // First, verify the stylist exists
      const { data: stylistData, error: stylistError } = await supabase
        .from('stylists')
        .select('id, name')
        .eq('id', currentStylistId)
        .single();
        
      if (stylistError || !stylistData) {
        console.error('Error verifying stylist:', stylistError);
        setError(`Could not verify stylist ID ${currentStylistId}`);
        setSaving(false);
        return false;
      }
      
      // Validate time ranges
      if (!validateTimeRanges(availability)) {
        console.error("Invalid time ranges detected");
        toast.error("Start time must be earlier than end time");
        setSaving(false);
        return false;
      }
      
      // Get existing availability records
      const { data: existingData, error: fetchError } = await supabase
        .from('available_times')
        .select('id, day_of_week')
        .eq('stylist_id', currentStylistId);
        
      if (fetchError) {
        console.error('Error fetching existing availability records:', fetchError);
        setError(fetchError.message);
        throw fetchError;
      }
      
      // Create a map of existing records by day
      const existingRecordsByDay = (existingData || []).reduce((acc: Record<number, any>, record) => {
        acc[record.day_of_week] = record;
        return acc;
      }, {});
      
      // Process each day individually to be more resilient
      for (const day of availability) {
        const existingRecord = existingRecordsByDay[day.day_of_week];
        
        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('available_times')
            .update({
              start_time: day.start_time,
              end_time: day.end_time,
              is_available: day.is_available,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingRecord.id);
            
          if (updateError) {
            console.error(`Error updating day ${day.day_of_week}:`, updateError);
            setError(`Failed to update day ${day.day_of_week}: ${updateError.message}`);
            // Continue with other days instead of throwing
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('available_times')
            .insert({
              stylist_id: currentStylistId,
              day_of_week: day.day_of_week,
              start_time: day.start_time,
              end_time: day.end_time,
              is_available: day.is_available,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error(`Error inserting day ${day.day_of_week}:`, insertError);
            setError(`Failed to add day ${day.day_of_week}: ${insertError.message}`);
            // Continue with other days instead of throwing
          }
        }
      }
      
      console.log("Availability saved successfully");
      toast.success("Availability settings have been saved");
      
      // Refresh data
      await fetchAvailability();
      return true;
    } catch (error: any) {
      console.error('Error saving availability:', error);
      setError(error.message || "Failed to save availability settings");
      toast.error("Failed to save availability settings");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    availability,
    error,
    stylistId, // Now expose the stylistId
    handleToggleDay,
    handleTimeChange,
    handleSaveAvailability,
    fetchAvailability
  };
};
