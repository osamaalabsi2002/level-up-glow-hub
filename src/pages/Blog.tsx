
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, User, Clock, ChevronRight } from "lucide-react";

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

          {/* Featured Post */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md mb-12">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src="/placeholder.svg" 
                  alt="Featured post" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                <span className="text-xs font-medium text-salon-green bg-salon-green/10 px-3 py-1 rounded-full inline-block mb-4">FEATURED POST</span>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-salon-green">Sustainable Beauty: Eco-friendly Practices in Modern Salons</h2>
                <p className="text-gray-600 mb-6">
                  Discover how modern salons are adopting sustainable practices to reduce their environmental 
                  footprint while providing top-quality services that are better for you and the planet.
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">Amanda Green</span>
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span className="mr-4">July 2, 2023</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>10 min read</span>
                </div>
                <Button className="w-fit bg-salon-green hover:bg-salon-darkGreen">
                  Read Article <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === "All"
                    ? "bg-salon-green text-white"
                    : "bg-white text-salon-green hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden border border-gray-200 h-full flex flex-col">
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription className="flex items-center text-xs space-x-2 mt-2">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button variant="ghost" className="text-salon-green hover:text-salon-darkGreen p-0">
                    Read More <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
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
      <Footer />
    </div>
  );
};

export default Blog;
