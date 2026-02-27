// cart.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      await updateQuantity(id, quantity);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveFromCart = async (id: string) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      await removeFromCart(id);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-green-600 font-bold">{formatPrice(item.price)}</p>
                    <p className="text-gray-600">Total: {formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-2 rounded-lg border border-gray-300 hover:border-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1 || loadingStates[item.id]}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-lg border border-gray-300 hover:border-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity >= 10 || loadingStates[item.id]}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loadingStates[item.id]}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice + 0)}</span>
                </div>
              </div>
            </div>

            <Link 
              to="/checkout"
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-200 block text-center"
            >
              Proceed to Checkout
            </Link>

            <Link 
              to="/products"
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-green-500 hover:text-green-500 transition-colors duration-200 block text-center mt-4"
            >
              Continue Purchasing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;