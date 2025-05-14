
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsProps {
  bookingsCount: number;
  stylistsCount: number;
  todayBookingsCount: number;
  averageRating: number;
}

const DashboardStats = ({ bookingsCount = 0, stylistsCount = 0, todayBookingsCount = 0, averageRating = 0 }: StatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="bg-salon-green text-white rounded-t-lg">
          <CardTitle className="text-center">عدد المواعيد</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-4xl font-bold text-salon-green">{bookingsCount}</p>
          <p className="text-gray-600">إجمالي المواعيد</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-salon-green text-white rounded-t-lg">
          <CardTitle className="text-center">المصممين</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-4xl font-bold text-salon-green">{stylistsCount}</p>
          <p className="text-gray-600">مصمم نشط</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-salon-green text-white rounded-t-lg">
          <CardTitle className="text-center">مواعيد اليوم</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-4xl font-bold text-salon-green">{todayBookingsCount}</p>
          <p className="text-gray-600">مواعيد</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-salon-green text-white rounded-t-lg">
          <CardTitle className="text-center">متوسط التقييم</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-4xl font-bold text-salon-green">{averageRating}</p>
          <p className="text-gray-600">من 5 نجوم</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
