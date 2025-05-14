import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useBlogPosts, useBlogCategories, BlogPost } from "@/hooks/useBlogData";
import { useBlogOperations } from "@/hooks/useBlogOperations";
import BlogPostFormModal from "@/components/blog/BlogPostFormModal";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogFeaturedPost from "@/components/blog/BlogFeaturedPost";
import BlogCategoryFilter from "@/components/blog/BlogCategoryFilter";
import BlogGrid from "@/components/blog/BlogGrid";
import BlogPagination from "@/components/blog/BlogPagination";

const Blog = () => {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3; // Hardcoded for now, could be calculated from API response
  
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
    // Reset to first page when changing categories
    setCurrentPage(1);
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
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real implementation, this would fetch the posts for the new page
    // We're using client-side pagination for now
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
          {/* Header Section */}
          <BlogHeader 
            isAdminOrStylist={isAdminOrStylist}
            onCreatePost={handleCreatePost}
          />

          {/* Featured Post */}
          {featuredPost && (
            <BlogFeaturedPost 
              post={featuredPost} 
              isAdminOrStylist={isAdminOrStylist}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          )}

          {/* Category Filter */}
          <BlogCategoryFilter 
            categories={categories}
            currentCategory={categoryParam}
            onCategoryChange={handleCategoryChange}
            isLoading={isLoadingCategories}
          />

          {/* Blog Posts Grid */}
          <BlogGrid 
            posts={regularPosts}
            isLoading={isLoadingPosts && !featuredPost}
            showControls={isAdminOrStylist}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />

          {/* Pagination */}
          {!isLoadingPosts && regularPosts.length > 0 && (
            <BlogPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
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
