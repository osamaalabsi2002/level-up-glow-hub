
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: {
    id: number;
    name: string;
    price: number;
    description?: string;
    image_url: string;
  };
}

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0" }),
  description: z.string().optional(),
  image: z.instanceof(FileList).optional().transform(fileList => fileList && fileList.length > 0 ? fileList[0] : undefined),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const ProductFormModal = ({ isOpen, onClose, onSuccess, productToEdit }: ProductFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(productToEdit?.image_url || null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: productToEdit?.name || "",
      price: productToEdit?.price || 0,
      description: productToEdit?.description || "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      
      // Handle image upload if present
      let image_url = productToEdit?.image_url || "/placeholder.svg";
      
      if (data.image) {
        const file = data.image;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        image_url = publicUrlData.publicUrl;
      }
      
      // Create or update product
      if (productToEdit) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            price: data.price,
            description: data.description,
            image_url: image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', productToEdit.id);
        
        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: data.name,
            price: data.price,
            description: data.description,
            image_url: image_url,
          });
        
        if (error) throw error;
        toast.success("Product created successfully!");
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{productToEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="29.99" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter product description" 
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          <div className="border border-gray-200 rounded-md p-2 w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Product preview" 
                                className="max-h-full object-contain"
                              />
                            ) : (
                              <div className="text-gray-400 text-center">
                                No image selected
                              </div>
                            )}
                          </div>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              handleImageChange(e);
                              onChange(e.target.files);
                            }}
                            {...fieldProps}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-salon-green hover:bg-salon-darkGreen text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {productToEdit ? "Update" : "Create"} Product
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
