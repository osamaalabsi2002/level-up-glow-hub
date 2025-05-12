
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Scissors, User, PenTool, Heart, Sparkles, Calendar } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ServiceCategory {
  icon: JSX.Element;
  name: string;
  description: string;
  popular: string[];
}

const getIconByCategory = (category: string) => {
  switch(category.toLowerCase()) {
    case 'hair styling':
      return <Scissors className="h-8 w-8 text-salon-green" />;
    case 'color & highlights':
      return <PenTool className="h-8 w-8 text-salon-green" />;
    case 'skin & beauty':
      return <Sparkles className="h-8 w-8 text-salon-green" />;
    case 'nail care':
      return <Heart className="h-8 w-8 text-salon-green" />;
    default:
      return <Scissors className="h-8 w-8 text-salon-green" />;
  }
};

// Initial categories structure
const initialServiceCategories = [
  {
    icon: <Scissors className="h-8 w-8 text-salon-red" />,
    name: 'Hair Styling',
    description: 'Expert hair styling services for all hair types.',
    popular: [] as string[]
  },
  {
    icon: <PenTool className="h-8 w-8 text-salon-green" />,
    name: 'Color & Highlights',
    description: 'Transform your look with our premium color services.',
    popular: [] as string[]
  },
  {
    icon: <Sparkles className="h-8 w-8 text-salon-green" />,
    name: 'Skin & Beauty',
    description: 'Rejuvenate your skin with our facial treatments.',
    popular: [] as string[]
  },
  {
    icon: <Heart className="h-8 w-8 text-salon-green" />,
    name: 'Nail Care',
    description: 'Pamper yourself with our nail services.',
    popular: [] as string[]
  }
];

const Services = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(initialServiceCategories);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select('*');
          
        if (error) throw error;

        if (data && data.length > 0) {
          // Group services by category (assuming service name contains category)
          const servicesByCategoryMap = new Map<string, string[]>();
          
          data.forEach(service => {
            // Logic to determine which category a service belongs to
            let category = 'Hair Styling'; // Default category
            
            const serviceName = service.name.toLowerCase();
            if (serviceName.includes('color') || serviceName.includes('highlight') || serviceName.includes('dye')) {
              category = 'Color & Highlights';
            } else if (serviceName.includes('skin') || serviceName.includes('facial') || serviceName.includes('makeup')) {
              category = 'Skin & Beauty';
            } else if (serviceName.includes('nail') || serviceName.includes('manicure') || serviceName.includes('pedicure')) {
              category = 'Nail Care';
            }
            
            if (!servicesByCategoryMap.has(category)) {
              servicesByCategoryMap.set(category, []);
            }
            
            const existingServices = servicesByCategoryMap.get(category) || [];
            existingServices.push(service.name);
            servicesByCategoryMap.set(category, existingServices);
          });
          
          // Update the service categories with the real data
          const updatedCategories = serviceCategories.map(category => {
            const servicesInCategory = servicesByCategoryMap.get(category.name) || [];
            return {
              ...category,
              popular: servicesInCategory.slice(0, 3) // Take up to 3 popular services
            };
          });
          
          setServiceCategories(updatedCategories);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [serviceCategories]); // Include serviceCategories in the dependency array

  return (
    <section className="py-20 bg-white" id="services">
      <div className="container mx-auto px-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {serviceCategories.map((category, index) => (
              <div 
                key={category.name}
                className="service-card relative overflow-hidden" 
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative z-10">
                  <div className="p-2 mb-4 inline-block bg-gold/10 rounded-lg">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-salon-green mb-3">{category.name}</h3>
                  <p className="text-gray-600 mb-6">{category.description}</p>
                  
                  <div className={`transition-all duration-500 ${hoveredIndex === index ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'} overflow-hidden`}>
                    {category.popular.length > 0 ? (
                      <>
                        <p className="font-medium text-salon-green mb-2">Popular Services:</p>
                        <ul className="space-y-1">
                          {category.popular.map(service => (
                            <li key={service} className="flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-gold mr-2"></div>
                              <span className="text-gray-700">{service}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-gray-500">No services available in this category yet.</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  className={`mt-6 bg-salon-green hover:bg-salon-darkGreen text-white w-full transition-all duration-300 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-80'
                  }`}
                  onClick={() => navigate('/services')}
                >
                  View All {category.name} Services
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gold hover:bg-gold-dark text-white px-8"
            onClick={() => navigate('/services')}
          >
            <Calendar className="mr-2 h-5 w-5" /> Book Your Appointment
          </Button>
        </div>
    </section>
  );
};

export default Services;
