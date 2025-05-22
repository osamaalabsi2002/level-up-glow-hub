
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useBlogPosts, useBlogCategories } from "@/hooks/useBlogData";
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
  const pageParam = Number(searchParams.get("page") || 1);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const PAGE_SIZE = 8; // Define page size (8 posts per page, 1 for featured)
  
  const [selectedPost, setSelectedPost] = useState(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: blogData, isLoading: isLoadingPosts } = useBlogPosts(categoryParam, currentPage, PAGE_SIZE);
  const { data: categories = [], isLoading: isLoadingCategories } = useBlogCategories();
  const { deletePost } = useBlogOperations();
  
  const posts = blogData?.posts || [];
  const paginationMeta = blogData?.meta || { 
    currentPage: 1, 
    totalPages: 1, 
    totalCount: 0, 
    pageSize: PAGE_SIZE 
  };
  
  const isAdminOrStylist = profile?.role === "admin" || profile?.role === "stylist";

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    // Reset to first page when changing categories
    searchParams.set("page", "1");
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const handleEditPost = (post) => {
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
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
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
              currentPage={paginationMeta.currentPage}
              totalPages={paginationMeta.totalPages}
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
