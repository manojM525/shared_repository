
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { ArrowLeft } from "lucide-react";

interface Content {
  type: string;
  content: string;
}

interface Blog {
  id: string;
  title: string;
  contents: Content[];
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/blogs/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch blog");
        }
        const data = await res.json();
        setBlog(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const renderContentBlock = (content: Content, index: number) => {
    const commonClasses = "text-gray-600 mb-4 leading-relaxed";
    switch (content.type) {
      case "h1":
        return (
          <h1
            key={index}
            className={`${commonClasses} text-2xl sm:text-3xl font-bold text-gray-900`}
          >
            {content.content}
          </h1>
        );
      case "h2":
        return (
          <h2
            key={index}
            className={`${commonClasses} text-xl sm:text-2xl font-semibold text-gray-900`}
          >
            {content.content}
          </h2>
        );
      case "h3":
        return (
          <h3
            key={index}
            className={`${commonClasses} text-lg sm:text-xl font-medium text-gray-900`}
          >
            {content.content}
          </h3>
        );
      case "h4":
        return (
          <h4
            key={index}
            className={`${commonClasses} text-base sm:text-lg font-medium text-gray-900`}
          >
            {content.content}
          </h4>
        );
      case "h5":
        return (
          <h5
            key={index}
            className={`${commonClasses} text-sm sm:text-base font-medium text-gray-900`}
          >
            {content.content}
          </h5>
        );
      case "h6":
        return (
          <h6
            key={index}
            className={`${commonClasses} text-xs sm:text-sm font-medium text-gray-900`}
          >
            {content.content}
          </h6>
        );
      case "p":
        const lines = content.content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);
        return lines.length > 1 ? (
          <ul
            key={index}
            className={`${commonClasses} list-disc list-inside space-y-2`}
          >
            {lines.map((line, i) => (
              <li key={i} className="text-gray-600">
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p key={index} className={`${commonClasses} text-justify`}>
            {content.content}
          </p>
        );
      case "strong":
        return (
          <strong
            key={index}
            className={`${commonClasses} font-bold text-gray-900`}
          >
            {content.content}
          </strong>
        );
      case "em":
        return (
          <em key={index} className={`${commonClasses} italic`}>
            {content.content}
          </em>
        );
      case "mark":
        return (
          <mark
            key={index}
            className={`${commonClasses} bg-[#FFCA28]/30 px-1 rounded`}
          >
            {content.content}
          </mark>
        );
      case "blockquote":
        return (
          <blockquote
            key={index}
            className={`${commonClasses} border-l-4 border-[#2E7D32] pl-4 italic`}
          >
            {content.content}
          </blockquote>
        );
      case "code":
        return (
          <code
            key={index}
            className={`${commonClasses} font-mono bg-gray-100 px-1 rounded`}
          >
            {content.content}
          </code>
        );
      case "pre":
        return (
          <pre
            key={index}
            className={`${commonClasses} font-mono bg-gray-100 p-4 rounded whitespace-pre-wrap`}
          >
            {content.content}
          </pre>
        );
      case "abbr":
        return (
          <abbr
            key={index}
            className={commonClasses}
            title={content.content}
          >
            {content.content}
          </abbr>
        );
      case "cite":
        return (
          <cite
            key={index}
            className={`${commonClasses} italic`}
          >
            {content.content}
          </cite>
        );
      case "q":
        return (
          <q
            key={index}
            className={`${commonClasses} italic`}
          >
            {content.content}
          </q>
        );
      case "small":
        return (
          <small
            key={index}
            className={`${commonClasses} text-sm`}
          >
            {content.content}
          </small>
        );
      case "image":
        return (
          <img
            key={index}
            src={content.content}
            alt={`Blog image ${index + 1}`}
            className="w-full h-64 sm:h-80 object-contain rounded-xl border border-gray-100 mb-4"
            onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=Blog+Image")
            }
          />
        );
      default:
        return (
          <p
            key={index}
            className={commonClasses}
          >
            {content.content}
          </p>
        );
    }
  };

  if (isLoading)
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2E7D32] mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading blog...</p>
        </div>
      </div>
    );

  if (error)
    return (
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
    );

  if (!blog)
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Blog not found
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            The blog you're looking for doesn't exist. Explore our other posts!
          </p>
          <button
            onClick={() => navigate("/blogs")}
            className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
            aria-label="Back to Blogs"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );

  // Find the first image
  const firstImage = blog.contents.find((content) => content.type === "image");
  // Filter out the first image from the content blocks
  const otherContents = blog.contents.filter(
    (content) => !(content.type === "image" && content === firstImage)
  );

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/blogs")}
          className="flex items-center mb-6 text-[#2E7D32] hover:text-[#FFCA28] font-medium text-sm sm:text-base transition-colors duration-200"
          aria-label="Back to Blogs"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blogs
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 animate-fadeInUp">
          {blog.title}
        </h1>
        {firstImage && (
          <div className="mb-6">
            <img
              src={firstImage.content}
              alt="Blog cover image"
              className="w-full h-64 sm:h-80 object-contain rounded-xl border border-gray-100"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=Blog+Image")
              }
            />
          </div>
        )}
        <div className="space-y-6">
          {otherContents.map((content, index) => renderContentBlock(content, index))}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;