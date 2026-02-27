
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  firstImage: string;
}

const BlogsList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 9; // 9 blogs per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/blogs?page=${currentPage}&limit=${limit}`);
        if (!res.ok) {
          throw new Error("Failed to fetch blogs");
        }
        const data = await res.json();
        setBlogs(data.blogs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [currentPage]);

  const filteredBlogs = blogs.filter((blog: Blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Show up to 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all duration-200 touch-manipulation ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#2E7D32] text-[#FFFFFF] hover:bg-[#FFCA28] hover:text-[#2E7D32]"
          }`}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
              currentPage === page
                ? "bg-[#2E7D32] text-[#FFFFFF]"
                : "bg-[#FFFFFF] text-gray-600 hover:bg-[#2E7D32]/10 border border-gray-200"
            }`}
            aria-label={`Go to page ${page}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all duration-200 touch-manipulation ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#2E7D32] text-[#FFFFFF] hover:bg-[#FFCA28] hover:text-[#2E7D32]"
          }`}
          aria-label="Next Page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#2E7D32]/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fadeInUp">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] mb-4">
              Our Blog
            </h1>
            <p className="text-lg sm:text-xl text-[#FFFFFF]/90 max-w-2xl mx-auto">
              Explore insights, tips, and recipes about microgreens and healthy living
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2E7D32] mx-auto"></div>
              <p className="mt-4 text-xl text-gray-600">Loading blogs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
                aria-label="Retry"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Search Section */}
            <div className="bg-[#FFFFFF] rounded-xl shadow-md p-4 sm:p-6 mb-8">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
                />
                <input
                  type="text"
                  placeholder="Search for blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCA28] focus:border-transparent transition-all text-sm sm:text-base"
                  aria-label="Search blogs"
                />
              </div>
            </div>

            {/* Blogs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredBlogs.length === 0 ? (
                <div className="text-center py-16 col-span-full">
                  <div className="text-6xl mb-4">🌱</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No blogs found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We couldn't find any blogs matching your search. Try adjusting
                    your search term.
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
                    aria-label="Clear Search"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                filteredBlogs.map((blog, index) => (
                  <div
                    key={blog.id}
                    className="group bg-[#FFFFFF] rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 stagger"
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    <div className="relative">
                      {blog.firstImage ? (
                        <img
                          src={blog.firstImage}
                          alt={blog.title}
                          className="w-full h-40 sm:h-48 lg:h-56 object-contain rounded-t-xl border border-gray-100 group-hover:scale-105 transition-transform duration-500"
                          onError={(e) =>
                            (e.currentTarget.src =
                              "https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=Blog+Image")
                          }
                        />
                      ) : (
                        <div className="w-full h-40 sm:h-48 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center border border-gray-100">
                          <span className="text-gray-500 text-lg font-medium">
                            {blog.title[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#2E7D32] transition-colors duration-200 line-clamp-2">
                        {blog.title}
                      </h3>
                      <div className="flex items-center justify-end pt-2">
                        <button
                          onClick={() => navigate(`/blogs/${blog.id}`)}
                          className="text-[#2E7D32] hover:text-[#FFCA28] font-medium text-sm transition-colors duration-200"
                          aria-label={`View details for ${blog.title}`}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsList;
