
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Scissors, Calendar } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Service } from "@/types/dashboard";

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .limit(4); // Just show a few services on the homepage
          
        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="py-20 bg-white" id="services">
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="salon-heading mb-3 text-red-500">Our Premium Services</h2>
        <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the finest beauty and grooming services delivered by our expert professionals 
          in a luxurious and comfortable environment.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p>Loading services...</p>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {services.length > 0 ? (
              services.map((service) => (
                <div 
                  key={service.id}
                  className="service-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-2 mb-4 inline-block bg-gold/10 rounded-lg">
                    <Scissors className="h-8 w-8 text-salon-green" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-salon-green mb-3">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gold font-bold">${service.price}</span>
                    <span className="text-sm text-gray-500">{service.duration} min</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                <p>No services available at the moment. Please check back later.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Button 
              size="lg"
              className="bg-gold hover:bg-gold-dark text-white px-8"
              onClick={() => navigate('/services')}
            >
              <Calendar className="mr-2 h-5 w-5" /> View All Services
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
