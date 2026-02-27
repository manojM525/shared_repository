import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';

// Declare Razorpay interface to fix TypeScript error
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: any) => void) => void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

// Interfaces
interface Address {
  address_id: string;
  name: string;
  phone_number: string;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  address_type: string;
  full_address: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: {
    variant_id: string;
    quantity: number | string;
    unit_type: string;
  };
}

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  items: CartItem[];
  total: number;
  date: string;
}

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    phone_number: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'Home',
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'razorpay'>('cash');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [shipping, setShipping] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [subtotal, setSubtotal] = useState(totalPrice);

  // Calculate total
  const total = Number((subtotal + shipping - couponDiscount).toFixed(2));

  // Update subtotal when totalPrice changes
  useEffect(() => {
    setSubtotal(totalPrice);
  }, [totalPrice]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => console.log('Razorpay script loaded');
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setNotification({ message: 'Failed to load payment gateway', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Inject styles
  useLayoutEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .animate-pulse {
        animation: pulse 1.5s ease-in-out infinite;
      }

      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out forwards;
        animation-delay: calc(var(--i) * 0.2s);
      }

      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }

      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      input, select {
        transition: all 0.3s ease;
      }

      input:focus, select:focus {
        outline: none;
        ring: 2px solid #FBC02D;
        box-shadow: 0 0 0 3px rgba(251, 192, 45, 0.3);
      }

      button {
        transition: background-color 0.3s ease, transform 0.2s ease;
      }

      button:hover:not(:disabled) {
        background-color: #FBC02D;
        color: #1B5E20;
        transform: translateY(-2px);
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      } 
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch saved addresses
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setSavedAddresses([]);
      return;
    }

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/orders/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch addresses');
        const addresses = await response.json();
        setSavedAddresses(addresses);
      } catch (err) {
        console.error('Fetch addresses error:', err);
        setNotification({ message: 'Failed to load saved addresses', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, user]);

  // Validate address fields
  const validateAddress = () => {
    const { address, city, state, pincode } = shippingInfo;
    if (!address || !city || !state || !pincode) {
      return false;
    }
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return false;
    }
    return true;
  };

  // Fetch shipping cost
  const fetchShippingCost = async () => {
    if (!validateAddress()) {
      setNotification({ message: 'Please provide a valid address and 6-digit pincode', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      setShipping(0);
      setDistance(0);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const full_address = `${shippingInfo.address}${shippingInfo.landmark ? ', ' + shippingInfo.landmark : ''}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.pincode}, India`;
      console.log('Sending address for shipping calculation:', full_address);

      const response = await fetch(`${API_BASE_URL}/orders/calculate-shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingInfo: { full_address },
          items: items.map((item) => ({
            variant_id: item.variant.variant_id,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch shipping cost');
      }

      const { shipping: shippingCost, distanceInKm, subtotal: serverSubtotal } = await response.json();
      console.log('Received shipping response:', { shippingCost, distanceInKm, serverSubtotal });

      setShipping(Number(shippingCost.toFixed(2)));
      setDistance(distanceInKm);
      setSubtotal(Number(serverSubtotal.toFixed(2)));
    } catch (err) {
      console.error('Fetch shipping cost error:', err);
      setNotification({ message: 'Unable to calculate shipping cost. Please try a different address.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      setShipping(0);
      setDistance(0);
    }
  };

  // Fetch shipping cost when address changes or step changes to 2
  useEffect(() => {
    if (step === 2 && validateAddress()) {
      fetchShippingCost();
    }
  }, [step, shippingInfo]);

  // Handle shipping info change
  const handleShippingChange = (field: keyof typeof shippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    setSelectedAddressId(null);
  };

  // Handle address selection
  const handleAddressSelect = (address: Address) => {
    setShippingInfo({
      name: address.name,
      phone_number: address.phone_number,
      address: address.address,
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      address_type: address.address_type,
    });
    setSelectedAddressId(address.address_id);
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!coupon) {
      setNotification({ message: 'Please enter a coupon code', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    try {
      const token = localStorage.getItem('token'); // Retrieve the token
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch(`${API_BASE_URL}/orders/apply-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add the Authorization header
        },
        body: JSON.stringify({ coupon_code: coupon }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid coupon');
      }
      const { discount } = await response.json();
      setCouponDiscount(Number((subtotal * (discount / 100)).toFixed(2)));
      setNotification({ message: 'Coupon applied successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Apply coupon error:', err);
      setNotification({ message: 'Invalid or expired coupon', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Validate and proceed from Address step
  const handleAddressContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !shippingInfo.name ||
      !shippingInfo.phone_number ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.pincode ||
      !shippingInfo.address_type
    ) {
      setNotification({ message: 'Please fill in all required shipping fields', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (!validateAddress()) {
      setNotification({ message: 'Please provide a valid 6-digit pincode', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setStep(2);
  };

  // Proceed from Order Summary step
  const handleOrderSummaryContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setNotification({ message: 'Your cart is empty', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (shipping === 0) {
      setNotification({ message: 'Shipping cost not calculated. Please update your address.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setStep(3);
  };

  // Download invoice as PDF
  const downloadInvoice = () => {
    if (!invoice) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Invoice: ${invoice.invoice_number}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Customer: ${invoice.customer_name}`, 20, 30);
    doc.text(`Email: ${invoice.customer_email}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 50);
    doc.text('Items:', 20, 60);
    invoice.items.forEach((item, index) => {
      doc.text(
        `${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`,
        20,
        70 + index * 10
      );
    });
    doc.text(`Shipping: ₹${shipping.toFixed(2)} (${distance.toFixed(2)} km)`, 20, 70 + invoice.items.length * 10);
    doc.text(`Total: ₹${invoice.total.toFixed(2)}`, 20, 70 + invoice.items.length * 10 + 10);
    doc.save(`invoice-${invoice.invoice_number}.pdf`);
  };

  // Handle order submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setNotification({ message: 'Please log in to place an order', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (items.length === 0) {
      setNotification({ message: 'Your cart is empty', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (shipping === 0) {
      setNotification({ message: 'Shipping cost not calculated. Please update your address.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const validItems = items.filter((item) => {
      if (!item.variant?.variant_id) {
        console.warn('Skipping invalid cart item:', item);
        return false;
      }
      return true;
    });

    if (validItems.length === 0) {
      setNotification({ message: 'No valid items in cart', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    console.log('Cart items before submitting order:', validItems);

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        shippingInfo,
        payment_mode: paymentMode,
        saveAddress: selectedAddressId ? false : saveAddress,
        items: validItems.map((item) => ({
          variant_id: item.variant.variant_id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        total,
        shippingCost: shipping,
        distanceInKm: distance,
        coupon_code: couponDiscount ? coupon : null,
      };

      console.log('Sending order data:', orderData);

      if (paymentMode === 'razorpay') {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Razorpay order creation failed:', errorData);
          throw new Error(errorData.message || errorData.error || 'Failed to create Razorpay order');
        }

        const { razorpay_order_id, razorpay_key_id, total_amount, shipping: shippingCost, distanceInKm } = await response.json();
        console.log('Received Razorpay response:', { razorpay_order_id, razorpay_key_id, total_amount, shippingCost, distanceInKm });

        setShipping(Number(shippingCost.toFixed(2)));
        setDistance(distanceInKm);

        if (!razorpay_order_id || !razorpay_key_id || !window.Razorpay) {
          throw new Error('Razorpay script not loaded or invalid response from server');
        }

        const options: RazorpayOptions = {
          key: razorpay_key_id,
          amount: Math.round(total_amount * 100),
          currency: 'INR',
          name: 'TheMicroGreenGuy',
          description: 'Order Payment',
          order_id: razorpay_order_id,
          handler: async function (response: any) {
            console.log('Razorpay payment response:', response);
            try {
              const verifyResponse = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  order_id: null,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                throw new Error(errorData.message || 'Payment verification failed');
              }

              const finalizeResponse = await fetch(`${API_BASE_URL}/orders/finalize`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...orderData,
                  razorpay_order_id,
                }),
              });

              if (!finalizeResponse.ok) {
                const errorData = await finalizeResponse.json();
                throw new Error(errorData.message || 'Failed to finalize order');
              }

              const { order_id } = await finalizeResponse.json();

              const invoiceResponse = await fetch(`${API_BASE_URL}/orders/generate-invoice`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  order_id,
                  customer_name: shippingInfo.name,
                  customer_email: user?.email || 'customer@example.com',
                  items: validItems,
                  total,
                }),
              });

              if (!invoiceResponse.ok) throw new Error('Failed to generate invoice');
              const invoiceData = await invoiceResponse.json();
              setInvoice({
                invoice_id: invoiceData.invoice_id,
                invoice_number: `INV-${order_id}`,
                customer_name: shippingInfo.name,
                customer_email: user?.email || 'customer@example.com',
                items: validItems,
                total,
                date: new Date().toISOString(),
              });

              await clearCart();
              setStep(4);
              setNotification({ message: 'Order placed successfully!', type: 'success' });
              setTimeout(() => {
                navigate(`/orders/${order_id}`);
              }, 3000);
            } catch (err) {
              console.error('Payment verification or finalization error:', err);
              setNotification({
                message: err instanceof Error ? err.message : 'Failed to process payment',
                type: 'error',
              });
              setTimeout(() => setNotification(null), 3000);
            }
          },
          prefill: {
            name: shippingInfo.name,
            email: user?.email || 'customer@example.com',
            contact: shippingInfo.phone_number,
          },
          theme: {
            color: '#1B5E20',
          },
          modal: {
            ondismiss: () => {
              console.log('Razorpay modal dismissed');
              setNotification({ message: 'Payment cancelled by user', type: 'error' });
              setTimeout(() => setNotification(null), 3000);
              setIsProcessing(false);
            },
          },
        };

        console.log('Razorpay options:', options);

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response: any) {
            console.error('Razorpay payment failed:', response.error);
            setNotification({
              message: `Payment failed: ${response.error.description || 'Unknown error'}`,
              type: 'error',
            });
            setTimeout(() => setNotification(null), 3000);
            setIsProcessing(false);
          });
          rzp.open();
        } catch (err) {
          console.error('Razorpay initialization error:', err);
          setNotification({
            message: 'Failed to initialize payment gateway',
            type: 'error',
          });
          setTimeout(() => setNotification(null), 3000);
          setIsProcessing(false);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Order creation failed:', errorData);
          throw new Error(errorData.message || 'Failed to place order');
        }

        const { order_id, shipping: shippingCost, distanceInKm } = await response.json();
        setShipping(Number(shippingCost.toFixed(2)));
        setDistance(distanceInKm);

        const invoiceResponse = await fetch(`${API_BASE_URL}/orders/generate-invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id,
            customer_name: shippingInfo.name,
            customer_email: user?.email || 'customer@example.com',
            items: validItems,
            total,
          }),
        });

        if (!invoiceResponse.ok) throw new Error('Failed to generate invoice');
        const invoiceData = await invoiceResponse.json();
        setInvoice({
          invoice_id: invoiceData.invoice_id,
          invoice_number: `INV-${order_id}`,
          customer_name: shippingInfo.name,
          customer_email: user?.email || 'customer@example.com',
          items: validItems,
          total,
          date: new Date().toISOString(),
        });

        await clearCart();
        setStep(4);
        setNotification({ message: 'Order placed successfully!', type: 'success' });
        setTimeout(() => {
          navigate(`/orders/${order_id}`);
        }, 3000);
      }
    } catch (err) {
      console.error('Place order error:', err);
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to place order',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-[#1B5E20] mb-8 text-center animate-fadeIn">
          Checkout
        </h1>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          {['Address', 'Order Summary', 'Payment', 'Confirmation'].map((label, index) => (
            <div key={`step-${index + 1}`} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step > index + 1
                    ? 'bg-[#FBC02D] text-[#1B5E20]'
                    : step === index + 1
                    ? 'bg-[#1B5E20] text-[#FFFFFF]'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-sm text-gray-700 mt-2">{label}</span>
            </div>
          ))}
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white flex items-center z-50 animate-fadeIn ${
              notification.type === 'success' ? 'bg-[#1B5E20]' : 'bg-red-500'
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

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="bg-[#FFFFFF] p-6 rounded-md shadow-md animate-fadeIn">
            <h2 className="text-xl font-medium text-[#1B5E20] mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" /> Shipping Address
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#1B5E20] mb-2">Saved Addresses</h3>
              {isLoadingAddresses ? (
                <p className="text-gray-600">Loading addresses...</p>
              ) : savedAddresses.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
                  {savedAddresses.map((address, index) => (
                    <div
                      key={address.address_id}
                      className={`p-4 border rounded-md cursor-pointer transition-colors ${
                        selectedAddressId === address.address_id
                          ? 'border-[#FBC02D] bg-[#E8F5E9]'
                          : 'border-gray-200 hover:border-[#FBC02D]'
                      }`}
                      onClick={() => handleAddressSelect(address)}
                      style={{ '--i': index } as React.CSSProperties}
                    >
                      <p className="font-medium text-[#1B5E20]">{address.name}</p>
                      <p className="text-sm text-gray-600">{address.full_address}</p>
                      <p className="text-sm text-gray-600">Phone: {address.phone_number}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No saved addresses</p>
              )}
            </div>
            <form onSubmit={handleAddressContinue}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    value={shippingInfo.name}
                    onChange={(e) => handleShippingChange('name', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md text-sm"
                    placeholder="Enter full name"
                    aria-label="Full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    value={shippingInfo.phone_number}
                    onChange={(e) => handleShippingChange('phone_number', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md text-sm"
                    placeholder="Enter phone number"
                    aria-label="Phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => handleShippingChange('address', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md text-sm"
                    placeholder="Enter address"
                    aria-label="Address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Landmark</label>
                  <input
                    type="text"
                    value={shippingInfo.landmark}
                    onChange={(e) => handleShippingChange('landmark', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md text-sm"
                    placeholder="Enter landmark (optional)"
                    aria-label="Landmark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => handleShippingChange('city', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md text-sm"
                    placeholder="Enter city"
                    aria-label="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State *</label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) => handleShippingChange('state', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md text-sm"
                    placeholder="Enter state"
                    aria-label="State"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode *</label>
                  <input
                    type="text"
                    value={shippingInfo.pincode}
                    onChange={(e) => handleShippingChange('pincode', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md text-sm"
                    placeholder="Enter 6-digit pincode"
                    aria-label="Pincode"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Type *</label>
                  <select
                    value={shippingInfo.address_type}
                    onChange={(e) => handleShippingChange('address_type', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md text-sm"
                    aria-label="Address type"
                    required
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 text-[#1B5E20] border-gray-300 rounded"
                    id="saveAddress"
                    disabled={!!selectedAddressId}
                    aria-label="Save address for future use"
                  />
                  <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700">
                    Save address for future use
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-[#1B5E20] text-[#FFFFFF] py-2 rounded-md font-medium animate-pulse"
                aria-label="Continue to order summary"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Order Summary */}
        {step === 2 && (
          <div className="bg-[#FFFFFF] p-6 rounded-md shadow-md animate-fadeIn">
            <h2 className="text-xl font-medium text-[#1B5E20] mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-4" style={{ '--i': index } as React.CSSProperties}>
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div>
                    <p className="font-medium text-[#1B5E20]">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Shipping ({distance.toFixed(2)} km)</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#1B5E20]">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-[#1B5E20]">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  className="p-2 border rounded-md text-sm flex-1"
                  placeholder="Enter coupon code"
                  aria-label="Coupon code"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-[#1B5E20] text-[#FFFFFF] py-2 px-4 rounded-md font-medium"
                  aria-label="Apply coupon"
                >
                  Apply
                </button>
              </div>
              <button
                onClick={handleOrderSummaryContinue}
                className="mt-4 w-full bg-[#1B5E20] text-[#FFFFFF] py-2 rounded-md font-medium animate-pulse"
                aria-label="Continue to payment"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="bg-[#FFFFFF] p-6 rounded-md shadow-md animate-fadeIn">
            <h2 className="text-xl font-medium text-[#1B5E20] mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" /> Payment Method
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cash"
                  name="paymentMode"
                  value="cash"
                  checked={paymentMode === 'cash'}
                  onChange={() => setPaymentMode('cash')}
                  className="h-4 w-4 text-[#1B5E20] border-gray-300"
                  aria-label="Cash on Delivery"
                />
                <label htmlFor="cash" className="ml-2 text-sm text-gray-700">
                  Cash on Delivery
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="razorpay"
                  name="paymentMode"
                  value="razorpay"
                  checked={paymentMode === 'razorpay'}
                  onChange={() => setPaymentMode('razorpay')}
                  className="h-4 w-4 text-[#1B5E20] border-gray-300"
                  aria-label="Pay with Razorpay"
                />
                <label htmlFor="razorpay" className="ml-2 text-sm text-gray-700">
                  Pay with Razorpay
                </label>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="mt-4 w-full bg-[#1B5E20] text-[#FFFFFF] py-2 rounded-md font-medium animate-pulse disabled:opacity-60"
                aria-label="Place order"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="bg-[#FFFFFF] p-6 rounded-md shadow-md animate-fadeIn text-center">
            <h2 className="text-xl font-medium text-[#1B5E20] mb-4 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 mr-2" /> Order Confirmed
            </h2>
            <p className="text-gray-700 mb-4">
              Thank you for your order! You'll receive a confirmation soon.
            </p>
            {invoice && (
              <button
                onClick={downloadInvoice}
                className="bg-[#1B5E20] text-[#FFFFFF] py-2 px-4 rounded-md font-medium flex items-center mx-auto"
                aria-label="Download Invoice"
              >
                <FileText className="h-5 w-5 mr-2" /> Download Invoice
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-[#FBC02D] text-[#1B5E20] py-2 px-4 rounded-md font-medium"
              aria-label="Continue Shopping"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;