import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Calendar, LayoutDashboard, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/BookingModal";
import AuthModal from "@/components/AuthModal";
import CartDialog from "@/components/CartDialog";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Save the logo to public directory
const LOGO_PATH = "/lovable-uploads/7fe1509b-7ee8-496f-abe2-2976dd100e53.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const location = useLocation();
  const { user, profile, signOut, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Fetch cart item count for logged in user
  useEffect(() => {
    if (user) {
      fetchCartItemCount();
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  const fetchCartItemCount = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('quantity')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const count = data.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Stylists', path: '/stylists' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];
  
  // Add admin link if user is admin by role
  if (isAdmin()) {
    // Check if Admin link already exists
    if (!navLinks.some(link => link.path === '/admin-dashboard')) {
      navLinks.push({ name: 'Admin', path: '/admin-dashboard' });
    }
  }

  const dashboardLinks = [
    { name: 'Stylist Dashboard', path: '/stylist-dashboard', icon: LayoutDashboard, role: 'stylist' },
    { name: 'Admin Dashboard', path: '/admin-dashboard', icon: LayoutDashboard, role: 'admin' },
  ];
  const filteredDashboardLinks = dashboardLinks.filter(link => {
    if (!user) return false;
    // Check profile role
    if (!profile) return false;
    return profile.role === 'admin' || link.role === profile.role;
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleSignOut = () => signOut();

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={LOGO_PATH} alt="Level Up Beauty Salon" className="h-12 md:h-16" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-salon-green hover:text-gold transition-colors duration-200 font-medium ${
                location.pathname === link.path ? 'text-gold' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="border-gold text-salon-green" onClick={() => setBookingModalOpen(true)}>
            <Calendar className="mr-1 h-4 w-4" /> Book Now
          </Button>
          
          {/* Cart Button with Counter */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-salon-green relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-salon-green rounded-full px-3 py-1">
                  {/* Show user's name instead of icon */}
                  <span className="font-medium">{profile?.full_name || user.email.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.full_name || user.email}
                  {profile?.role === 'admin' && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/appointments">My Appointments</Link>
                </DropdownMenuItem>
                {filteredDashboardLinks.map(link => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link to={link.path} className="flex items-center">
                      <link.icon className="h-4 w-4 mr-2" />
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="text-salon-green" onClick={() => setAuthModalOpen(true)}>
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden text-salon-green" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 animate-slide-in-right">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-salon-green py-2 hover:text-gold transition-colors duration-200 font-medium ${
                    location.pathname === link.path ? 'text-gold' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <hr className="my-2 border-gray-200" />

              {user && filteredDashboardLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-salon-green py-2 hover:text-gold transition-colors duration-200 font-medium flex items-center"
                >
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.name}
                </Link>
              ))}

              <div className="flex items-center justify-between py-2">
                <span className="text-salon-green">Your Cart</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-salon-green"
                  onClick={() => { setCartOpen(true); setIsMenuOpen(false); }}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  View Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </Button>
              </div>

              {user ? (
                <>
                  <Link to="/profile" className="text-salon-green py-2 hover:text-gold flex items-center">
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Link>
                  <Link to="/appointments" className="text-salon-green py-2 hover:text-gold flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> My Appointments
                  </Link>
                  <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <Button className="bg-salon-green text-white w-full" onClick={() => { setAuthModalOpen(true); setIsMenuOpen(false); }}>
                  <User className="mr-2 h-4 w-4" /> Login / Register
                </Button>
              )}
              {profile?.role !== 'admin' && (
                <Button variant="outline" className="border-gold text-salon-green w-full" onClick={() => { setBookingModalOpen(true); setIsMenuOpen(false); }}>
                  <Calendar className="mr-2 h-4 w-4" /> Book Appointment
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <CartDialog isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Navbar;
