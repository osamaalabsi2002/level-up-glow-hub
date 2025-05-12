
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-20">
        <div className="text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-salon-green mb-4">404</h1>
          <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
          <p className="text-2xl md:text-3xl text-gray-700 mb-6 font-serif">Page Not Found</p>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to our beautiful salon.
          </p>
          <Button className="bg-salon-green hover:bg-salon-darkGreen text-white">
            <Home className="mr-2 h-5 w-5" /> Return to Homepage
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
