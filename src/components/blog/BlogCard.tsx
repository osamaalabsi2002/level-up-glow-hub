
import { CalendarDays, User, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/hooks/useBlogData";
import { Link } from "react-router-dom";
import { format } from "date-fns";

type BlogCardProps = {
  post: BlogPost;
  showControls?: boolean;
  onEdit?: (post: BlogPost) => void;
  onDelete?: (postId: number) => void;
};

const BlogCard = ({ post, showControls, onEdit, onDelete }: BlogCardProps) => {
  const formattedDate = post.created_at ? format(new Date(post.created_at), 'MMMM d, yyyy') : '';
  
  return (
    <Card className="overflow-hidden border border-gray-200 h-full flex flex-col">
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={post.image_url || "/placeholder.svg"}
          alt={post.title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
            {post.category?.name || "Uncategorized"}
          </span>
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> {post.read_time || 5} min read
          </span>
        </div>
        <CardTitle className="text-xl">
          <Link to={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center text-xs space-x-2 mt-2">
          <User className="h-3 w-3" />
          <span>{post.author?.full_name || "Anonymous"}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="mt-auto flex justify-between items-center">
        <Button variant="ghost" className="text-salon-green hover:text-salon-darkGreen p-0" asChild>
          <Link to={`/blog/${post.slug}`}>
            Read More <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
        
        {showControls && (
          <div className="flex space-x-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(post)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this post?")) {
                    onDelete(post.id);
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
