import React, { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowRight } from 'lucide-react';

// Interface for Terms data
interface TermsSection {
  id: string;
  title: string;
  content: string;
}

// Terms and Conditions page component
const TermsAndConditions: React.FC = () => {
  // Terms data
  const terms: TermsSection[] = [
    {
      id: '1',
      title: 'Introduction',
      content:
        'These terms and conditions ("Terms") are a legally binding agreement between you (the customer) and Microgreen Guy Pvt Ltd regarding the use of our vegetable/microgreen delivery services. By using our services, you acknowledge and agree to abide by these Terms. If you do not agree with these Terms, please do not use our services.',
    },
    {
      id: '2',
      title: 'Service Description',
      content:
        'We provide a vegetable/microgreen delivery service, delivering fresh and high-quality vegetables/microgreens to your specified delivery address. To use our services, you must be at least 18 years old or the legal age of majority in your jurisdiction. By using our services, you confirm that you meet these requirements.',
    },
    {
      id: '3',
      title: 'Orders and Deliveries',
      content:
        'You can place orders for vegetable/microgreen delivery through our website. It is your responsibility to provide accurate and complete information, including your delivery address. Our deliveries are scheduled every day (except specific holidays), and all confirmed orders will be delivered within 48 hours of confirmation. You are responsible for providing an accurate and accessible delivery address. If the delivery is unsuccessful due to incorrect or inaccessible addresses, you may be charged a fee. Delivery to the specified address constitutes successful delivery, even if you are not present to receive it.',
    },
    {
      id: '4',
      title: 'Payment',
      content:
        'You must provide valid payment information to make purchases through our website. Prices for our vegetable/microgreen products are as displayed on our platform and are subject to change without notice. We are not responsible for pricing errors or inaccuracies.',
    },
    {
      id: '5',
      title: 'Cancellations and Returns',
      content:
        'You can cancel your order before the specified order cutoff time, as indicated on our platform. Late cancellations may be subject to a cancellation fee. If you are not satisfied with the quality of our products, please refer to our Refund Policy, which outlines the process for returns and refunds.',
    },
    {
      id: '6',
      title: 'Privacy',
      content:
        'Your use of our services is also governed by our Privacy Policy, which can be found on our platform.',
    },
    {
      id: '7',
      title: 'Limitation of Liability',
      content:
        'While we take every effort to deliver high-quality vegetables/microgreens, we are not responsible for any adverse effects caused by the consumption of our products. We are not liable for any indirect, incidental, special, or consequential damages, including loss of profits or data.',
    },
    {
      id: '8',
      title: 'Changes to Terms',
      content:
        'We reserve the right to modify these Terms at any time. Changes will be effective upon posting on our platform. Your continued use of our services after changes indicates your acceptance of the revised Terms.',
    },
  ];

  // Inject styles dynamically
  useLayoutEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-slideInRight {
        animation: slideInRight 0.7s ease-out forwards;
        animation-delay: calc(var(--i) * 0.2s);
      }

      .animate-fadeInUp {
        animation: fadeInUp 0.7s ease-out forwards;
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
          <div className="text-center animate-fadeInUp">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#FFFFFF] mb-6">
              Terms and Conditions
              <span className="text-[#FBC02D] block">Our Commitment to You</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Understand the terms that govern your use of our website and services.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-md hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 shadow-lg focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
              aria-label="Contact Us"
            >
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Section */}
      <section className="py-20 bg-[#FFFFFF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#1B5E20] mb-4 animate-fadeInUp">
              Our Terms
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Please read these terms carefully to understand your rights and responsibilities.
            </p>
          </div>
          <div className="space-y-8">
            {terms.map((term, index) => (
              <div
                key={term.id}
                className="bg-[#E8F5E9] p-6 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 animate-slideInRight"
                style={{ '--i': index } as React.CSSProperties}
              >
                <h3 className="text-xl font-medium text-[#1B5E20] mb-4">{term.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed bg-[#FFFFFF] p-4 rounded-md">
                  {term.content}
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
            <h2 className="text-3xl font-semibold text-[#1B5E20] mb-4 animate-fadeInUp">
              Need Clarification?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Our team is here to answer any questions about our terms or services.
            </p>
          </div>
          <div className="space-y-8 animate-slideInRight" style={{ '--i': 0 } as React.CSSProperties}>
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
                <h3 className="text-lg font-medium text-[#1B5E20]">Phone</h3>
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
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1B5E20] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#FBC02D] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
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
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#FFFFFF] mb-6 animate-fadeInUp">
            Explore Our Microgreens
          </h2>
          <p className="text-xl text-[#FFFFFF]/90 mb-8">
            Discover fresh, sustainable microgreens to enhance your meals.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-md hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
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

export default TermsAndConditions;