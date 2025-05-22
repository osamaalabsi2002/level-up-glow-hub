
import { BlogCategory } from "@/hooks/useBlogData";

interface BlogCategoryFilterProps {
  categories: BlogCategory[];
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  isLoading: boolean;
}

const BlogCategoryFilter = ({ 
  categories, 
  currentCategory, 
  onCategoryChange,
  isLoading
}: BlogCategoryFilterProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-20 bg-gray-100 animate-pulse rounded-full"></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <button
        key="all"
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          currentCategory === "all"
            ? "bg-salon-green text-white"
            : "bg-white text-salon-green hover:bg-gray-100"
        }`}
        onClick={() => onCategoryChange("all")}
      >
        All
      </button>
      
      {categories.map((category) => (
        <button
          key={category.slug}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentCategory === category.slug
              ? "bg-salon-green text-white"
              : "bg-white text-salon-green hover:bg-gray-100"
          }`}
          onClick={() => onCategoryChange(category.slug)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default BlogCategoryFilter;
