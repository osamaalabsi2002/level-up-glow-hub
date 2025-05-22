
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-salon-green text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <h3 className="text-gold text-xl font-serif font-bold">Level Up Beauty Salon</h3>
            <p className="text-sm text-gray-200">
              Elevate your beauty experience with our premium salon services. 
              From hair styling to skin treatments, we help you look and feel your best.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-white hover:text-gold transition-colors duration-200">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-gold transition-colors duration-200">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-gold transition-colors duration-200">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-gold text-xl font-serif font-bold">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Services', 'Stylists', 'Shop', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`} className="text-gray-200 hover:text-gold transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-gold text-xl font-serif font-bold">Our Services</h3>
            <ul className="space-y-2">
              {['Hair Styling', 'Haircuts', 'Color & Highlights', 'Makeup', 'Facials', 'Manicure & Pedicure'].map((service) => (
                <li key={service}>
                  <Link to="/services" className="text-gray-200 hover:text-gold transition-colors duration-200">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-gold text-xl font-serif font-bold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="text-gold mr-2 h-5 w-5 mt-0.5" />
                <p className="text-gray-200">123 Beauty Street, Salon City, SC 12345</p>
              </div>
              <div className="flex items-center">
                <Phone className="text-gold mr-2 h-5 w-5" />
                <p className="text-gray-200">(555) 123-4567</p>
              </div>
              <div className="flex items-center">
                <Mail className="text-gold mr-2 h-5 w-5" />
                <p className="text-gray-200">info@levelupbeauty.com</p>
              </div>
              <div className="flex items-start">
                <Clock className="text-gold mr-2 h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-gray-200">Mon-Sat: 9:00 AM - 8:00 PM</p>
                  <p className="text-gray-200">Sunday: 10:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-300">
            &copy; {currentYear} Level Up Beauty Salon. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <Link to="/privacy-policy" className="text-sm text-gray-300 hover:text-gold transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-300 hover:text-gold transition-colors duration-200">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
