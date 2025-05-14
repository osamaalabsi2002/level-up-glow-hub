
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { BlogPost } from './useBlogData';

export function useBlogOperations() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const createPost = useMutation({
    mutationFn: async (postData: Partial<BlogPost>) => {
      if (!profile?.id) {
        throw new Error('You must be logged in to create a post');
      }

      // Ensure required fields are present
      if (!postData.content) {
        throw new Error('Content is required');
      }

      // Generate a slug if not provided
      if (!postData.slug) {
        postData.slug = postData.title
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '');
      }

      // Ensure title and slug are provided
      if (!postData.title || !postData.slug) {
        throw new Error('Title and slug are required');
      }

      const { data, error } = await supabase.from('blog_posts').insert({
        content: postData.content,
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt || null,
        image_url: postData.image_url || null,
        category_id: postData.category_id || null,
        read_time: postData.read_time || null,
        published: postData.published || false,
        author_id: profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select();

      if (error) {
        console.error('Error creating blog post:', error);
        throw new Error('Failed to create blog post');
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, postData }: { id: number, postData: Partial<BlogPost> }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating blog post:', error);
        throw new Error('Failed to update blog post');
      }

      return data[0];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', variables.id] });
      toast.success('Blog post updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog post:', error);
        throw new Error('Failed to delete blog post');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createPost,
    updatePost,
    deletePost,
  };
}
