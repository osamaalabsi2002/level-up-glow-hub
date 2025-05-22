
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  initialImage?: string;
  className?: string;
}

export function ImageUpload({ onImageUpload, initialImage, className }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Generate a unique filename to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('stylist-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('stylist-images')
        .getPublicUrl(filePath);

      setSelectedImage(publicUrl);
      onImageUpload(publicUrl);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    // Don't delete from storage here as other references might exist
    // Just remove the local reference
    setSelectedImage(null);
    onImageUpload(''); // Pass empty string to clear the image
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedImage ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <img 
            src={selectedImage} 
            alt="Stylist" 
            className="w-full h-[200px] object-cover" 
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          onClick={triggerFileInput}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-[200px] bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-1">Click to upload an image</p>
          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button 
          type="button" 
          variant="outline"
          disabled={uploading}
          onClick={triggerFileInput}
          className="text-sm"
        >
          {uploading ? "Uploading..." : (selectedImage ? "Change Image" : "Select Image")}
        </Button>
      </div>
    </div>
  );
}
