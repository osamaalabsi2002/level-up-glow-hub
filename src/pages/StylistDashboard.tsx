
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BookingsTab from '@/components/dashboard/BookingsTab';
import AvailabilityManager from '@/components/dashboard/AvailabilityManager';
import DashboardStats from '@/components/dashboard/DashboardStats';
import BlogsTab from '@/components/admin/BlogsTab';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const StylistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile || profile.role !== 'stylist') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Stylist Dashboard" role="Stylist" />
      
      <div className="container mx-auto py-10 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-4xl mx-auto mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="blogs">Blog</TabsTrigger>
          </TabsList>

          <div className="max-w-7xl mx-auto">
            <TabsContent value="overview">
              <DashboardStats isStylist />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingsTab isStylist />
            </TabsContent>

            <TabsContent value="availability">
              <AvailabilityManager />
            </TabsContent>
            
            <TabsContent value="blogs">
              <BlogsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default StylistDashboard;
