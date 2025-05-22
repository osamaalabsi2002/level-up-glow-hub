
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ExternalLink, Edit, Trash, Check, X } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogData";
import { useBlogOperations } from "@/hooks/useBlogOperations";
import BlogPostFormModal from "@/components/blog/BlogPostFormModal";
import { BlogPost } from "@/hooks/useBlogData";
import { format } from "date-fns";

const BlogsTab = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | undefined>(undefined);
  
  const { data: blogData, isLoading } = useBlogPosts();
  const { deletePost } = useBlogOperations();

  // Extract posts from the returned data
  const posts = blogData?.posts || [];

  const handleCreatePost = () => {
    setSelectedPost(undefined);
    setIsModalOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost.mutateAsync(postId);
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  const viewPost = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading blog posts...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Button onClick={handleCreatePost}>
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No blog posts found</p>
          <Button onClick={handleCreatePost}>
            <Plus className="mr-2 h-4 w-4" /> Create your first blog post
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category?.name || "Uncategorized"}</TableCell>
                  <TableCell>
                    {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {post.published ? (
                        <>
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-500">Published</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-gray-500">Draft</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => viewPost(post.slug)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BlogPostFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        post={selectedPost}
      />
    </div>
  );
};

export default BlogsTab;
