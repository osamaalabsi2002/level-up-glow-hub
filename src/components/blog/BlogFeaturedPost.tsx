
import { CalendarDays, User, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BlogPost } from "@/hooks/useBlogData";

interface BlogFeaturedPostProps {
  post: BlogPost;
  isAdminOrStylist: boolean;
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: number) => void;
}

const BlogFeaturedPost = ({ 
  post, 
  isAdminOrStylist, 
  onEdit, 
  onDelete 
}: BlogFeaturedPostProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md mb-12">
      <div className="md:flex">
        <div className="md:w-1/2">
          <img 
            src={post.image_url || "/placeholder.svg"} 
            alt="Featured post" 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <span className="text-xs font-medium text-salon-green bg-salon-green/10 px-3 py-1 rounded-full inline-block mb-4">FEATURED POST</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-salon-green">{post.title}</h2>
          <p className="text-gray-600 mb-6">{post.excerpt}</p>
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <User className="h-4 w-4 mr-1" />
            <span className="mr-4">{post.author?.full_name || "Anonymous"}</span>
            <CalendarDays className="h-4 w-4 mr-1" />
            <span className="mr-4">{new Date(post.created_at).toLocaleDateString()}</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{post.read_time || 5} min read</span>
          </div>
          <div className="flex space-x-4">
            <Button 
              className="bg-salon-green hover:bg-salon-darkGreen"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              Read Article <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            
            {isAdminOrStylist && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(post)}
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this post?")) {
                      onDelete(post.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogFeaturedPost;
