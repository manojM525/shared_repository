// productdetail.tsx (updated)

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Scale, Package, Clock, Shield, Heart } from 'lucide-react'; // ✅ Added Heart
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext'; // ✅ Added
import { API_BASE_URL } from '../config';

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
  format?: string;
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

const getFormatClasses = (format?: string) => {
  const classesMap: { [key: string]: string } = {
    p: 'text-base leading-relaxed mb-4',
    h1: 'text-4xl font-bold mb-6 text-gray-900',
    h2: 'text-3xl font-bold mb-4 text-gray-900',
    h3: 'text-2xl font-bold mb-3 text-gray-900',
    h4: 'text-xl font-bold mb-2 text-gray-900',
    h5: 'text-lg font-bold mb-2 text-gray-900',
    h6: 'text-base font-bold mb-1 text-gray-900',
    strong: 'font-bold',
    em: 'italic',
    pre: 'whitespace-pre-wrap bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-4'
  };
  return classesMap[format || 'p'] || 'text-base';
};

const renderPointHTML = (point: ProductPoint, includeBullet = true) => {
  const classes = getFormatClasses(point.format);
  const bullet = includeBullet ? '<span class="text-green-600 mr-3 flex-shrink-0">•</span>' : '';
  const Tag = point.format || 'p';
  return `${bullet}<${Tag} class="${classes}">${point.point_text}</${Tag}>`;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated, isLoading } = useAuth() as AuthContextType;
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist(); // ✅ Added
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const fetchDataRef = useRef(false);

  const fetchProduct = async () => {
    if (!id) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching product with ID:', id);
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE_URL}/products/${id}`, { headers });
      console.log('Response status:', response.status, 'OK:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Failed to fetch product';
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.log('Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } else {
          console.log('Non-JSON response:', await response.text());
        }
        if (response.status === 401 && token) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        if (response.status === 404) {
          setError('Product not found');
          return;
        }
        throw new Error(errorMessage);
      }

      const productData: Product = await response.json();
      console.log('Product data:', productData);

      productData.variants = Array.isArray(productData.variants)
        ? productData.variants.filter((v) => v.price != null)
        : [];
      productData.variants.sort((a, b) => a.quantity - b.quantity);
      productData.points = Array.isArray(productData.points) ? productData.points : [];
      productData.points.sort((a, b) => a.order_num - b.order_num);

      setProduct(productData);
      if (productData.variants.length > 0 && productData.variants[0].price != null) {
        setSelectedVariant(productData.variants[0]);
        console.log('Selected variant:', productData.variants[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch product error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading || fetchDataRef.current || !id) return;
    fetchDataRef.current = true;

    fetchProduct().finally(() => {
      fetchDataRef.current = false;
    });
  }, [id, isLoading]);

  const formatPrice = (price: number | null) => {
    if (price == null || isNaN(price)) {
      return 'Price not available';
    }
    return `₹${price.toFixed(2)}`;
  };

  const formatWeight = (quantity: number, unit: string) => {
    if (unit === 'g' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}kg`;
    }
    return `${quantity}${unit}`;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!selectedVariant || !product || selectedVariant.price == null) {
      console.error('Cannot add to cart: Invalid product or variant');
      return;
    }

    await addToCart({
      id: `${product.product_id}_${selectedVariant.variant_id}`,
      name: `${product.name} (${formatWeight(selectedVariant.quantity, selectedVariant.unit_type)})`,
      price: selectedVariant.price,
      image: product.image_url,
      variant: {
        variant_id: selectedVariant.variant_id,
        quantity: selectedVariant.quantity,
        unit_type: selectedVariant.unit_type,
      },
    }, quantity);

    setQuantity(1);
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const getTotalPrice = () => {
    if (!selectedVariant || selectedVariant.price == null) return 0;
    return selectedVariant.price * quantity;
  };

  const handleWishlistToggle = async () => { // ✅ Added
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isInWishlist(product.product_id)) {
      await removeFromWishlist(product.product_id);
    } else {
      await addToWishlist(product.product_id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const descriptionPoints = product.points.filter((p) => p.point_type === 'description');
  const nutritionalPoints = product.points.filter((p) => p.point_type === 'nutritional');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/products" className="text-green-600 hover:text-green-500 font-medium">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{product.category_name}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/products"
          className="inline-flex items-center text-green-600 hover:text-green-500 mb-4 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden relative"> {/* ✅ Added relative */}
            <img
              src={product.image_url || `https://via.placeholder.com/400x400/2E7D32/FFFFFF?text=${product.name[0]}`}
              onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/400x400/2E7D32/FFFFFF?text=${product.name[0]}`)}
              alt={product.name}
              className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-t-xl"
            />
            <button // ✅ Added wishlist button
              onClick={handleWishlistToggle}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200"
              aria-label={isInWishlist(product.product_id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`h-6 w-6 ${isInWishlist(product.product_id) ? 'fill-red-500 stroke-red-500' : 'stroke-gray-400'}`}
              />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="mb-4">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium capitalize">
                {product.category_name}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>
              {selectedVariant && selectedVariant.price != null && (
                <div className="text-xl sm:text-2xl font-bold text-green-600 mt-2">
                  {formatPrice(selectedVariant.price)}
                  <span className="text-sm text-gray-500 ml-2">
                    per {formatWeight(selectedVariant.quantity, selectedVariant.unit_type)}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-700 text-sm sm:text-base">{product.description}</p>
            </div>

            {descriptionPoints.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description:</h3>
                <div
                  className="text-gray-700 text-sm space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: descriptionPoints.map((point) => renderPointHTML(point, false)).join('')
                  }}
                />
              </div>
            )}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">

              <div className="text-center">
                <div className="p-2 bg-green-100 rounded-full w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Harvest Fresh</p>
                <p className="font-semibold text-xs">Daily harvest</p>
              </div>
              <div className="text-center">
                <div className="p-2 bg-green-100 rounded-full w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">24 - 48 Hours</p>
                <p className="font-semibold text-xs">Within city limits</p>
              </div>
              <div className="text-center">
                <div className="p-2 bg-green-100 rounded-full w-10 h-10 mx-auto mb-1 flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Storage/ Shelf Life</p>
                <p className="font-semibold text-xs">Refrigerate 5-7 days, Keep the roots moist</p>
              </div>

            </div>

            {product.variants.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Size/Weight
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.variant_id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-2 rounded-lg border transition-all duration-200 text-sm ${selectedVariant?.variant_id === variant.variant_id
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                        }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{formatWeight(variant.quantity, variant.unit_type)}</div>
                        <div className="text-green-600 font-bold">{formatPrice(variant.price)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="p-2 rounded-lg border border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  className="p-2 rounded-lg border border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity >= 10}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {selectedVariant && selectedVariant.price != null && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Total: <span className="font-bold">{formatPrice(getTotalPrice())}</span>
                    {quantity > 1 && (
                      <span className="text-green-600 ml-2">
                        ({quantity} × {formatPrice(selectedVariant.price)})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.price == null || product.stock_status === 'out_of_stock'}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            </div>

           
            {nutritionalPoints.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nutritional Benefits</h3>
                <ul className="text-gray-700 text-sm space-y-2">
                  {nutritionalPoints.map((point) => (
                    <li key={point.point_id} className="flex items-start" dangerouslySetInnerHTML={{ __html: renderPointHTML(point, true) }} />
                  ))}
                </ul>
              </div>
            )}



            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span
                  className={`text-xs font-medium ${product.stock_status === 'in_stock' ? 'text-green-800' : 'text-red-800'
                    }`}
                >
                  Stock: {product.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Login Required</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Please log in to add items to your cart.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/login"
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 text-sm"
                  >
                    Login / Sign Up
                  </Link>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;