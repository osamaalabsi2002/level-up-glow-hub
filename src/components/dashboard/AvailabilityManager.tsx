import { useState, useEffect } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklySchedule from "./availability/WeeklySchedule";

interface AvailabilityManagerProps {
  stylistId?: number | null;
}

const AvailabilityManager = ({ stylistId }: AvailabilityManagerProps) => {
  const [selectedTab, setSelectedTab] = useState("weekly");
  
  // Convert stylistId to a number if it's a string
  const numericStylistId = stylistId ? 
    (typeof stylistId === 'string' ? parseInt(stylistId) : stylistId) : 
    null;
  
  // Log for debugging purposes
  useEffect(() => {
    console.log(`AvailabilityManager: Stylist ID ${numericStylistId || 'not provided'}`);
  }, [numericStylistId]);
  
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
      
      <Tabs 
        defaultValue="weekly" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
      >
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="dates">Specific Dates</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="weekly" className="pt-2">
          <WeeklySchedule stylistId={numericStylistId} />
        </TabsContent>
        
        <TabsContent value="dates">
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              This feature is coming soon. You'll be able to set specific dates as unavailable or override hours for specific dates.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AvailabilityManager;
