import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, Clock, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBlogPosts, useBlogCategories, BlogPost } from "@/hooks/useBlogData";
import { useBlogOperations } from "@/hooks/useBlogOperations";
import BlogCard from "@/components/blog/BlogCard";
import BlogPostFormModal from "@/components/blog/BlogPostFormModal";

// Sample blog post data
const blogPosts = [
  {
    id: 1,
    title: "Top 10 Summer Hair Care Tips",
    excerpt: "Protect your hair from sun damage and keep it looking healthy all summer long with these essential tips.",
    image: "/placeholder.svg",
    author: "Sarah Johnson",
    date: "June 15, 2023",
    readTime: "5 min read",
    category: "Hair Care"
  },
  {
    id: 2,
    title: "The Ultimate Guide to Hair Coloring",
    excerpt: "Everything you need to know about hair coloring techniques, trends, and maintenance for gorgeous results.",
    image: "/placeholder.svg",
    author: "Michael Chen",
    date: "May 22, 2023",
    readTime: "8 min read",
    category: "Hair Color"
  },
  {
    id: 3,
    title: "How to Choose the Perfect Hairstyle for Your Face Shape",
    excerpt: "Learn how to identify your face shape and find the most flattering hairstyles to enhance your features.",
    image: "/placeholder.svg",
    author: "Emma Davis",
    date: "April 10, 2023",
    readTime: "6 min read",
    category: "Styling Tips"
  },
  {
    id: 4,
    title: "Natural Ingredients for Healthy Hair Growth",
    excerpt: "Discover natural remedies and ingredients that can promote hair growth and improve hair health.",
    image: "/placeholder.svg",
    author: "David Wilson",
    date: "March 28, 2023",
    readTime: "7 min read",
    category: "Hair Growth"
  },
  {
    id: 5,
    title: "Bridal Hair Trends for 2023",
    excerpt: "Stay up to date with the latest bridal hair trends to look stunning on your special day.",
    image: "/placeholder.svg",
    author: "Jessica Lee",
    date: "February 14, 2023",
    readTime: "5 min read",
    category: "Wedding"
  },
  {
    id: 6,
    title: "How to Maintain Your Salon Look at Home",
    excerpt: "Professional tips and tricks to help you maintain your salon-fresh look between appointments.",
    image: "/placeholder.svg",
    author: "Robert Taylor",
    date: "January 5, 2023",
    readTime: "6 min read",
    category: "Maintenance"
  }
];

const categories = ["All", "Hair Care", "Hair Color", "Styling Tips", "Hair Growth", "Wedding", "Maintenance"];

const Blog = () => {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const navigate = useNavigate();
  
  const [selectedPost, setSelectedPost] = useState<BlogPost | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: posts = [], isLoading: isLoadingPosts } = useBlogPosts(categoryParam);
  const { data: categories = [], isLoading: isLoadingCategories } = useBlogCategories();
  const { deletePost } = useBlogOperations();
  
  const isAdminOrStylist = profile?.role === "admin" || profile?.role === "stylist";

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost.mutateAsync(postId);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleCreatePost = () => {
    setSelectedPost(undefined);
    setIsModalOpen(true);
  };

  // Find the featured post (most recent)
  const featuredPost = posts[0];
  // Rest of the posts
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-salon-green mb-4">Beauty Blog</h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the latest trends, tips, and insider knowledge from our experienced stylists 
              to keep your hair and beauty routine at its best.
            </p>
          </div>

          {/* Admin/Stylist Controls */}
          {isAdminOrStylist && (
            <div className="mb-8">
              <Button 
                onClick={handleCreatePost} 
                className="bg-salon-green hover:bg-salon-darkGreen"
              >
                <Plus className="mr-2 h-4 w-4" /> New Blog Post
              </Button>
            </div>
          )}

          {/* Featured Post */}
          {featuredPost && (
            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-12">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={featuredPost.image_url || "/placeholder.svg"} 
                    alt="Featured post" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <span className="text-xs font-medium text-salon-green bg-salon-green/10 px-3 py-1 rounded-full inline-block mb-4">FEATURED POST</span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-salon-green">{featuredPost.title}</h2>
                  <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <User className="h-4 w-4 mr-1" />
                    <span className="mr-4">{featuredPost.author?.full_name || "Anonymous"}</span>
                    <CalendarDays className="h-4 w-4 mr-1" />
                    <span className="mr-4">{new Date(featuredPost.created_at).toLocaleDateString()}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{featuredPost.read_time || 5} min read</span>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      className="bg-salon-green hover:bg-salon-darkGreen"
                      onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                    >
                      Read Article <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    
                    {isAdminOrStylist && (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => handleEditPost(featuredPost)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this post?")) {
                              handleDeletePost(featuredPost.id);
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
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              key="all"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryParam === "all"
                  ? "bg-salon-green text-white"
                  : "bg-white text-salon-green hover:bg-gray-100"
              }`}
              onClick={() => handleCategoryChange("all")}
            >
              All
            </button>
            
            {categories.map((category) => (
              <button
                key={category.slug}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryParam === category.slug
                    ? "bg-salon-green text-white"
                    : "bg-white text-salon-green hover:bg-gray-100"
                }`}
                onClick={() => handleCategoryChange(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Loading or No Posts State */}
          {isLoadingPosts ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading blog posts...</p>
            </div>
          ) : regularPosts.length === 0 && !featuredPost ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts found.</p>
            </div>
          ) : (
            /* Blog Posts Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  showControls={isAdminOrStylist}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}

          {/* Pagination - We'll keep this simple for now */}
          <div className="flex justify-center mt-12">
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-salon-green text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Blog Post Form Modal */}
      <BlogPostFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        post={selectedPost}
      />
      
      <Footer />
    </div>
  );
};

export default Blog;
