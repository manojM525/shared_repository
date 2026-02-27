import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Truck, Star, User, Phone } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import banner1 from '../assets/microgreens1.jpg';
import banner2 from '../assets/microgreens2.jpg';
import banner3 from '../assets/microgreens3.jpg';
import banner4 from '../assets/microgreens4.jpg';
import fssai from '../assets/food_safety.jpg';

interface ProductVariant {
  variant_id: string;
  quantity: number;
  unit_type: string;
  price: number | null;
}

interface Product {
  product_id: string;
  name: string;
  image_url: string;
  category_id: string;
  category_name: string;
  variants: ProductVariant[];
}

interface BlogContent {
  type: string;
  content: string;
}

interface Blog {
  id: string;
  title: string;
  contents: BlogContent[];
  firstImage: string;
}

interface AuthContextType {
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

const Home: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const sliderImages = [banner1, banner2, banner3, banner4];

  const testimonials: Testimonial[] = [
    {
      name: "Anamika Lalwani",
      role: "Founder & Designer - Purple Patch",
      quote: "We are avid consumers of your broccoli, kale, arugula, and pink radish microgreens, which we incorporate into our daily salads and dal.The exceptional quality and nutritional richness of your microgreens have become indispensable, particularly for our elderly parents. We've observed a noticeable improvement in their health since integrating these microgreens into their diet. Thank you for consistently delivering such outstanding products.",
    },
    {
      name: "Dr. V. Gayathri",
      role: "",
      quote: "I recently had come across their website and since then there was no turning back! Microgreens were incredibly fresh and added a burst of flavor to the food. What impressed me the most about these microgreens was their nutritional value, making them a great addition to a healthy diet. The company has been prompt with their responses & delivery making it an easy process to order.",
    },
    // {
    //   name: "Anita Desai",
    //   role: "Home Cook",
    //   quote: "So easy to add to my meals, and the delivery is always on time. Highly recommend!",
    // },
  ];

  useEffect(() => {
    if (isLoading) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${API_BASE_URL}/products`, { headers });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch products error:', errorData);
          if (response.status === 401 && token) {
            setError('Session expired. Please log in again.');
            localStorage.removeItem('token');
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          throw new Error(errorData.message || 'Failed to fetch products');
        }

        const productsData: any[] = await response.json();
        console.log('Fetched products data:', productsData);

        const groupedProducts: Product[] = productsData.reduce((acc: Product[], item: any) => {
          const existingProduct = acc.find((p) => p.product_id === item.product_id);

          if (existingProduct) {
            if (item.variant_id && item.price != null) {
              existingProduct.variants.push({
                variant_id: item.variant_id,
                quantity: item.variant_quantity || 0,
                unit_type: item.variant_unit_type || 'g',
                price: Number(item.price),
              });
            }
          } else {
            const newProduct: Product = {
              product_id: item.product_id,
              name: item.name || 'Unnamed Product',
              image_url: item.image_url || '',
              category_id: item.category_id || '',
              category_name: item.category_name || 'Uncategorized',
              variants: item.variant_id && item.price != null ? [{
                variant_id: item.variant_id,
                quantity: item.variant_quantity || 0,
                unit_type: item.variant_unit_type || 'g',
                price: Number(item.price),
              }] : [],
            };
            acc.push(newProduct);
          }

          return acc;
        }, []);

        // Log for debugging
        console.log('Grouped products:', groupedProducts.map(p => ({
          id: p.product_id,
          name: p.name,
          variants: p.variants.map(v => ({ id: v.variant_id, price: v.price })),
        })));

        groupedProducts.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(groupedProducts.slice(0, 3));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching products';
        console.error('Fetch products error:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const fetchBlogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/blogs`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        const limitedBlogs = data.blogs.slice(0, 3);
        setBlogs(limitedBlogs);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching blogs';
        console.error('Fetch blogs error:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Slider Section */}
      <section className="relative w-full h-[100vh]">
        <div className="relative w-full h-full overflow-hidden">
          {sliderImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={image}
                alt={`Microgreens ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/1200x600?text=Microgreens')}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                    Fresh
                    <span className="block text-[#FFCA28]">Microgreens</span>
                    Delivered Daily
                  </h1>
                  <p className="text-xl mb-8 max-w-2xl mx-auto">
                    Discover the power of nutrition-packed microgreens and sprouts.
                    Grown with love, delivered fresh to your doorstep.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/products"
                      className="inline-flex items-center justify-center px-8 py-4 bg-[#2E7D32] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#FFCA28] hover:text-[#2E7D32] transform hover:scale-105 transition-all duration-200 shadow-lg focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50"
                      aria-label="Shop Now"
                    >
                      Shop Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#2E7D32] text-[#2E7D32] font-semibold rounded-lg hover:bg-[#2E7D32] hover:text-[#FFFFFF] transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50"
                      aria-label="Learn More"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-[#FFCA28]' : 'bg-white bg-opacity-50'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
       
      </section>

      {/* Info Banner Section */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-around space-y-6 md:space-y-0 md:space-x-8">
          <div className="group mb-6 md:mb-0">
            <div className="hover:scale-105 transition-transform duration-300">
              <img src={fssai} alt="FSSAI Logo" className="h-60 w-30" />
            </div>
          </div>
          <div className="group mb-6 md:mb-0 flex flex-col items-center space-y-2">
            <Leaf className="h-20 w-20 text-[#2E7D32] mt-12" />
            <p className="text-4xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-300 text-center">
              NON-GMO <span className="text-green-600">Seeds</span>
            </p>
          </div>

          <div className="group mb-6 md:mb-0 flex flex-col items-center space-y-2">
            <Truck className="h-20 w-20 text-[#2E7D32] mt-12" />
            <p className="text-4xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
              Locally grown and <span className="text-green-600">delivered live</span>
            </p>
          </div>
          <div className="group mb-6 md:mb-0 flex flex-col items-center space-y-2">
            <Phone className="h-20 w-20 text-[#2E7D32] mt-12" />
            <p className="text-4xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
              Friendly Support <span className="text-green-600">24/7</span>
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-[#2E7D32]/10 to-[#FFCA28]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Try our most popular microgreens and sprouts
            </p>
          </div>

          {loading ? (
            <div className="min-h-[20vh] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2E7D32] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="min-h-[20vh] flex items-center justify-center">
              <div className="text-center">
                <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isAuthenticated ? 'Something went wrong' : 'Log in to access more features'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isAuthenticated
                    ? error
                    : 'Log in to add products to your cart or place orders.'}
                </p>
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
                    aria-label="Log In"
                  >
                    Log In
                  </Link>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
                    aria-label="Retry"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link
                  key={product.product_id}
                  to={`/products/${product.product_id}`}
                  className="group bg-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
                  aria-label={`View ${product.name}`}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image_url || `https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=${product.name}`}
                      onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=${product.name}`)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* <div className="absolute top-4 right-4 bg-[#FFFFFF] px-3 py-1 rounded-full shadow-lg">
                      <span className="text-[#2E7D32] font-bold">
                        {product.variants.length > 0 && product.variants[0].price != null
                          ? `₹${product.variants[0].price.toFixed(2)}`
                          : 'Price not available'}
                      </span>
                    </div> */}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#2E7D32] transition-colors duration-200">
                      {product.name}
                    </h3>
                    {/* Description removed */}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#2E7D32] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#FFCA28] hover:text-[#2E7D32] transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50"
              aria-label="View All Products"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Blogs */}
      <section className="py-20 bg-gradient-to-br from-[#2E7D32]/10 to-[#FFCA28]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Blogs
            </h2>
            <p className="text-xl text-gray-600">
              Read our latest insights on microgreens and healthy living
            </p>
          </div>

          {loading ? (
            <div className="min-h-[20vh] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2E7D32] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading blogs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="min-h-[20vh] flex items-center justify-center">
              <div className="text-center">
                <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isAuthenticated ? 'Something went wrong' : 'Log in to access more features'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isAuthenticated
                    ? error
                    : 'Log in to access more features.'}
                </p>
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
                    aria-label="Log In"
                  >
                    Log In
                  </Link>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
                    aria-label="Retry"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="group bg-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
                  aria-label={`Read ${blog.title}`}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={blog.firstImage || `https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=${blog.title}`}
                      onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=${blog.title}`)}
                      alt={blog.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#2E7D32] transition-colors duration-200">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {blog.contents.find(c => c.type === 'p')?.content || 'No description available'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/blogs"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#2E7D32] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#FFCA28] hover:text-[#2E7D32] transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50"
              aria-label="See More Blogs"
            >
              See More Blogs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-12 bg-gradient-to-br from-[#2E7D32]/10 to-[#FFCA28]/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Hear from people who have experienced the goodness of our microgreens.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 p-4 sm:p-6 bg-[#FFFFFF] rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center mb-3">
                      <User className="h-10 w-10 text-[#FFCA28] mr-3" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 italic text-base">&quot;{testimonial.quote}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2 h-2 rounded-full ${currentTestimonial === index ? 'bg-[#FFCA28]' : 'bg-white bg-opacity-50'
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-600 mb-6">
            Ready to Start Your Healthy Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who have made microgreens
            a part of their daily nutrition.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#2E7D32] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#FFCA28] hover:text-[#2E7D32] transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50"
            aria-label="Get Started Today"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;