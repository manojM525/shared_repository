// wishlist.tsx (updated)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import { ShoppingCart, X } from 'lucide-react'; // ✅ Added X
import { useCart } from '../context/CartContext'; // ✅ Added
import { useAuth } from '../context/AuthContext'; // ✅ Added
import { useWishlist } from '../context/WishlistContext'; // ✅ Added

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

const Wishlist: React.FC = () => {
  const { wishlist, loading: wishlistLoading, removeFromWishlist } = useWishlist(); // ✅ Added
  const { addToCart } = useCart(); // ✅ Added
  const { isAuthenticated } = useAuth(); // ✅ Added
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: ProductVariant }>({});
  const navigate = useNavigate(); // ✅ Added

  // Initialize selected variants
  React.useEffect(() => {
    const initialVariants: { [key: string]: ProductVariant } = {};
    wishlist.forEach((product) => {
      product.variants.sort((a, b) => a.quantity - b.quantity);
      product.points.sort((a, b) => a.order_num - b.order_num);
      if (product.variants.length > 0 && product.variants[0].price != null) {
        initialVariants[product.product_id] = product.variants[0];
      }
    });
    setSelectedVariants(initialVariants);
  }, [wishlist]);

  const formatPrice = (price: number | null): string => {
    if (price == null || isNaN(price)) {
      return 'Price not available';
    }
    return `₹${price.toFixed(2)}`;
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

  const handleAddToCart = async (product: Product, variant: ProductVariant) => { // ✅ Added
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!variant || variant.price == null) return;
    await addToCart({
      id: `${product.product_id}_${variant.variant_id}`,
      name: `${product.name} (${formatWeight(variant.quantity, variant.unit_type)})`,
      price: variant.price,
      image: product.image_url,
      variant: {
        variant_id: variant.variant_id,
        quantity: variant.quantity,
        unit_type: variant.unit_type,
      },
    }, 1);
  };

  if (!isAuthenticated) { // ✅ Added auth check
    return (
      <div className="min-h-screen font-sans bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your wishlist.</p>
          <Link
            to="/login"
            className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (wishlistLoading) { // ✅ Added loading state
    return (
      <div className="min-h-screen font-sans bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2E7D32] mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#2E7D32]/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fadeInUp">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] mb-4">
              Your Wishlist
            </h1>
            <p className="text-lg sm:text-xl text-[#FFFFFF]/90 max-w-2xl mx-auto">
              View a selection of our favorite microgreens and sprouts
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Explore our products to find your favorite items.
            </p>
            <Link
              to="/products"
              className="bg-[#2E7D32] text-[#FFFFFF] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
              aria-label="Shop Now"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {wishlist.map((product: Product, index: number) => {
              const selectedVariant = selectedVariants[product.product_id] || product.variants[0];
              const descriptionPoints = product.points.filter(p => p.point_type === 'description');
              const nutritionalPoints = product.points.filter(p => p.point_type === 'nutritional');

              return (
                <div
                  key={product.product_id}
                  className="group bg-[#FFFFFF] rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 stagger"
                  style={{ '--i': index } as React.CSSProperties}
                >
                  <div className="relative">
                    <img
                      src={product.image_url || `https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=${product.name[0]}`}
                      onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=${product.name[0]}`)}
                      alt={product.name}
                      className="w-full h-40 sm:h-48 lg:h-56 object-contain rounded-t-xl border border-gray-100 group-hover:scale-105 transition-transform duration-500"
                    />
                    <button // ✅ Added remove button
                      onClick={() => removeFromWishlist(product.product_id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] transition-colors focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
                      aria-label="Remove from wishlist"
                    >
                      <X className="h-5 w-5 text-red-500" />
                    </button>
                    <button // ✅ Changed to button for add to cart
                      onClick={() => selectedVariant && handleAddToCart(product, selectedVariant)}
                      className="absolute top-2 left-2 p-2 rounded-full bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] transition-colors focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 touch-manipulation"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="h-5 w-5 text-green-500" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#2E7D32] transition-colors duration-200 line-clamp-2 flex-1">
                        {product.name}
                      </h3>
                    </div>

                    {descriptionPoints.length > 0 ? (
                      <ul className="text-gray-600 text-sm mb-4 list-disc list-inside">
                        {descriptionPoints.map((point, idx) => (
                          <li key={point.point_id || idx}>{point.point_text}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 text-sm mb-4">No description available</p>
                    )}

                    {nutritionalPoints.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900">Nutritional Benefits:</h4>
                        <ul className="text-gray-600 text-sm list-disc list-inside">
                          {nutritionalPoints.map((point, idx) => (
                            <li key={point.point_id || idx}>{point.point_text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-3">
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
        )}
      </div>
    </div>
  );
};

export default Wishlist;