
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Mail } from "lucide-react";

const CtaSection = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-salon-green/85"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 md:p-12 shadow-xl border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Experience the Level Up Difference?</h2>
              <p className="text-gray-200 mb-6">
                Book your appointment today and let our expert stylists help you look and feel your absolute best.
                First-time clients receive a special 20% discount on all services.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="text-gold mr-3 h-5 w-5" />
                  <p className="text-white">(555) 123-4567</p>
                </div>
                <div className="flex items-center">
                  <Mail className="text-gold mr-3 h-5 w-5" />
                  <p className="text-white">appointments@levelupbeauty.com</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
              <h3 className="text-salon-green text-xl font-serif font-semibold mb-4">Book Your Appointment</h3>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-salon-green"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm mb-1 block">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-salon-green"
                      placeholder="Your phone"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-salon-green"
                    placeholder="Your email"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm mb-1 block">Service</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-salon-green bg-white">
                      <option value="">Select a service</option>
                      <option value="haircut">Haircut & Styling</option>
                      <option value="color">Hair Color</option>
                      <option value="facial">Facial Treatment</option>
                      <option value="manicure">Manicure & Pedicure</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm mb-1 block">Preferred Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-salon-green"
                    />
                  </div>
                </div>
                
                <Button className="w-full bg-salon-green hover:bg-salon-darkGreen text-white py-6">
                  <Calendar className="mr-2 h-5 w-5" /> Book Appointment
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  By booking an appointment, you agree to our terms and policies.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
