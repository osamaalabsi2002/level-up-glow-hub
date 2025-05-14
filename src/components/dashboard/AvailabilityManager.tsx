
import { useState, useEffect } from "react";
import { format, addDays, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Loader2, CalendarDays, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityManagerProps {
  stylistId: number;
}

type DayAvailability = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIME_OPTIONS = Array(24)
  .fill(0)
  .map((_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? "AM" : "PM";
    return { 
      value: format(new Date().setHours(i, 0, 0), "HH:mm:ss"),
      label: `${hour}:00 ${ampm}`
    };
  });

const AvailabilityManager = ({ stylistId }: AvailabilityManagerProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedTab, setSelectedTab] = useState("weekly");
  
  useEffect(() => {
    if (stylistId) {
      fetchAvailability();
    }
  }, [stylistId]);
  
  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('available_times')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('day_of_week');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAvailability(data);
      } else {
        // Initialize default availability if none exists
        const defaultAvailability = DAYS_OF_WEEK.map(day => ({
          id: 0, // temporary ID
          day_of_week: day.value,
          stylist_id: stylistId,
          start_time: '10:00:00',
          end_time: '22:00:00',
          is_available: true
        }));
        setAvailability(defaultAvailability);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleDay = (dayIndex: number) => {
    setAvailability(current => 
      current.map(day => 
        day.day_of_week === dayIndex 
          ? { ...day, is_available: !day.is_available } 
          : day
      )
    );
  };
  
  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(current => 
      current.map(day => 
        day.day_of_week === dayIndex 
          ? { ...day, [field]: value } 
          : day
      )
    );
  };
  
  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      // Validate time ranges (start time must be before end time)
      const invalidRanges = availability.some(day => 
        day.is_available && day.start_time >= day.end_time
      );
      
      if (invalidRanges) {
        return toast({
          title: "Invalid Time Range",
          description: "Start time must be earlier than end time",
          variant: "destructive"
        });
      }
      
      // Update or insert availability for each day
      for (const day of availability) {
        if (day.id) {
          // Update existing record
          const { error } = await supabase
            .from('available_times')
            .update({
              start_time: day.start_time,
              end_time: day.end_time,
              is_available: day.is_available,
              updated_at: new Date().toISOString()
            })
            .eq('id', day.id);
            
          if (error) throw error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('available_times')
            .insert({
              stylist_id: stylistId,
              day_of_week: day.day_of_week,
              start_time: day.start_time,
              end_time: day.end_time,
              is_available: day.is_available
            });
            
          if (error) throw error;
        }
      }
      
      toast({
        title: "Success",
        description: "Availability settings have been saved"
      });
      
      // Refresh data
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Availability Settings
        </CardTitle>
        <CardDescription>
          Set your regular working hours and manage availability
        </CardDescription>
      </CardHeader>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="dates" disabled>Date Exceptions</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="weekly" className="pt-2">
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const dayData = availability.find(a => a.day_of_week === day.value);
                  if (!dayData) return null;
                  
                  return (
                    <div key={day.value} className="grid grid-cols-[80px_1fr] gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={dayData.is_available}
                          onCheckedChange={() => handleToggleDay(day.value)}
                        />
                        <Label>{day.label}</Label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          disabled={!dayData.is_available}
                          value={dayData.start_time}
                          onValueChange={(value) => handleTimeChange(day.value, 'start_time', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          disabled={!dayData.is_available}
                          value={dayData.end_time}
                          onValueChange={(value) => handleTimeChange(day.value, 'end_time', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSaveAvailability}
              disabled={saving || loading}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Availability
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="dates">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This feature is coming soon. You'll be able to set specific dates as unavailable or override hours for specific dates.
            </p>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AvailabilityManager;
