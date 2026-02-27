// orderconfirmation.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Download, XCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';

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
  shipping_cost: number;
  distance_km: number;
  cancel_reason?: string;
  cancelled_at?: string;
  delivered_at?: string;  // Added for 2-day check
  razorpay_payment_id?: string;
  items: OrderItem[];
}

const OrderConfirmation: React.FC = () => {
  const { order_id } = useParams<{ order_id: string }>();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotification({ message: 'Please log in to view order details', type: 'error' });
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/orders/${order_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Fetch order error:', err);
        setNotification({ message: err instanceof Error ? err.message : 'Failed to load order details', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [order_id, isAuthenticated]);

  const canCancelOrder = () => {
    return order?.order_status !== 'cancelled' && order?.delivery_status !== 'shipped' && order?.delivery_status !== 'delivered';
  };

  const canReturnOrder = () => {
    if (!order || order.order_status !== 'confirmed' || order.delivery_status !== 'delivered' || order.payment_status !== 'completed') {
      return false;
    }
    if (order.delivered_at) {
      const daysSinceDelivery = (Date.now() - new Date(order.delivered_at).getTime()) / (1000 * 3600 * 24);
      if (daysSinceDelivery > 2) {
        return false;
      }
    }
    return true;
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setNotification({ message: 'Please select a reason for cancellation', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${order_id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      setOrder({ ...order!, order_status: 'cancelled', cancel_reason: cancelReason, cancelled_at: new Date().toISOString() });
      setNotification({ message: 'Order cancelled successfully', type: 'success' });
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      setNotification({ message: err instanceof Error ? err.message : 'Failed to cancel order', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnItem = async () => {
    if (!returnReason.trim() || !selectedItemForReturn) {
      setNotification({ message: 'Please select a reason and quantity for return', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (returnQuantity < 1 || returnQuantity > selectedItemForReturn.quantity) {
      setNotification({ message: 'Invalid return quantity', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${order_id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_item_id: selectedItemForReturn.order_item_id,
          quantity: returnQuantity,
          reason: returnReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process return');
      }

      setNotification({ message: 'Return request submitted successfully', type: 'success' });
      setShowReturnModal(false);
      setReturnReason('');
      setReturnQuantity(1);
      setSelectedItemForReturn(null);
      // Refresh order details
      const fetchOrder = async () => {
        const res = await fetch(`${API_BASE_URL}/orders/${order_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      };
      fetchOrder();
    } catch (err) {
      setNotification({ message: err instanceof Error ? err.message : 'Failed to process return', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Invoice: INV-${order.order_id}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Customer: ${order.name}`, 20, 30);
    doc.text(`Phone: ${order.phone_number}`, 20, 40);
    doc.text(`Address: ${order.full_address}`, 20, 50);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 60);
    doc.text('Items:', 20, 70);
    let yPos = 80;
    order.items.forEach((item) => {
      doc.text(
        `${item.product_name} (${item.variant_quantity}${item.variant_unit_type}) - Qty: ${item.quantity} - ₹${(item.unit_price * item.quantity).toFixed(2)}`,
        20,
        yPos
      );
      yPos += 10;
    });
    doc.text(`Shipping: ₹${order.shipping_cost.toFixed(2)} (${order.distance_km.toFixed(2)} km)`, 20, yPos);
    yPos += 10;
    doc.text(`Total: ₹${order.total_amount.toFixed(2)}`, 20, yPos);
    doc.save(`invoice-${order.order_id}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-8">The order you are looking for does not exist or you do not have access to it.</p>
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
    <div className="min-h-screen bg-gray-50 py-12">
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

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
          </div>
          <p className="text-lg text-gray-700 mb-4">Thank you for your order! Your order ID is <strong>{order.order_id}</strong>.</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={downloadInvoice}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Invoice
            </button>
            {canCancelOrder() && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
                disabled={isProcessing}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Cancel Order
              </button>
            )}
            {canReturnOrder() && (
              <button
                onClick={() => setShowReturnModal(true)}
                // className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"
                disabled={isProcessing}
              >
                {/* <RotateCcw className="h-5 w-5 mr-2" /> */}
                {/* Return Item */}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.order_item_id} className="flex items-center space-x-4">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product_name} ({item.variant_quantity}{item.variant_unit_type})
                      </h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{(item.unit_price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <p className="text-gray-600">{order.name}</p>
              <p className="text-gray-600">{order.full_address}</p>
              <p className="text-gray-600">{order.phone_number}</p>
            </div>

            {/* Order Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
              <p className="text-gray-600">Order Status: {order.order_status}</p>
              <p className="text-gray-600">Payment Status: {order.payment_status}</p>
              <p className="text-gray-600">Delivery Status: {order.delivery_status}</p>
              <p className="text-gray-600">Payment Mode: {order.payment_mode}</p>
              <p className="text-gray-600">Ordered On: {new Date(order.created_at).toLocaleString()}</p>
              {order.cancel_reason && (
                <p className="text-gray-600">Cancel Reason: {order.cancel_reason}</p>
              )}
              {order.cancelled_at && (
                <p className="text-gray-600">Cancelled At: {new Date(order.cancelled_at).toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancel Order</h2>
              <p className="text-gray-600 mb-4">Please select a reason for cancellation:</p>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4"
              >
                <option value="">Select a reason</option>
                <option value="changed_mind">Changed my mind</option>
                <option value="ordered_by_mistake">Ordered by mistake</option>
                <option value="found_better_price">Found a better price elsewhere</option>
                <option value="other">Other</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isProcessing || !cancelReason}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Item</h2>
              <p className="text-gray-600 mb-4">Select the item to return and provide a reason:</p>
              <select
                onChange={(e) => {
                  const item = order.items.find((item) => item.order_item_id === e.target.value);
                  setSelectedItemForReturn(item || null);
                  setReturnQuantity(1);
                }}
                className="w-full p-2 border rounded-lg mb-4"
              >
                <option value="">Select an item</option>
                {order.items.map((item) => (
                  <option key={item.order_item_id} value={item.order_item_id}>
                    {item.product_name} ({item.variant_quantity}{item.variant_unit_type})
                  </option>
                ))}
              </select>
              {selectedItemForReturn && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Return (Max: {selectedItemForReturn.quantity})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItemForReturn.quantity}
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg mb-4"
                  />
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-4"
                  >
                    <option value="">Select a reason</option>
                    <option value="damaged">Damaged or defective</option>
                    <option value="wrong_item">Wrong item received</option>
                    <option value="not_as_expected">Not as expected</option>
                    <option value="other">Other</option>
                  </select>
                </>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedItemForReturn(null);
                    setReturnReason('');
                    setReturnQuantity(1);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={handleReturnItem}
                  disabled={isProcessing || !selectedItemForReturn || !returnReason || returnQuantity < 1}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Submit Return'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;