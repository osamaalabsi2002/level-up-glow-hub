import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Star } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import { supabase } from "@/integrations/supabase/client";
import { Stylist } from "@/types/dashboard";

const Stylists = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedStylistId, setSelectedStylistId] = useState<number>(0);
  const [selectedStylistName, setSelectedStylistName] = useState<string>("");

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('stylists')
          .select('*');
          
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
    setSelectedStylistId(stylist.id);
    setSelectedStylistName(stylist.name);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-salon-green mb-4">Our Expert Stylists</h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet our team of professional stylists dedicated to bringing out your natural beauty
              and helping you look and feel your best.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p>Loading stylists...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stylists.length > 0 ? (
                stylists.map((stylist) => (
                  <Card key={stylist.id} className="overflow-hidden border border-gray-200">
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                      <img
                        src={stylist.image || "/placeholder.svg"}
                        alt={stylist.name}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-bold text-salon-green">{stylist.name}</h2>
                      <p className="text-gold font-medium mt-1">{stylist.role}</p>
                      
                      <div className="flex items-center mt-2 text-sm">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(stylist.rating) ? "text-gold fill-gold" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-500">({stylist.reviews} reviews)</span>
                      </div>
                      
                      <div className="mt-4">
                        <CardDescription className="line-clamp-3">
                          {stylist.bio || "Expert stylist with a passion for creating beautiful looks."}
                        </CardDescription>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-0">
                      <Button asChild className="flex-1 bg-salon-green hover:bg-salon-darkGreen">
                        <Link to={`/stylist/${stylist.id}`}>View Profile</Link>
                      </Button>
                      <Button 
                        className="flex-1 bg-gold hover:bg-gold/90 text-white"
                        onClick={() => handleBookClick(stylist)}
                      >
                        <Calendar className="h-4 w-4 mr-2" /> Book
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p>No stylists found. Please check back later.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="text-center mt-12 p-8 bg-salon-green/5 rounded-lg">
            <h2 className="text-2xl font-bold text-salon-green mb-3">Join Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Are you a passionate hair stylist, makeup artist, or beauty professional? 
              We're always looking for talented individuals to join our growing team!
            </p>
            <Button variant="outline" className="border-gold text-salon-green">
              Apply Now
            </Button>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={bookingModalOpen} 
        onClose={() => setBookingModalOpen(false)} 
        stylistName={selectedStylistName}
        stylistId={selectedStylistId}
      />
    </div>
  );
};

export default Stylists;
