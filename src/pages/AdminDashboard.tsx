
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BookingsTab from '@/components/dashboard/BookingsTab';
import ServicesTab from '@/components/dashboard/ServicesTab';
import StylistsTab from '@/components/dashboard/StylistsTab';
import ProductsTab from '@/components/admin/ProductsTab';
import BlogsTab from '@/components/admin/BlogsTab';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Admin Dashboard" 
        subtitle="Administrator" 
      />
      
      <div className="container mx-auto py-10 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-4xl mx-auto mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="stylists">Stylists</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="blogs">Blog</TabsTrigger>
          </TabsList>

          <div className="max-w-7xl mx-auto">
            <TabsContent value="overview">
              {/* Using DashboardStats without props for now */}
              <DashboardStats />
            </TabsContent>

            <TabsContent value="bookings">
              {/* Using BookingsTab without props for now */}
              <BookingsTab />
            </TabsContent>

            <TabsContent value="services">
              {/* Using ServicesTab without props for now */}
              <ServicesTab />
            </TabsContent>

            <TabsContent value="stylists">
              {/* Using StylistsTab without props for now */}
              <StylistsTab />
            </TabsContent>
            
            <TabsContent value="products">
              <ProductsTab />
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

export default AdminDashboard;
