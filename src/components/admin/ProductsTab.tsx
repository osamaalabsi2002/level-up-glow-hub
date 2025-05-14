
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Edit, Trash2, Plus, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductFormModal from "./ProductFormModal";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image_url: string;
  created_at?: string;
}

const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setShowAddModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);
      
      if (error) throw error;
      
      toast.success('Product deleted successfully');
      setProducts(products.filter(product => product.id !== productToDelete));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setProductToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const closeFormModal = () => {
    setShowAddModal(false);
    setProductToEdit(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Products Management</h2>
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="bg-salon-green hover:bg-salon-darkGreen text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <span className="font-bold text-salon-green">${product.price.toFixed(2)}</span>
                </div>
                {product.description && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="p-4 pt-0 border-t border-gray-100 mt-auto flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-500 hover:bg-red-50 text-red-500"
                  onClick={() => handleDeleteClick(product.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </Card>
          ))}
          
          {products.length === 0 && (
            <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
              <div className="mt-6">
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-salon-green hover:bg-salon-darkGreen text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New Product
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <ProductFormModal
          isOpen={showAddModal}
          onClose={closeFormModal}
          onSuccess={fetchProducts}
          productToEdit={productToEdit || undefined}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsTab;
