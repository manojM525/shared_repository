// orders.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

interface OrderItem {
  order_item_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  product_name: string;
  variant_quantity: number;
  variant_unit_type: string;
  image_url: string;
}

interface Order {
  order_id: string;
  customer_id: string;
  name: string;
  phone_number: string;
  full_address: string;
  total_amount: number;
  payment_mode: string;
  order_status: string;
  payment_status: string;
  delivery_status: string;
  created_at: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      setNotification({ message: 'Please log in to view your orders', type: 'error' });
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data: Order[] = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setNotification({ message: err instanceof Error ? err.message : 'Failed to load orders', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const getFilteredOrders = () => {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      switch (filter) {
        case 'last6months':
          return orderDate >= sixMonthsAgo;
        case '2023':
          return orderDate.getFullYear() === 2023;
        case '2022':
          return orderDate.getFullYear() === 2022;
        case '2021':
          return orderDate.getFullYear() === 2021;
        default:
          return true; // 'all'
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
            <p className="text-gray-600 mb-8">You need to be logged in to view your orders.</p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
            >
              Log In
            </Link>
          </div> 
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  if (filteredOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {filter === 'all' ? 'No orders yet' : 'No orders found for the selected period'}
            </h2>
            <p className="text-gray-600 mb-8">
              {filter === 'all'
                ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                : 'No orders match the selected time period.'}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {notification && (
          <div
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center z-50 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {notification.message}
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Orders</h1>

        {/* Filter Dropdown */}
        <div className="mb-6">          
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter Orders
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="last6months">Last 6 Months</option>
           
          </select>
        </div>

        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.order_status)}
                    <div>
                      <Link
                        to={`/orders/${order.order_id}`}
                        className="text-lg font-semibold text-gray-900 hover:underline"
                      >
                        Order #{order.order_id}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.order_item_id} className="flex items-center space-x-4">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product_name} ({item.variant_quantity}{item.variant_unit_type})
                        </h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.name}</p>
                    <p>{order.full_address}</p>
                    <p>{order.phone_number}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;