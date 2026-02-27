// products.tsx (updated)

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Heart } from 'lucide-react'; // ✅ Added Heart
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext'; // ✅ Added

interface Category {
  category_id: string;
  category_name: string;
  description: string;
  image_url: string;
}

interface ProductVariant {
  variant_id: string;
  quantity: number;
  unit_type: string;
  price: number | null;
}

interface ProductPoint {
  point_id: string;
  point_type: 'description' | 'nutritional';
  point_text: string;
  order_num: number;
}

interface Product {
  product_id: string;
  name: string;
  description: string;
  image_url: string;
  stock_status: 'in_stock' | 'out_of_stock';
  category_id: string;
  category_name: string;
  variants: ProductVariant[];
  points: ProductPoint[];
}

interface AuthContextType {
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const Products: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth() as AuthContextType;
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist(); // ✅ Added
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<number>(5);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: ProductVariant }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const fetchDataRef = useRef(false);

  useEffect(() => {
    if (isLoading || fetchDataRef.current) return;
    fetchDataRef.current = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [categoriesRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/categories`, { headers }),
          fetch(`${API_BASE_URL}/products`, { headers }),
        ]);

        if (!categoriesRes.ok || !productsRes.ok) {
          const errorData = await Promise.all([
            categoriesRes.ok ? null : categoriesRes.json(),
            productsRes.ok ? null : productsRes.json(),
          ]);
          console.error('Fetch error data:', errorData);
          if ((categoriesRes.status === 401 || productsRes.status === 401) && token) {
            setError('Session expired. Please log in again.');
            localStorage.removeItem('token');
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          throw new Error(
            errorData[0]?.message || errorData[1]?.message || 'Failed to fetch data'
          );
        }

        const categoriesData: Category[] = await categoriesRes.json();
        const productsData: Product[] = await productsRes.json();
        console.log('Fetched categories:', categoriesData);
        console.log('Fetched products:', productsData);

        const initialVariants: { [key: string]: ProductVariant } = {};
        productsData.forEach((product) => {
          product.variants = Array.isArray(product.variants) ? product.variants.filter(v => v.price != null) : [];
          product.variants.sort((a, b) => a.quantity - b.quantity);
          product.points = Array.isArray(product.points) ? product.points : [];
          product.points.sort((a, b) => a.order_num - b.order_num);
          if (product.variants.length > 0 && product.variants[0].price != null) {
            initialVariants[product.product_id] = product.variants[0];
          }
        });

        setCategories(categoriesData);
        setProducts(productsData);
        setSelectedVariants(initialVariants);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
        console.error('Fetch data error:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
        fetchDataRef.current = false;
      }
    };

    fetchData();
  }, [navigate, isLoading, isAuthenticated]);

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const selectedVariant = selectedVariants[product.product_id] || (product.variants.length > 0 ? product.variants[0] : null);
    const variantPrice: number | null = selectedVariant?.price ?? null;
    const matchesPrice = variantPrice != null && variantPrice >= minPrice && variantPrice <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleShowMore = () => {
    setVisibleCategories(categories.length);
  };

  const formatPrice = (price: number | null | undefined): string => {
    const safePrice = price ?? null;
    if (safePrice == null || isNaN(safePrice)) {
      return 'Price not available';
    }
    return `₹${safePrice.toFixed(2)}`;
  };

  const formatWeight = (quantity: number, unit: string): string => {
    if (unit === 'g' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}kg`;
    }
    return `${quantity}${unit}`;
  };

  const handleVariantChange = (productId: string, variant: ProductVariant) => {
    if (variant && variant.price != null) {
      setSelectedVariants((prev) => ({
        ...prev,
        [productId]: variant,
      }));
    }
  };

  const handleWishlistToggle = async (productId: string) => { // ✅ Added
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#2E7D32]/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fadeInUp">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] mb-4">
              Fresh Microgreens
            </h1>
            <p className="text-lg sm:text-xl text-[#FFFFFF]/90 max-w-2xl mx-auto">
              Discover our premium collection of nutrient-rich microgreens.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2E7D32] mx-auto"></div>
              <p className="mt-4 text-xl text-gray-600">Loading products...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isAuthenticated ? 'Something went wrong' : 'Log in to access more features'}
              </h2>
              <p className="text-gray-600 mb-6">
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
        )}

        {!loading && !error && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-fadeInUp">
                  Shop by Category
                </h2>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedCategory === 'all'
                      ? 'bg-[#2E7D32] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] text-gray-600 hover:bg-[#2E7D32]/10 border border-gray-200'
                  } rounded-lg touch-manipulation`}
                  aria-label="View All Products"
                >
                  All Products
                </button>
              </div>

              <div className="relative">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 sm:gap-6 sm:overflow-visible sm:pb-0">
                  {categories.slice(0, visibleCategories).map((category: Category, index: number) => (
                    <button
                      key={category.category_id}
                      onClick={() => setSelectedCategory(category.category_id)}
                      className={`group flex flex-col items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 stagger min-w-[120px] sm:min-w-0 border ${
                        selectedCategory === category.category_id
                          ? 'bg-[#2E7D32]/10 border-2 border-[#2E7D32]'
                          : 'border-gray-100'
                      }`}
                      style={{ '--i': index } as React.CSSProperties}
                      aria-label={`Select ${category.category_name}`}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-gray-100 group-hover:ring-[#2E7D32]/50 transition-all overflow-hidden">
                        <img
                          src={category.image_url || `https://via.placeholder.com/80/2E7D32/FFFFFF?text=${category.category_name[0]}`}
                          onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/80/2E7D32/FFFFFF?text=${category.category_name[0]}`)}
                          alt={category.category_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 text-center line-clamp-2 mt-3">
                        {category.category_name}
                      </span>
                    </button>
                  ))}

                  {visibleCategories < categories.length && (
                    <button
                      onClick={handleShowMore}
                      className="group flex flex-col items-center justify-center p-4 rounded-xl bg-[#FFFFFF] border border-gray-100 transition-all duration-300 transform hover:scale-105 stagger min-w-[120px] sm:min-w-0"
                      style={{ '--i': categories.length } as React.CSSProperties}
                      aria-label="Show More Categories"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        <ChevronDown className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 group-hover:text-[#2E7D32] transition-colors" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 mt-3">Show More</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl shadow-md p-4 sm:p-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search for microgreens, sprouts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCA28] focus:border-transparent transition-all text-sm sm:text-base"
                    aria-label="Search products"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFCA28] focus:border-transparent appearance-none transition-all text-sm sm:text-base"
                    aria-label="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category: Category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((product: Product, index: number) => {
                const selectedVariant = selectedVariants[product.product_id] || (product.variants.length > 0 ? product.variants[0] : null);
                const nutritionalPoints = product.points.filter(p => p.point_type === 'nutritional');

                return (
                  <div
                    key={product.product_id}
                    className="group bg-[#FFFFFF] rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 stagger flex flex-col"
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    <div className="relative overflow-hidden rounded-t-xl">
                      <img
                        src={product.image_url || `https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=${product.name[0]}`}
                        onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=${product.name[0]}`)}
                        alt={product.name}
                        className="w-full h-40 sm:h-48 lg:h-56 object-cover rounded-t-xl border border-gray-100 group-hover:scale-105 transition-transform duration-500"
                      />
                      <button // ✅ Added wishlist button
                        onClick={() => handleWishlistToggle(product.product_id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-all duration-200"
                        aria-label={isInWishlist(product.product_id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart
                          className={`h-5 w-5 ${isInWishlist(product.product_id) ? 'fill-red-500 stroke-red-500' : 'stroke-gray-400'}`}
                        />
                      </button>
                    </div>

                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#2E7D32] transition-colors duration-200 line-clamp-2 flex-1">
                          {product.name}
                        </h3>
                      </div>

                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-xl sm:text-2xl font-bold text-[#2E7D32]">
                            {formatPrice(selectedVariant?.price)}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                            product.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {product.variants.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.variants.map((variant: ProductVariant) => (
                              <button
                                key={variant.variant_id}
                                onClick={() => handleVariantChange(product.product_id, variant)}
                                className={`inline-block text-xs px-2 py-1 rounded-full transition-all duration-200 transform hover:scale-105 ${
                                  selectedVariant?.variant_id === variant.variant_id
                                    ? 'bg-[#2E7D32] text-[#FFFFFF]'
                                    : 'bg-gray-100 text-gray-700 hover:bg-[#2E7D32]/10'
                                } touch-manipulation`}
                                aria-label={`Select ${formatWeight(variant.quantity, variant.unit_type)} variant`}
                              >
                                {formatWeight(variant.quantity, variant.unit_type)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No variants available</p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <span className="inline-block bg-[#2E7D32]/10 text-[#2E7D32] text-xs px-3 py-1 rounded-full font-medium capitalize">
                            {product.category_name}
                          </span>
                          <Link
                            to={`/products/${product.product_id}`}
                            className="text-[#2E7D32] hover:text-[#FFCA28] font-medium text-sm transition-colors duration-200"
                            aria-label={`View details for ${product.name}`}
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your search criteria. Try adjusting your search or explore our categories.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;