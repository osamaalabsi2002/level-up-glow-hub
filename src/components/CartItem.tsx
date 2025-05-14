
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartItemProps {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  userId: string;
  onUpdate: () => void;
}

const CartItem = ({ 
  id, 
  productId, 
  name, 
  price, 
  quantity, 
  image, 
  userId, 
  onUpdate 
}: CartItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    
    try {
      if (newQuantity === 0) {
        await handleRemove();
        return;
      }
      
      const { error } = await supabase
        .from('orders')
        .update({ quantity: newQuantity })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      onUpdate();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success(`${name} removed from cart`);
      onUpdate();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex py-4 border-b last:border-b-0">
      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>
      
      <div className="ml-4 flex-grow">
        <h4 className="font-medium">{name}</h4>
        <div className="text-salon-green font-semibold mt-1">${price.toFixed(2)}</div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              size="icon" 
              variant="outline" 
              className="h-8 w-8" 
              onClick={() => updateQuantity(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="mx-3 w-8 text-center">{quantity}</span>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-8 w-8"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
