
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogHeaderProps {
  isAdminOrStylist: boolean;
  onCreatePost: () => void;
}

const BlogHeader = ({ isAdminOrStylist, onCreatePost }: BlogHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-salon-green mb-4">Beauty Blog</h1>
      <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Discover the latest trends, tips, and insider knowledge from our experienced stylists 
        to keep your hair and beauty routine at its best.
      </p>
      
      {/* Admin/Stylist Controls */}
      {isAdminOrStylist && (
        <div className="mt-8">
          <Button 
            onClick={onCreatePost} 
            className="bg-salon-green hover:bg-salon-darkGreen"
          >
            <Plus className="mr-2 h-4 w-4" /> New Blog Post
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogHeader;
