
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CartItem from "./CartItem";

interface CartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartProduct {
  id: number;
  product_id: number;
  quantity: number;
  products: {
    name: string;
    price: number;
    image_url: string;
  };
}

const CartDialog = ({ isOpen, onClose }: CartDialogProps) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          product_id,
          quantity,
          products (
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchCartItems();
    }
  }, [isOpen, user]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    toast.success('Checkout functionality coming soon!');
    // Implement checkout logic here
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Cart</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            Please sign in to view your cart.
            <div className="mt-4">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" /> Your Cart
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center">Loading your cart items...</div>
        ) : cartItems.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Browse our shop to find amazing products!
            </p>
            <div className="mt-6">
              <Button onClick={onClose} className="bg-salon-green hover:bg-salon-darkGreen text-white">
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    productId={item.product_id}
                    name={item.products.name}
                    price={item.products.price}
                    quantity={item.quantity}
                    image={item.products.image_url}
                    userId={user.id}
                    onUpdate={fetchCartItems}
                  />
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-salon-green">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Continue Shopping
                </Button>
                <Button 
                  className="bg-salon-green hover:bg-salon-darkGreen text-white"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartDialog;
