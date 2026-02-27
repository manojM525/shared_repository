import React, { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowRight } from 'lucide-react';

// Interface for Shipping Policy data
interface ShippingSection {
  id: string;
  title: string;
  content: string;
}

// Shipping Policy page component
const ShippingPolicy: React.FC = () => {
  // Shipping Policy data
  const shippingSections: ShippingSection[] = [
    {
      id: '1',
      title: 'Delivery Area',
      content:
        'Microgreen Guy Pvt Ltd provides vegetable and microgreen delivery services exclusively within the city/region of Hyderabad. We do not offer delivery services outside this area at this time.',
    },
    {
      id: '2',
      title: 'Delivery Days and Times',
      content:
        'We offer delivery services on all days, except specific holidays. Deliveries are typically made between 7:00 AM and 7:00 PM.',
    },
    {
      id: '3',
      title: 'Order Placement and Cutoff Time',
      content:
        'To receive a vegetable or microgreen delivery on a specific delivery day, customers must place their orders through our website before the specified order cutoff time, which is typically 10:00 PM the day before the scheduled delivery.',
    },
    {
      id: '4',
      title: 'Delivery Address',
      content:
        'Customers are responsible for providing a complete and accurate delivery address during the order placement process. If the provided address is inaccurate or inaccessible, Microgreen Guy Pvt Ltd cannot guarantee a successful delivery.',
    },
    {
      id: '5',
      title: 'Delivery Confirmation',
      content:
        'Successful delivery is confirmed when the vegetables or microgreens are delivered to the address specified in the order, even if the customer is not present to receive the delivery.',
    },
    {
      id: '6',
      title: 'Late Deliveries',
      content:
        'While we strive to make deliveries within the specified time window, unexpected delays may occur due to factors such as traffic, weather, or other unforeseen circumstances. We will make every effort to inform customers of any significant delays.',
    },
    {
      id: '7',
      title: 'Contacting the Customer',
      content:
        'Our delivery personnel may contact customers via the phone number provided during the order process if there are issues related to the delivery, such as difficulties accessing the delivery address.',
    },
    {
      id: '8',
      title: 'Delivery Fees',
      content:
        'Microgreen Guy Pvt Ltd charges a minimum delivery fee. The specific fee will be disclosed during the order process.',
    },
    {
      id: '9',
      title: 'Delivery Exceptions',
      content:
        'Delivery services may be subject to exceptions or limitations, especially during holidays, special events, or unforeseen situations. Please check our website or contact our customer support team for information regarding exceptions and limitations.',
    },
  ];

  // Inject styles dynamically
  useLayoutEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .animate-scaleIn {
        animation: scaleIn 0.6s ease-out forwards;
        animation-delay: calc(var(--i) * 0.2s);
      }

      .animate-fadeInLeft {
        animation: fadeInLeft 0.6s ease-out forwards;
        animation-delay: calc(var(--i) * 0.2s);
      }

      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }

      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[#E8F5E9]">
      {/* Hero Section */}
      <section className="relative bg-[#1B5E20] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-scaleIn">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#FFFFFF] mb-6">
              Shipping Policy
              <span className="text-[#FBC02D] block">Fresh Deliveries, Made Simple</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Learn about our delivery process for fresh vegetables and microgreens.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-sm hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 shadow-lg focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
              aria-label="Contact Us"
            >
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Shipping Policy Section */}
      <section className="py-20 bg-[#FFFFFF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#1B5E20] mb-4 animate-scaleIn">
              Our Delivery Commitment
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              We ensure fresh and timely deliveries within Hyderabad. Read our policy for details.
            </p>
          </div>
          <div className="space-y-8">
            {shippingSections.map((section, index) => (
              <div
                key={section.id}
                className="bg-[#E8F5E9] p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 animate-fadeInLeft"
                style={{ '--i': index } as React.CSSProperties}
              >
                <h3 className="text-xl font-medium text-[#1B5E20] mb-4">{section.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed bg-[#FFFFFF] p-4 rounded-sm">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-[#E8F5E9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#1B5E20] mb-4 animate-scaleIn">
              Questions About Shipping?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Reach out to our team for more information or assistance with your delivery.
            </p>
          </div>
          <div className="space-y-8 animate-fadeInLeft" style={{ '--i': 0 } as React.CSSProperties}>
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-[#FBC02D] mt-1" />
              <div>
                <h3 className="text-lg font-medium text-[#1B5E20]">Email</h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  <a href="mailto:talk2us@themicrogreenguy.com" className="hover:text-[#FBC02D] transition-colors">
                    talk2us@themicrogreenguy.com
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-[#FBC02D] mt-1" />
              <div>
                <h3 className="text-lg font-medium text-[#1B5E20]">WhatsApp</h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  <a href="tel:+917569507659" className="hover:text-[#FBC02D] transition-colors">
                    +91 75695 07659
                  </a>
                </p>
              </div>
            </div>
            <div>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1B5E20] text-[#FFFFFF] font-semibold rounded-sm hover:bg-[#FBC02D] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
                aria-label="Visit Contact Page"
              >
                Visit Contact Page
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1B5E20]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#FFFFFF] mb-6 animate-scaleIn">
            Shop Our Microgreens
          </h2>
          <p className="text-xl text-[#FFFFFF]/90 mb-8">
            Order fresh, sustainable microgreens with reliable delivery in Hyderabad.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-sm hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
            aria-label="Shop Now"
          >
            Shop Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ShippingPolicy;