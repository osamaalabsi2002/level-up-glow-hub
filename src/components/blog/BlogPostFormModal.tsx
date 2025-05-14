
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BlogPostForm from './BlogPostForm';
import { BlogPost } from '@/hooks/useBlogData';
import { useBlogOperations } from '@/hooks/useBlogOperations';

type BlogPostFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: BlogPost;
};

const BlogPostFormModal = ({
  open,
  onOpenChange,
  post,
}: BlogPostFormModalProps) => {
  const { createPost, updatePost } = useBlogOperations();

  const isCreating = createPost.isPending;
  const isUpdating = updatePost.isPending;
  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (formData: any) => {
    try {
      // Convert category_id to number
      if (formData.category_id) {
        formData.category_id = parseInt(formData.category_id, 10);
      }

      if (post) {
        await updatePost.mutateAsync({
          id: post.id,
          postData: formData,
        });
      } else {
        await createPost.mutateAsync(formData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <BlogPostForm
            post={post}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostFormModal;
