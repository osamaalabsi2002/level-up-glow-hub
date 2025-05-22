
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, Instagram, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// This would typically come from an API, using static data for now
import { getStylist, getStylistPortfolio } from "@/data/stylists";

const StylistDetail = () => {
  const { id } = useParams();
  const [stylist, setStylist] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (id) {
      // Fetch stylist data
      const stylistData = getStylist(parseInt(id));
      const portfolioData = getStylistPortfolio(parseInt(id));
      
      setStylist(stylistData);
      setPortfolio(portfolioData);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-salon-green">Loading stylist information...</div>
      </div>
    );
  }

  if (!stylist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl text-salon-green mb-4">Stylist Not Found</h1>
        <Link to="/">
          <Button className="bg-gold hover:bg-gold-dark text-white">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero section */}
        <div className="bg-gray-50 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center text-salon-green hover:text-gold mb-8">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to All Stylists
            </Link>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Stylist image */}
              <div className="md:col-span-1">
                <div className="rounded-xl overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={stylist.image} 
                    alt={stylist.name}
                    className="w-full h-full object-cover aspect-[3/4]"
                  />
                </div>
              </div>
              
              {/* Stylist info */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="text-gold fill-gold h-5 w-5" />
                    <span className="text-salon-green font-medium ml-1">{stylist.rating}</span>
                    <span className="text-gray-500 ml-1">({stylist.reviews} reviews)</span>
                  </div>
                  {stylist.available ? (
                    <span className="bg-green-100 text-salon-green text-xs px-2 py-1 rounded-full ml-4">
                      Available Today
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full ml-4">
                      Booked Today
                    </span>
                  )}
                </div>
                
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-salon-green mb-1">
                  {stylist.name}
                </h1>
                <p className="text-gold text-lg mb-6">{stylist.role}</p>
                
                <div className="mb-6">
                  <h2 className="font-medium text-gray-800 mb-2">Specialties:</h2>
                  <div className="flex flex-wrap gap-2">
                    {stylist.specialties.map((specialty: string) => (
                      <span 
                        key={specialty}
                        className="text-sm bg-salon-green/10 text-salon-green px-3 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 leading-relaxed">
                  {stylist.bio}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-salon-green hover:bg-salon-darkGreen text-white px-8">
                    <Calendar className="mr-2 h-5 w-5" /> 
                    Book an Appointment
                  </Button>
                  <Button variant="outline" className="border-gold text-salon-green hover:bg-gold/10">
                    <Instagram className="mr-2 h-5 w-5" />
                    View Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs section */}
        <div className="container mx-auto px-4 py-12">
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              <button 
                className={`pb-4 px-1 font-medium ${
                  activeTab === 'about' 
                    ? 'text-salon-green border-b-2 border-salon-green' 
                    : 'text-gray-500 hover:text-salon-green'
                }`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
              <button 
                className={`pb-4 px-1 font-medium ${
                  activeTab === 'portfolio' 
                    ? 'text-salon-green border-b-2 border-salon-green' 
                    : 'text-gray-500 hover:text-salon-green'
                }`}
                onClick={() => setActiveTab('portfolio')}
              >
                Portfolio
              </button>
              <button 
                className={`pb-4 px-1 font-medium ${
                  activeTab === 'reviews' 
                    ? 'text-salon-green border-b-2 border-salon-green' 
                    : 'text-gray-500 hover:text-salon-green'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>
          </div>
          
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-salon-green mb-4">
                  Professional Background
                </h2>
                <p className="text-gray-700 mb-4">
                  With {stylist.experience || 5}+ years of experience in the beauty industry, {stylist.name} has established 
                  a reputation for excellence and creativity. Their journey began with formal training at a 
                  prestigious beauty academy, followed by apprenticeships with industry leaders.
                </p>
                <p className="text-gray-700">
                  Their approach combines technical precision with artistic vision, ensuring each client receives 
                  a personalized experience that enhances their natural features while reflecting current trends.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-serif font-semibold text-salon-green mb-4">
                  Services Offered
                </h2>
                <ul className="space-y-3">
                  {stylist.services?.map((service: any) => (
                    <li key={service.name} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-gray-800">{service.name}</span>
                      <span className="text-gold font-medium">${service.price}</span>
                    </li>
                  )) || (
                    <>
                      <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-gray-800">Consultation</span>
                        <span className="text-gold font-medium">$0</span>
                      </li>
                      <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-gray-800">Standard Service</span>
                        <span className="text-gold font-medium">$75</span>
                      </li>
                      <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-gray-800">Premium Service</span>
                        <span className="text-gold font-medium">$120</span>
                      </li>
                    </>
                  )}
                </ul>
                
                <div className="mt-6">
                  <Button className="w-full bg-salon-green hover:bg-salon-darkGreen text-white">
                    <Calendar className="mr-2 h-5 w-5" /> 
                    Schedule Now
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'portfolio' && (
            <div>
              <h2 className="text-2xl font-serif font-semibold text-salon-green mb-6">
                Portfolio Gallery
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolio.length > 0 ? (
                  portfolio.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md">
                      <img 
                        src={image} 
                        alt={`Portfolio work ${index + 1}`} 
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No portfolio images available yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-serif font-semibold text-salon-green mb-6">
                Client Reviews
              </h2>
              
              <div className="space-y-6">
                {stylist.clientReviews?.length > 0 ? (
                  stylist.clientReviews.map((review: any) => (
                    <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-gold fill-gold' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm">
                          {review.date || '2 months ago'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.text}</p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2">
                          {review.avatar && <img src={review.avatar} alt={review.name} className="w-8 h-8 rounded-full" />}
                        </div>
                        <span className="text-sm font-medium">{review.name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No reviews available yet.</p>
                    <Button variant="outline" className="mt-4 border-gold text-salon-green hover:bg-gold/10">
                      Be the First to Review
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StylistDetail;
