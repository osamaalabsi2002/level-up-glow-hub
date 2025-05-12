
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: 'Emma Wilson',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    role: 'Regular Client',
    rating: 5,
    text: "I've been coming to Level Up for over a year, and every experience has been wonderful. Sarah always knows exactly what I need for my hair type, and the results are consistently amazing!"
  },
  {
    id: 2,
    name: 'James Parker',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    role: 'New Client',
    rating: 5,
    text: "As someone who's always been hesitant about trying new barbers, I was blown away by the level of service at Level Up. Michael gave me the best haircut I've had in years, and I'll definitely be returning!"
  },
  {
    id: 3,
    name: 'Sophia Rodriguez',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    role: 'Regular Client',
    rating: 4,
    text: "The entire team at Level Up is professional, friendly, and incredibly skilled. I always leave feeling fantastic and looking my best. Their attention to detail is unmatched!"
  },
  {
    id: 4,
    name: 'David Chen',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    role: 'Monthly Client',
    rating: 5,
    text: "From the moment you walk in, the atmosphere is welcoming and luxurious. My grooming routine has completely changed since discovering Level Up, and I couldn't be happier with the results."
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const testimonialRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    
    return () => clearInterval(interval);
  }, [currentIndex]);
  
  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <section className="py-20 bg-salon-green text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gold"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gold"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 text-white">
            What Our Clients Say
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Real experiences from our valued clients who've experienced the Level Up difference.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div 
            className="overflow-hidden"
            ref={testimonialRef}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-xl shadow-lg p-8 text-gray-800 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                    <div className="absolute -top-5 -left-5 bg-gold text-white p-3 rounded-full">
                      <Quote className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-shrink-0">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-20 h-20 object-cover rounded-full border-4 border-gold-light"
                      />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-gray-600 italic mb-4">{testimonial.text}</p>
                      
                      <div className="mb-2 flex justify-center md:justify-start">
                        {[...Array(5)].map((_, index) => (
                          <Star 
                            key={index}
                            className={`w-4 h-4 ${
                              index < testimonial.rating ? 'text-gold fill-gold' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <h4 className="font-semibold text-salon-green">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handlePrev}
            className="absolute top-1/2 -left-5 transform -translate-y-1/2 bg-white text-salon-green rounded-full p-2 shadow-md hover:bg-salon-green hover:text-white transition-colors duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute top-1/2 -right-5 transform -translate-y-1/2 bg-white text-salon-green rounded-full p-2 shadow-md hover:bg-salon-green hover:text-white transition-colors duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (isAnimating) return;
                setIsAnimating(true);
                setCurrentIndex(index);
                setTimeout(() => setIsAnimating(false), 500);
              }}
              className={`w-3 h-3 mx-1 rounded-full ${
                currentIndex === index ? 'bg-gold' : 'bg-white/30'
              } transition-all duration-200`}
              aria-label={`Go to testimonial ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
