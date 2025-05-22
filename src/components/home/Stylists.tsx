import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Star, Calendar, Instagram } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Stylist } from "@/types/dashboard";
import BookingModal from '@/components/BookingModal';
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const Stylists = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean, 
    stylistName: string,
    stylistId?: number
  }>({
    isOpen: false,
    stylistName: '',
    stylistId: undefined
  });

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('stylists')
          .select('*')
          .limit(3); // Only get the first 3 stylists for the homepage
          
        if (error) throw error;
        
        // Transform data to ensure it matches the Stylist interface
        const transformedData: Stylist[] = data.map(stylist => ({
          ...stylist,
          services: [],
          clientReviews: []
        }));
        
        setStylists(transformedData);
      } catch (error) {
        console.error('Error fetching stylists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStylists();
  }, []);

  const handleBookClick = (stylist: Stylist) => {
    if (!user) {
      // Show a toast notification
      toast({
        title: "Authentication required",
        description: "Please sign in or create an account to book an appointment.",
        variant: "destructive",
      });
      
      // Redirect to login
      navigate('/login');
      return;
    }
    
    setBookingModal({
      isOpen: true,
      stylistName: stylist.name,
      stylistId: stylist.id
    });
  };

  const closeBookingModal = () => {
    setBookingModal({
      ...bookingModal,
      isOpen: false
    });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="salon-heading mb-3">Meet Our Experts</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team of skilled and passionate beauty professionals are dedicated to 
            helping you look and feel your absolute best.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading stylists...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 stagger-children">
            {stylists.length > 0 ? (
              stylists.map((stylist, index) => (
                <div 
                  key={stylist.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:border-gold-light transition-all duration-300"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <Link to={`/stylist/${stylist.id}`} className="block relative h-64 overflow-hidden">
                    <img 
                      src={stylist.image} 
                      alt={stylist.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        activeIndex === index ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
                      activeIndex === index ? 'opacity-100' : 'opacity-70'
                    }`}>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="text-gold fill-gold" />
                            <span className="text-white font-medium ml-1">{stylist.rating}</span>
                            <span className="text-gray-300 ml-1">({stylist.reviews})</span>
                          </div>
                          {stylist.available ? (
                            <span className="bg-green-100 text-salon-green text-xs px-2 py-1 rounded-full">
                              Available Today
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              Booked Today
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <Link to={`/stylist/${stylist.id}`}>
                      <h3 className="font-serif text-xl font-semibold text-salon-green mb-1 hover:text-gold transition-colors">{stylist.name}</h3>
                    </Link>
                    <p className="text-gold text-sm mb-3">{stylist.role}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-700 text-sm font-medium mb-2">Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {stylist.specialties.map(specialty => (
                            <span 
                              key={specialty}
                              className="text-xs bg-salon-green/10 text-salon-green px-2 py-1 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm">{stylist.bio || "Expert stylist with years of experience."}</p>
                      
                      <div className="pt-2 flex justify-between items-center">
                        <Button 
                          className="bg-salon-green hover:bg-salon-darkGreen text-white"
                          onClick={() => handleBookClick(stylist)}
                        >
                          <Calendar className="mr-2 h-4 w-4" /> Book
                        </Button>
                        <Button 
                          variant="ghost"
                          className="text-gray-500 hover:text-gold"
                        >
                          <Instagram className="mr-2 h-4 w-4" /> Portfolio
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p>No stylists found. Please check back later.</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <Link to="/stylists">
            <Button variant="outline" className="border-gold text-salon-green hover:bg-gold/10">
              View All Stylists
            </Button>
          </Link>
        </div>
      </div>

      <BookingModal 
        isOpen={bookingModal.isOpen} 
        onClose={closeBookingModal} 
        stylistName={bookingModal.stylistName}
        stylistId={bookingModal.stylistId}
      />
    </section>
  );
};

export default Stylists;
