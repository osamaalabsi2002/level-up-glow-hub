
import { BlogPost } from "@/hooks/useBlogData";
import BlogCard from "@/components/blog/BlogCard";

interface BlogGridProps {
  posts: BlogPost[];
  isLoading: boolean;
  showControls: boolean;
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: number) => void;
}

const BlogGrid = ({ posts, isLoading, showControls, onEdit, onDelete }: BlogGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading blog posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogCard 
          key={post.id} 
          post={post} 
          showControls={showControls}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BlogGrid;
