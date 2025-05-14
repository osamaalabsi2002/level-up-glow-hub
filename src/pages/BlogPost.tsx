
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, ArrowLeft, Edit, Trash } from "lucide-react";
import { useBlogPost } from "@/hooks/useBlogData";
import { useBlogOperations } from "@/hooks/useBlogOperations";
import { useAuth } from "@/context/AuthContext";
import BlogPostFormModal from "@/components/blog/BlogPostFormModal";
import { format } from "date-fns";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  const { deletePost } = useBlogOperations();
  
  const isAdminOrStylist = profile?.role === "admin" || profile?.role === "stylist";
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Loading post...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-500 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/blog")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = post.created_at ? format(new Date(post.created_at), 'MMMM d, yyyy') : '';

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost.mutateAsync(post.id);
        navigate("/blog");
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Back to Blog */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate("/blog")} className="text-salon-green">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Button>
          </div>
          
          {/* Admin Controls */}
          {isAdminOrStylist && (
            <div className="flex justify-end mb-6 space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          )}
          
          {/* Featured Image */}
          <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
            <img
              src={post.image_url || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Link 
                to={`/blog?category=${post.category?.slug || "all"}`} 
                className="text-sm font-medium text-salon-green bg-salon-green/10 px-3 py-1 rounded-full hover:bg-salon-green/20"
              >
                {post.category?.name || "Uncategorized"}
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-salon-green mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-x-4 gap-y-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder.svg" alt={post.author?.full_name || "Anonymous"} />
                  <AvatarFallback>{post.author?.full_name?.[0] || "A"}</AvatarFallback>
                </Avatar>
                <span>{post.author?.full_name || "Anonymous"}</span>
              </div>
              
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{post.read_time || 5} min read</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm">
            {/* Post Content */}
            <div className="prose max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <Separator className="my-8" />
            
            {/* Author Bio (simplified) */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg" alt={post.author?.full_name || "Anonymous"} />
                <AvatarFallback>{post.author?.full_name?.[0] || "A"}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold">{post.author?.full_name || "Anonymous"}</h4>
                <p className="text-sm text-gray-500">Author</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Post Modal */}
      <BlogPostFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        post={post} 
      />
      
      <Footer />
    </div>
  );
};

export default BlogPost;
