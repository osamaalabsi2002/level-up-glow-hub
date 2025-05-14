
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CartDialog from "@/components/CartDialog";
import { useAuth } from "@/context/AuthContext";
import ProductFormModal from "@/components/admin/ProductFormModal";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image_url: string;
  rating?: number;
  category?: string;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  // Categories derived from products
  const [categories, setCategories] = useState<string[]>(["All"]);

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Fetch cart items count
  useEffect(() => {
    if (user) {
      fetchCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Add fake rating and category for display purposes
      const productsWithMeta = data.map((product) => ({
        ...product,
        rating: parseFloat((4 + Math.random()).toFixed(1)),
        category: ['Hair Care', 'Styling', 'Treatment'][Math.floor(Math.random() * 3)]
      }));
      
      setProducts(productsWithMeta);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(productsWithMeta.map(p => p.category || ''))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCartCount = async () => {
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

  const addToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      return;
    }
    
    try {
      // Check if product already in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('orders')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingItem) {
        // Update quantity if already in cart
        const { error } = await supabase
          .from('orders')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Add new item to cart
        const { error } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          });
        
        if (error) throw error;
      }
      
      // Update cart count
      fetchCartCount();
      
      toast.success(`Added to cart`, {
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setShowAddModal(true);
  };
  
  const closeFormModal = () => {
    setShowAddModal(false);
    setProductToEdit(null);
  };

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-salon-green mb-4">Salon Shop</h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover professional-grade salon products we use and recommend for maintaining 
              your gorgeous look at home.
            </p>
          </div>
          
          {/* Admin Actions */}
          {isAdmin && (
            <div className="mb-6">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-salon-green hover:bg-salon-darkGreen text-white"
              >
                + Add New Product
              </Button>
            </div>
          )}
          
          {/* Category Filter and Cart Summary */}
          <div className="flex flex-wrap justify-between items-center mb-8">
            <div className="flex flex-wrap justify-center gap-2 mb-4 md:mb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-salon-green text-white"
                      : "bg-white text-salon-green hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="flex items-center">
              <span className="text-salon-green mr-2">Cart: {cartItemCount} items</span>
              <Button 
                variant="outline" 
                className="border-gold"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> View Cart
              </Button>
            </div>
          </div>
          
          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {product.category || 'Product'}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-gold text-gold" />
                          <span className="text-xs ml-1">{product.rating || 4.5}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      )}
                      <p className="font-semibold text-salon-green">${product.price}</p>
                    </CardContent>
                    <CardFooter className="mt-auto flex flex-col space-y-2">
                      <Button 
                        onClick={() => addToCart(product)} 
                        className="w-full bg-salon-green hover:bg-salon-darkGreen"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                      </Button>
                      
                      {isAdmin && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit Product
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">No products found in this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      
      {/* Cart Dialog */}
      <CartDialog isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      
      {/* Product Form Modal for Admins */}
      {showAddModal && (
        <ProductFormModal
          isOpen={showAddModal}
          onClose={closeFormModal}
          onSuccess={fetchProducts}
          productToEdit={productToEdit || undefined}
        />
      )}
    </div>
  );
};

export default Shop;
