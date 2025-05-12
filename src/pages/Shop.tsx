
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

// Sample product data
const products = [
  {
    id: 1,
    name: "Rejuvenating Shampoo",
    price: 24.99,
    image: "/placeholder.svg",
    rating: 4.8,
    category: "Hair Care"
  },
  {
    id: 2,
    name: "Hydrating Conditioner",
    price: 22.99,
    image: "/placeholder.svg",
    rating: 4.7,
    category: "Hair Care"
  },
  {
    id: 3,
    name: "Styling Mousse",
    price: 18.50,
    image: "/placeholder.svg",
    rating: 4.5,
    category: "Styling"
  },
  {
    id: 4,
    name: "Heat Protection Spray",
    price: 19.99,
    image: "/placeholder.svg",
    rating: 4.6,
    category: "Styling"
  },
  {
    id: 5,
    name: "Hair Serum",
    price: 29.99,
    image: "/placeholder.svg",
    rating: 4.9,
    category: "Treatment"
  },
  {
    id: 6,
    name: "Scalp Treatment",
    price: 34.99,
    image: "/placeholder.svg",
    rating: 4.7,
    category: "Treatment"
  },
  {
    id: 7,
    name: "Curl Defining Cream",
    price: 21.99,
    image: "/placeholder.svg",
    rating: 4.6,
    category: "Styling"
  },
  {
    id: 8,
    name: "Hairspray",
    price: 16.99,
    image: "/placeholder.svg",
    rating: 4.5,
    category: "Styling"
  },
];

const categories = ["All", "Hair Care", "Styling", "Treatment"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState<number>(0);

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(product => product.category === selectedCategory);
    
  const addToCart = (product: any) => {
    setCartItems(prev => prev + 1);
    toast.success(`Added to cart`, {
      description: `${product.name} has been added to your cart.`,
    });
  };

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
              <span className="text-salon-green mr-2">Cart: {cartItems} items</span>
              <Button variant="outline" className="border-gold">
                <ShoppingCart className="mr-2 h-4 w-4" /> View Cart
              </Button>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      <span className="text-xs ml-1">{product.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="font-semibold text-salon-green">${product.price}</p>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button 
                    onClick={() => addToCart(product)} 
                    className="w-full bg-salon-green hover:bg-salon-darkGreen"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
