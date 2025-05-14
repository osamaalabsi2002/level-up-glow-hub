
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type BlogPost = {
  id: number;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  image_url: string | null;
  published: boolean;
  author_id: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  read_time: number | null;
  author?: {
    full_name: string;
  };
  category?: {
    name: string;
    slug: string;
  };
};

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

export function useBlogPosts(categorySlug?: string) {
  return useQuery({
    queryKey: ['blog-posts', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id(full_name),
          category:category_id(name, slug)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (categorySlug && categorySlug !== 'all') {
        const { data: categoryData } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
          
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blog posts:', error);
        toast.error('Failed to load blog posts');
        return [];
      }

      return (data as BlogPost[]) || [];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id(full_name, avatar_url),
          category:category_id(name, slug)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Failed to load blog post');
        return null;
      }

      return data as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching blog categories:', error);
        toast.error('Failed to load blog categories');
        return [];
      }

      return (data as BlogCategory[]) || [];
    },
  });
}
