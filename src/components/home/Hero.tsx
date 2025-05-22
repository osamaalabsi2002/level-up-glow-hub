
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-20 bg-gradient-to-b from-white to-gray-50">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className={`space-y-6 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-salon-green">Elevate</span> Your Beauty Experience
            </h1>
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
              Where luxury meets exceptional care. Our expert stylists deliver premium beauty services 
              tailored to enhance your unique style and confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-salon-green hover:bg-salon-darkGreen text-white text-lg py-6">
                <Calendar className="mr-2 h-5 w-5" /> Book Appointment
              </Button>
              <Button variant="outline" className="border-gold hover:bg-gold/10 text-salon-green text-lg py-6">
                Explore Services
              </Button>
            </div>
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-salon-green">15+</div>
                <div className="text-gray-600 text-sm">Expert Stylists</div>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-salon-green">50+</div>
                <div className="text-gray-600 text-sm">Beauty Services</div>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-salon-green">1000+</div>
                <div className="text-gray-600 text-sm">Happy Clients</div>
              </div>
            </div>
          </div>
          
          <div className={`relative transition-all duration-1000 ease-out delay-300 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
            <div className="rounded-3xl overflow-hidden border-4 border-white shadow-xl relative aspect-[3/4]">
              <img 
                src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Beauty salon professional"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-3 shadow-lg border border-gold-light">
              <div className="flex items-center">
                <div className="bg-green-100 text-salon-green rounded-full p-2 mr-3">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-salon-green font-medium">Next Available</p>
                  <p className="text-sm text-gray-600">Today, 2:00 PM</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl py-2 px-4 shadow-lg border border-gold-light">
              <div className="flex flex-col items-center">
                <p className="text-gold font-bold text-xl">20% OFF</p>
                <p className="text-sm text-gray-600">First Visit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
