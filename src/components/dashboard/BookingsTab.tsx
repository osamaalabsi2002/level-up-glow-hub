
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle, XCircle, List, AlignJustify } from "lucide-react";
import { toast } from "sonner";
import { Booking } from "@/types/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingsTimeline from "./BookingsTimeline";

interface BookingsTabProps {
  bookings: Booking[];
  onConfirmBooking: (id: number) => void;
  onDeleteBooking: (id: number) => void;
  loading: boolean;
}

const BookingsTab = ({ bookings, onConfirmBooking, onDeleteBooking, loading }: BookingsTabProps) => {
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>("list");

  // Handle confirm booking
  const handleConfirm = async (id: number) => {
    setProcessingIds(prev => [...prev, id]);
    try {
      await onConfirmBooking(id);
      toast.success(`Booking #${id} confirmed successfully`);
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Failed to confirm booking");
    } finally {
      setProcessingIds(prev => prev.filter(item => item !== id));
    }
  };

  // Handle delete booking
  const handleDelete = async (id: number) => {
    setProcessingIds(prev => [...prev, id]);
    try {
      await onDeleteBooking(id);
      toast.success(`Booking #${id} cancelled successfully`);
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setProcessingIds(prev => prev.filter(item => item !== id));
    }
  };

  // Function to get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center">
            <List className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center">
            <AlignJustify className="w-4 h-4 mr-2" />
            Timeline View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {bookings.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium w-12">#</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Client</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Stylist</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Service</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Time</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Duration</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b">
                        <td className="p-4 align-middle">{booking.id}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-salon-green" />
                            {booking.clientName}
                          </div>
                        </td>
                        <td className="p-4 align-middle">{booking.stylistName}</td>
                        <td className="p-4 align-middle">{booking.service}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-salon-green" />
                            {booking.date}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-salon-green" />
                            {booking.time}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          {booking.duration || 60} min
                        </td>
                        <td className="p-4 align-middle">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex space-x-2">
                            {booking.status === "pending" && (
                              <Button 
                                size="sm" 
                                className="bg-salon-green hover:bg-salon-darkGreen text-white"
                                onClick={() => handleConfirm(booking.id)}
                                disabled={processingIds.includes(booking.id) || loading}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                            )}
                            {(booking.status === "pending" || booking.status === "confirmed") && (
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="border-red-500 hover:bg-red-50 text-red-500"
                                onClick={() => handleDelete(booking.id)}
                                disabled={processingIds.includes(booking.id) || loading}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No bookings found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="timeline">
          <BookingsTimeline 
            bookings={bookings} 
            loading={loading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsTab;
