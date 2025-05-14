
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Booking } from "@/types/dashboard";

interface BookingsTabProps {
  bookings: Booking[];
  onConfirmBooking: (id: number) => void;
  onDeleteBooking: (id: number) => void;
  loading: boolean;
}

const BookingsTab = ({ bookings, onConfirmBooking, onDeleteBooking, loading }: BookingsTabProps) => {
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // Handle confirm booking
  const handleConfirm = async (id: number) => {
    setProcessingIds(prev => [...prev, id]);
    try {
      await onConfirmBooking(id);
      toast.success(`تم تأكيد الموعد #${id}`);
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("فشل تأكيد الموعد");
    } finally {
      setProcessingIds(prev => prev.filter(item => item !== id));
    }
  };

  // Handle delete booking
  const handleDelete = async (id: number) => {
    setProcessingIds(prev => [...prev, id]);
    try {
      await onDeleteBooking(id);
      toast.success(`تم إلغاء الموعد #${id}`);
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast.error("فشل إلغاء الموعد");
    } finally {
      setProcessingIds(prev => prev.filter(item => item !== id));
    }
  };

  // Function to get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">مؤكد</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">مكتمل</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">ملغي</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">جاري تحميل المواعيد...</p>
      </div>
    );
  }

  return (
    <div>
      {bookings.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="h-12 px-4 text-right align-middle font-medium w-12">#</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">العميل</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">المصمم</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">الخدمة</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">التاريخ</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">الوقت</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">الحالة</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="p-4 align-middle">{booking.id}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <User className="h-4 w-4 ml-2 text-salon-green" />
                        {booking.clientName}
                      </div>
                    </td>
                    <td className="p-4 align-middle">{booking.stylistName}</td>
                    <td className="p-4 align-middle">{booking.service}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-2 text-salon-green" />
                        {booking.date}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 ml-2 text-salon-green" />
                        {booking.time}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {booking.status === "pending" && (
                          <Button 
                            size="sm" 
                            className="bg-salon-green hover:bg-salon-darkGreen text-white"
                            onClick={() => handleConfirm(booking.id)}
                            disabled={processingIds.includes(booking.id) || loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            تأكيد
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
                            إلغاء
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
          <p className="text-gray-600">لا توجد مواعيد مسجلة</p>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
