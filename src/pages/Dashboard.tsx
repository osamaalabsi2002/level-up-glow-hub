import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AvailabilityManager from '@/components/dashboard/AvailabilityManager';

// Main Dashboard component for regular users (not admins or stylists)
const Dashboard = () => {
  const { user: userSession, profile: userProfile } = useAuth();
  
  // Check if the user is a stylist
  const isStylist = 
    userSession?.user_metadata?.role === 'stylist' || 
    (userProfile && userProfile.role === 'stylist');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Main dashboard content goes here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your dashboard content... */}
      </div>
      
      {/* Availability section for stylists */}
      {isStylist && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Manage Your Availability</h2>
          <AvailabilityManager />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
