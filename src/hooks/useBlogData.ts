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

export type PaginationMeta = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export function useBlogPosts(categorySlug?: string, page = 1, pageSize = 9) {
  return useQuery({
    queryKey: ['blog-posts', categorySlug, page, pageSize],
    queryFn: async () => {
      // First, get the total count for pagination metadata
      let countQuery = supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .eq('published', true);
        
      if (categorySlug && categorySlug !== 'all') {
        const { data: categoryData } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
          
        if (categoryData) {
          countQuery = countQuery.eq('category_id', categoryData.id);
        }
      }
      
      const { count } = await countQuery;
      
      // Then get the paginated data
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id(full_name),
          category:category_id(name, slug)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(from, to);

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
        return { 
          posts: [], 
          meta: {
            currentPage: page,
            pageSize,
            totalCount: 0,
            totalPages: 0
          }
        };
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 0;

      return { 
        posts: (data as BlogPost[]) || [], 
        meta: {
          currentPage: page,
          pageSize,
          totalCount: count || 0,
          totalPages
        }
      };
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
