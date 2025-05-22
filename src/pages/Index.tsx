
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Stylists from "@/components/home/Stylists";
import Testimonials from "@/components/home/Testimonials";
import CtaSection from "@/components/home/CtaSection";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  // Check Supabase connection when the app loads
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test connection using our helper function
        const isConnected = await checkSupabaseConnection();
        
        if (!isConnected) {
          console.warn("Initial database connection check failed");
          toast.error("There might be issues connecting to our services. Some features may be limited.", {
            id: "db-connection-error",
            duration: 5000,
          });
        }
      } catch (err) {
        console.error("Failed to check database connection:", err);
      }
    };
    
    checkConnection();
    
    // Set up periodic connection checks
    const connectionCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        checkSupabaseConnection().catch(console.error);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(connectionCheckInterval);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Stylists />
      <Testimonials />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
